import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { isAdminAuthenticated } from '@/lib/admin-auth';

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: donation, error: fetchError } = await supabase
    .from('donations')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !donation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (donation.payment_method !== 'bank_transfer' || donation.status !== 'pending') {
    return NextResponse.json({ error: 'Invalid donation for confirm' }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from('donations')
    .update({
      status: 'completed',
      deposit_confirmed_at: new Date().toISOString(),
      deposit_confirmed_by: 'admin',
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  if (resend && donation.email) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'donation@resend.dev',
        to: donation.email,
        subject: `[심리연구소] 기부금 입금 확인 - ${donation.amount.toLocaleString()}원`,
        html: `
          <h2>입금이 확인되었습니다</h2>
          <p>${donation.name}님, 감사합니다.</p>
          <ul>
            <li>강의: ${donation.lecture_title}</li>
            <li>금액: ${donation.amount.toLocaleString()}원</li>
            <li>확인일시: ${new Date().toLocaleString('ko-KR')}</li>
          </ul>
        `,
      });
    } catch (e) {
      console.error('Email send error:', e);
    }
  }

  return NextResponse.json({ success: true });
}
