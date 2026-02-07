'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type PaymentMethod = 'bank_transfer' | 'kakaopay';
type AmountType = 'free' | 'fixed';

const FIXED_AMOUNTS = [
  { value: 10000, label: '1만' },
  { value: 30000, label: '3만' },
  { value: 50000, label: '5만' },
  { value: 100000, label: '10만' },
];

export function DonationForm() {
  const router = useRouter();
  const [amountType, setAmountType] = useState<AmountType>('fixed');
  const [amount, setAmount] = useState(30000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [receiptRequired, setReceiptRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    resident_number_prefix: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalAmount = amountType === 'free' ? amount : amount;
    if (finalAmount < 1000) {
      setError('최소 기부 금액은 1,000원입니다.');
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setError('이름, 연락처, 이메일을 모두 입력해주세요.');
      return;
    }

    if (receiptRequired && formData.resident_number_prefix.length !== 7) {
      setError('영수증 발급을 위해 주민번호 앞 7자리를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'bank_transfer') {
        const res = await fetch('/api/donations/bank-transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            lecture_title: '에코행복연구소 자유후원',
            amount: finalAmount,
            receipt_required: receiptRequired,
            resident_number_prefix: receiptRequired ? formData.resident_number_prefix : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '오류가 발생했습니다.');
        router.push(`/success/bank-transfer?id=${data.id}`);
      } else {
        const res = await fetch('/api/donations/kakaopay/ready', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            lecture_title: '에코행복연구소 자유후원',
            amount: finalAmount,
            receipt_required: receiptRequired,
            resident_number_prefix: receiptRequired ? formData.resident_number_prefix : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '오류가 발생했습니다.');
        if (data.next_redirect_pc_url) {
          window.location.href = data.next_redirect_pc_url;
        } else if (data.next_redirect_mobile_url) {
          window.location.href = data.next_redirect_mobile_url;
        } else {
          throw new Error('결제 URL을 받지 못했습니다.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      {/* 금액 */}
      <section className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-stone-800">기부 금액</h2>
        <div className="mb-4 flex gap-2 rounded-xl bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => setAmountType('fixed')}
            className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
              amountType === 'fixed'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-stone-500'
            }`}
          >
            선택
          </button>
          <button
            type="button"
            onClick={() => setAmountType('free')}
            className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
              amountType === 'free'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-stone-500'
            }`}
          >
            직접입력
          </button>
        </div>
        {amountType === 'fixed' ? (
          <div className="grid grid-cols-4 gap-2">
            {FIXED_AMOUNTS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                className={`min-h-[52px] rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                  amount === value
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {label}원
              </button>
            ))}
          </div>
        ) : (
          <div className="relative">
            <input
              type="number"
              min={1000}
              step={1000}
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-4 text-lg font-semibold outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/20"
              placeholder="금액 입력"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">
              원
            </span>
          </div>
        )}
      </section>

      {/* 결제 방식 */}
      <section className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-stone-800">결제 방식</h2>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex min-h-[100px] flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all active:scale-[0.98] ${
              paymentMethod === 'bank_transfer'
                ? 'border-emerald-500 bg-emerald-50/50 shadow-inner'
                : 'border-stone-200 bg-stone-50/50'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="bank_transfer"
              checked={paymentMethod === 'bank_transfer'}
              onChange={() => setPaymentMethod('bank_transfer')}
              className="sr-only"
            />
            <span className="text-3xl">🏦</span>
            <span className="font-semibold text-stone-800">무통장입금</span>
            <span className="text-xs text-stone-500">수수료 0원</span>
          </label>
          <label
            className={`flex min-h-[100px] flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all active:scale-[0.98] ${
              paymentMethod === 'kakaopay'
                ? 'border-amber-400 bg-amber-50/50 shadow-inner'
                : 'border-stone-200 bg-stone-50/50'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="kakaopay"
              checked={paymentMethod === 'kakaopay'}
              onChange={() => setPaymentMethod('kakaopay')}
              className="sr-only"
            />
            <span className="text-3xl">💛</span>
            <span className="font-semibold text-stone-800">카카오페이</span>
            <span className="text-xs text-stone-500">즉시 결제</span>
          </label>
        </div>
      </section>

      {/* 기부자 정보 */}
      <section className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-stone-800">기부자 정보</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-600">이름</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/20"
              placeholder="홍길동"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-600">연락처</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/20"
              placeholder="010-1234-5678"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-600">이메일</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/20"
              placeholder="example@email.com"
            />
          </div>
        </div>
      </section>

      {/* 영수증 */}
      <section className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border-2 border-stone-200 bg-stone-50/50 px-4 transition hover:bg-stone-100/50 has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50/50">
          <input
            type="checkbox"
            checked={receiptRequired}
            onChange={(e) => setReceiptRequired(e.target.checked)}
            className="h-5 w-5 rounded border-stone-300 text-emerald-500 focus:ring-emerald-500"
          />
          <span className="font-medium text-stone-700">기부금 영수증 발급 필요</span>
        </label>
        {receiptRequired && (
          <div className="mt-4 animate-slide-up rounded-xl bg-stone-50 p-4">
            <label className="mb-2 block text-sm font-medium text-stone-600">
              주민번호 앞 7자리
            </label>
            <input
              type="text"
              maxLength={7}
              value={formData.resident_number_prefix}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  resident_number_prefix: e.target.value.replace(/\D/g, ''),
                })
              }
              className="w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-400"
              placeholder="9001011"
            />
            <p className="mt-1.5 text-xs text-stone-500">예: 9001011 (생년월일 + 성별코드)</p>
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 flex min-h-[56px] items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] disabled:opacity-60 sm:static sm:inset-auto sm:mx-0 sm:mb-0 sm:mt-2 sm:min-h-[56px]"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            처리 중...
          </span>
        ) : paymentMethod === 'bank_transfer' ? (
          '입금 신청하기'
        ) : (
          '카카오페이로 결제하기'
        )}
      </button>

      {/* Spacer for fixed button on mobile */}
      <div className="h-20 sm:hidden" />
    </form>
  );
}
