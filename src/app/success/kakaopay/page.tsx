'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function KakaopaySuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const pgToken = searchParams.get('pg_token');
    const donationId = searchParams.get('donation_id');

    if (!pgToken || !donationId) {
      setStatus('error');
      return;
    }

    fetch('/api/donations/kakaopay/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pg_token: pgToken, donation_id: donationId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
          <p className="text-stone-600">결제 확인 중...</p>
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-red-600">결제 처리 중 오류가 발생했습니다.</p>
          <Link href="/" className="mt-6 inline-block w-full rounded-2xl bg-emerald-500 py-4 font-semibold text-white">
            홈으로
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/80 to-white p-4">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <span className="text-4xl">💛</span>
            </div>
            <h1 className="text-xl font-bold text-stone-800">결제가 완료되었습니다</h1>
            <p className="mt-2 text-stone-600">카카오페이 결제가 성공적으로 완료되었습니다.</p>
            <p className="mt-4 text-sm text-stone-500">확인 이메일이 발송되었습니다.</p>
            <Link
              href="/"
              className="mt-8 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-white shadow-lg shadow-emerald-500/30"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function KakaopaySuccessPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
      </main>
    }>
      <KakaopaySuccessContent />
    </Suspense>
  );
}
