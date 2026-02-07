import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { encrypt } from '@/lib/crypto';

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lecture_title,
      lecture_description,
      amount,
      name,
      phone,
      email,
      receipt_required,
      resident_number_prefix,
    } = body;

    if (!lecture_title || !name || !phone || !email || !amount) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    const cid = process.env.KAKAOPAY_CID;
    const secret = process.env.KAKAOPAY_SECRET;

    if (!cid || !secret) {
      return NextResponse.json(
        { error: '카카오페이 설정이 필요합니다.' },
        { status: 500 }
      );
    }

    let resident_number_encrypted: string | null = null;
    if (receipt_required && resident_number_prefix) {
      resident_number_encrypted = encrypt(resident_number_prefix);
    }

    const supabase = getSupabase();
    const { data: donation, error: insertError } = await supabase
      .from('donations')
      .insert({
        lecture_title,
        lecture_description: lecture_description || null,
        amount: Number(amount),
        payment_method: 'kakaopay',
        status: 'pending',
        name,
        phone,
        email,
        receipt_required: !!receipt_required,
        resident_number_encrypted,
        kakaopay_order_id: `DON-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      })
      .select('id, kakaopay_order_id')
      .single();

    if (insertError) {
      console.error('Supabase error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const kakaoRes = await fetch('https://open-api.kakaopay.com/online/v1/payment/ready', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `SECRET_KEY ${secret}`,
      },
      body: JSON.stringify({
        cid,
        partner_order_id: donation.kakaopay_order_id,
        partner_user_id: donation.id,
        item_name: `[에코행복연구소 자유후원] ${lecture_title}`,
        quantity: 1,
        total_amount: Number(amount),
        tax_free_amount: 0,
        approval_url: `${baseUrl}/success/kakaopay?donation_id=${donation.id}`,
        cancel_url: `${baseUrl}/cancel`,
        fail_url: `${baseUrl}/fail`,
      }),
    });

    const kakaoData = await kakaoRes.json();

    if (!kakaoRes.ok || kakaoData.code !== 0) {
      return NextResponse.json(
        { error: kakaoData.msg || '카카오페이 API 오류' },
        { status: 500 }
      );
    }

    await supabase
      .from('donations')
      .update({ kakaopay_tid: kakaoData.tid })
      .eq('id', donation.id);

    return NextResponse.json({
      tid: kakaoData.tid,
      next_redirect_pc_url: kakaoData.next_redirect_pc_url,
      next_redirect_mobile_url: kakaoData.next_redirect_mobile_url,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '서버 오류' },
      { status: 500 }
    );
  }
}
