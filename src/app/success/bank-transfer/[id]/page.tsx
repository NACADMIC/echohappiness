import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

export default async function BankTransferSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = getSupabase();
  const { data: donation, error } = await supabase
    .from('donations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !donation) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600">입금 신청 정보를 찾을 수 없습니다.</p>
          <Link href="/" className="mt-4 inline-block text-emerald-600 underline">
            홈으로
          </Link>
        </div>
      </main>
    );
  }

  const bankName = process.env.BANK_NAME || 'OO은행';
  const bankAccount = process.env.BANK_ACCOUNT || '123-456-789012';
  const accountHolder = process.env.ACCOUNT_HOLDER || '심리연구소';

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">입금 신청이 완료되었습니다</h1>
          <p className="text-slate-600 mt-2">
            아래 계좌로 입금해 주시면 확인 후 이메일로 연락드리겠습니다.
          </p>
        </div>

        <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
          <div>
            <span className="text-sm text-slate-500">입금 계좌</span>
            <p className="font-semibold">{bankName} {bankAccount}</p>
            <p className="text-sm text-slate-600">{accountHolder}</p>
          </div>
          <div>
            <span className="text-sm text-slate-500">입금 금액</span>
            <p className="font-semibold text-lg">{donation.amount.toLocaleString()}원</p>
          </div>
          <div>
            <span className="text-sm text-slate-500">입금자명 (필수)</span>
            <p className="font-mono font-semibold text-emerald-600 bg-white px-3 py-2 rounded border">
              {donation.deposit_name_format}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              예: 홍길동1234 (이름 + 연락처 끝 4자리)
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-600 text-center">
          입금 확인 후 {donation.email}로 확인 이메일이 발송됩니다.
        </p>

        <Link
          href="/"
          className="mt-8 block w-full py-3 text-center bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
