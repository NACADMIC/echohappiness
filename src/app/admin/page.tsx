'use client';

import { useState } from 'react';
import Link from 'next/link';

type Donation = {
  id: string;
  created_at: string;
  lecture_title: string;
  amount: number;
  payment_method: string;
  status: string;
  name: string;
  phone: string;
  email: string;
  receipt_required: boolean;
  deposit_name_format: string | null;
  deposit_confirmed_at: string | null;
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterReceipt, setFilterReceipt] = useState<boolean | 'all'>('all');

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (data.success) {
      setAuthenticated(true);
      fetchDonations();
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/donations', { credentials: 'include' });
    const data = await res.json();
    if (data.donations) setDonations(data.donations);
    setLoading(false);
  };

  const confirmDeposit = async (id: string) => {
    const res = await fetch('/api/admin/confirm-deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
      credentials: 'include',
    });
    if (res.ok) fetchDonations();
  };

  const filtered = donations.filter((d) => {
    if (filterPayment !== 'all' && d.payment_method !== filterPayment) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (filterReceipt !== 'all' && d.receipt_required !== filterReceipt) return false;
    return true;
  });

  const stats = {
    totalAmount: donations.filter((d) => d.status === 'completed').reduce((a, d) => a + d.amount, 0),
    totalCount: donations.filter((d) => d.status === 'completed').length,
    receiptCount: donations.filter((d) => d.receipt_required && d.status === 'completed').length,
    pendingCount: donations.filter((d) => d.status === 'pending').length,
    bankCount: donations.filter((d) => d.payment_method === 'bank_transfer' && d.status === 'completed').length,
    kakaopayCount: donations.filter((d) => d.payment_method === 'kakaopay' && d.status === 'completed').length,
  };

  const exportCSV = () => {
    const headers = ['이름', '금액', '결제방식', '상태', '연락처', '이메일', '영수증필요', '입금자명', '신청일시'];
    const rows = filtered.map((d) => [
      d.name,
      d.amount,
      d.payment_method === 'bank_transfer' ? '무통장' : '카카오페이',
      d.status === 'completed' ? '완료' : d.status === 'pending' ? '대기' : d.status,
      d.phone,
      d.email,
      d.receipt_required ? 'Y' : 'N',
      d.deposit_name_format || '',
      new Date(d.created_at).toLocaleString('ko-KR'),
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <form onSubmit={login} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-xl font-bold mb-4">관리자 로그인</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />
          <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            로그인
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">기부금 관리 대시보드</h1>
          <div className="flex gap-2">
            <Link href="/" className="px-4 py-2 text-slate-600 hover:text-slate-800">
              홈
            </Link>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
            >
              CSV 다운로드
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow border">
            <p className="text-sm text-slate-500">총 결제 금액</p>
            <p className="text-xl font-bold">{stats.totalAmount.toLocaleString()}원</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border">
            <p className="text-sm text-slate-500">결제 건수</p>
            <p className="text-xl font-bold">{stats.totalCount}건</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border">
            <p className="text-sm text-slate-500">영수증 발급 대상</p>
            <p className="text-xl font-bold">{stats.receiptCount}명</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border">
            <p className="text-sm text-slate-500">입금 대기</p>
            <p className="text-xl font-bold">{stats.pendingCount}건</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">전체 결제방식</option>
            <option value="bank_transfer">무통장입금</option>
            <option value="kakaopay">카카오페이</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">전체 상태</option>
            <option value="pending">입금대기</option>
            <option value="completed">완료</option>
          </select>
          <select
            value={String(filterReceipt)}
            onChange={(e) =>
              setFilterReceipt(
                e.target.value === 'all' ? 'all' : e.target.value === 'true'
              )
            }
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">전체</option>
            <option value="true">영수증 필요만</option>
            <option value="false">영수증 불필요만</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow border overflow-x-auto">
          {loading ? (
            <p className="p-8 text-center text-slate-500">로딩 중...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-3">이름</th>
                  <th className="text-left p-3">금액</th>
                  <th className="text-left p-3">결제방식</th>
                  <th className="text-left p-3">상태</th>
                  <th className="text-left p-3">영수증</th>
                  <th className="text-left p-3">입금자명</th>
                  <th className="text-left p-3">신청일시</th>
                  <th className="text-left p-3">액션</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">{d.name}</td>
                    <td className="p-3">{d.amount.toLocaleString()}원</td>
                    <td className="p-3">{d.payment_method === 'bank_transfer' ? '무통장' : '카카오페이'}</td>
                    <td className="p-3">
                      <span className={d.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}>
                        {d.status === 'completed' ? '완료' : '대기'}
                      </span>
                    </td>
                    <td className="p-3">{d.receipt_required ? 'Y' : '-'}</td>
                    <td className="p-3 font-mono text-xs">{d.deposit_name_format || '-'}</td>
                    <td className="p-3">{new Date(d.created_at).toLocaleString('ko-KR')}</td>
                    <td className="p-3">
                      {d.payment_method === 'bank_transfer' && d.status === 'pending' && (
                        <button
                          onClick={() => confirmDeposit(d.id)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700"
                        >
                          입금확인
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {filtered.length === 0 && !loading && (
            <p className="p-8 text-center text-slate-500">결제 내역이 없습니다.</p>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <Link href="/admin/receipts" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            영수증 발급
          </Link>
        </div>
      </div>
    </main>
  );
}
