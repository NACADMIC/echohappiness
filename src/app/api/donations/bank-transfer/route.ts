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

    const phoneLast4 = phone.replace(/\D/g, '').slice(-4);
    const deposit_name_format = `${name}${phoneLast4}`;

    let resident_number_encrypted: string | null = null;
    if (receipt_required && resident_number_prefix) {
      resident_number_encrypted = encrypt(resident_number_prefix);
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('donations')
      .insert({
        lecture_title,
        lecture_description: lecture_description || null,
        amount: Number(amount),
        payment_method: 'bank_transfer',
        status: 'pending',
        name,
        phone,
        email,
        receipt_required: !!receipt_required,
        resident_number_encrypted,
        deposit_name_format,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '서버 오류' },
      { status: 500 }
    );
  }
}
