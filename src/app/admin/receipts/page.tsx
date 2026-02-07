'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Donation = {
  id: string;
  name: string;
  amount: number;
  email: string;
  receipt_required: boolean;
  status: string;
  created_at: string;
  lecture_title: string;
};

export default function ReceiptsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/donations', { credentials: 'include' });
    const data = await res.json();
    if (res.status === 401) {
      window.location.href = '/admin';
      return;
    }
    if (data.donations) {
      setDonations(
        data.donations.filter(
          (d: Donation) => d.receipt_required && d.status === 'completed'
        )
      );
    }
    setLoading(false);
  };

  const generateOne = async (id: string) => {
    setProcessing(id);
    const res = await fetch(`/api/admin/receipts/generate?ids=${id}&email=${sendEmail}`, {
      credentials: 'include',
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setProcessing(null);
  };

  const generateAll = async () => {
    setProcessing('all');
    const ids = donations.map((d) => d.id).join(',');
    const res = await fetch(`/api/admin/receipts/generate?ids=${ids}&email=${sendEmail}&zip=1`, {
      credentials: 'include',
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts_${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setProcessing(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">기부금 영수증 발급</h1>
          <Link href="/admin" className="text-emerald-600 hover:underline">
            ← 대시보드
          </Link>
        </div>

        <label className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
          />
          <span>발급 후 이메일 자동 발송</span>
        </label>

        {donations.length > 0 && (
          <button
            onClick={generateAll}
            disabled={!!processing}
            className="mb-6 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {processing === 'all' ? '생성 중...' : '일괄 발급 (ZIP)'}
          </button>
        )}

        {loading ? (
          <p className="text-slate-500">로딩 중...</p>
        ) : donations.length === 0 ? (
          <p className="text-slate-500">영수증 발급 대상이 없습니다. (완료 + 영수증 필요)</p>
        ) : (
          <div className="space-y-2">
            {donations.map((d) => (
              <div
                key={d.id}
                className="flex justify-between items-center p-4 bg-white rounded-lg border"
              >
                <div>
                  <span className="font-medium">{d.name}</span>
                  <span className="mx-2 text-slate-400">|</span>
                  <span>{d.amount.toLocaleString()}원</span>
                  <span className="mx-2 text-slate-400">|</span>
                  <span className="text-sm text-slate-500">{d.lecture_title}</span>
                </div>
                <button
                  onClick={() => generateOne(d.id)}
                  disabled={!!processing}
                  className="px-3 py-1 bg-slate-700 text-white rounded text-sm hover:bg-slate-800 disabled:opacity-50"
                >
                  {processing === d.id ? '생성 중' : '개별 발급'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
