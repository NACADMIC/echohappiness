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
      <div className="text-center py-12">
        <p className="text-slate-600">결제 확인 중...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">결제 처리 중 오류가 발생했습니다.</p>
        <Link href="/" className="mt-4 inline-block text-emerald-600 underline">
          홈으로
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💛</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">결제가 완료되었습니다</h1>
          <p className="text-slate-600 mt-2">카카오페이 결제가 성공적으로 완료되었습니다.</p>
          <p className="mt-4 text-slate-500 text-sm">
            확인 이메일이 발송되었습니다.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block w-full py-3 text-center bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
          >
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function KakaopaySuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">로딩 중...</p>
      </div>
    }>
      <KakaopaySuccessContent />
    </Suspense>
  );
}
