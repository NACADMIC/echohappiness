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
      <main className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-card">
          <p className="text-red-600">입금 신청 정보를 찾을 수 없습니다.</p>
          <Link href="/" className="mt-6 inline-block rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white">
            홈으로
          </Link>
        </div>
      </main>
    );
  }

  const bankName = process.env.BANK_NAME || 'OO은행';
  const bankAccount = process.env.BANK_ACCOUNT || '123-456-789012';
  const accountHolder = process.env.ACCOUNT_HOLDER || '에코행복연구소 자유후원';

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/80 to-white p-4 pb-8">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-xl font-bold text-stone-800">입금 신청이 완료되었습니다</h1>
            <p className="mt-2 text-stone-600">
              아래 계좌로 입금해 주시면 확인 후 이메일로 연락드리겠습니다.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl bg-stone-50 p-5">
            <div>
              <span className="text-xs font-medium text-stone-500">입금 계좌</span>
              <p className="mt-1 font-semibold text-stone-800">{bankName} {bankAccount}</p>
              <p className="text-sm text-stone-600">{accountHolder}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-stone-500">입금 금액</span>
              <p className="mt-1 text-xl font-bold text-emerald-600">{donation.amount.toLocaleString()}원</p>
            </div>
            <div>
              <span className="text-xs font-medium text-stone-500">입금자명 (필수)</span>
              <p className="mt-2 rounded-xl bg-white px-4 py-3 font-mono text-lg font-semibold text-emerald-600 shadow-inner">
                {donation.deposit_name_format}
              </p>
              <p className="mt-1.5 text-xs text-stone-500">예: 홍길동1234 (이름 + 연락처 끝 4자리)</p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-stone-600">
            입금 확인 후 <strong>{donation.email}</strong>로 확인 이메일이 발송됩니다.
          </p>

          <Link
            href="/"
            className="mt-8 flex min-h-[52px] items-center justify-center rounded-2xl bg-stone-100 font-semibold text-stone-700 transition hover:bg-stone-200 active:scale-[0.98]"
          >
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
