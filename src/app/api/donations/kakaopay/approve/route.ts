import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const { pg_token, donation_id } = await req.json();

    if (!pg_token || !donation_id) {
      return NextResponse.json(
        { error: '필수 파라미터가 없습니다.' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { data: donation, error: fetchError } = await supabase
      .from('donations')
      .select('*')
      .eq('id', donation_id)
      .single();

    if (fetchError || !donation) {
      return NextResponse.json({ error: '결제 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    const cid = process.env.KAKAOPAY_CID;
    const secret = process.env.KAKAOPAY_SECRET;

    if (!cid || !secret) {
      return NextResponse.json({ error: '카카오페이 설정이 필요합니다.' }, { status: 500 });
    }

    const kakaoRes = await fetch('https://open-api.kakaopay.com/online/v1/payment/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `SECRET_KEY ${secret}`,
      },
      body: JSON.stringify({
        cid,
        tid: donation.kakaopay_tid,
        partner_order_id: donation.kakaopay_order_id,
        partner_user_id: donation.id,
        pg_token,
      }),
    });

    const kakaoData = await kakaoRes.json();

    if (!kakaoRes.ok || kakaoData.code !== 0) {
      return NextResponse.json(
        { error: kakaoData.msg || '카카오페이 승인 오류' },
        { status: 500 }
      );
    }

    await supabase
      .from('donations')
      .update({ status: 'completed' })
      .eq('id', donation_id);

    const resend = new Resend(process.env.RESEND_API_KEY);
    if (resend && donation.email) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'donation@resend.dev',
          to: donation.email,
          subject: `[심리연구소] 기부금 결제 완료 - ${donation.amount.toLocaleString()}원`,
          html: `
            <h2>기부금 결제가 완료되었습니다</h2>
            <p>${donation.name}님, 감사합니다.</p>
            <ul>
              <li>강의: ${donation.lecture_title}</li>
              <li>금액: ${donation.amount.toLocaleString()}원</li>
              <li>결제일시: ${new Date().toLocaleString('ko-KR')}</li>
            </ul>
          `,
        });
      } catch (e) {
        console.error('Email send error:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '서버 오류' },
      { status: 500 }
    );
  }
}
