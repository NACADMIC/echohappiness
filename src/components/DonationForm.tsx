'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type PaymentMethod = 'bank_transfer' | 'kakaopay';
type AmountType = 'free' | 'fixed';

const FIXED_AMOUNTS = [10000, 30000, 50000, 100000, 0];

export function DonationForm() {
  const router = useRouter();
  const [amountType, setAmountType] = useState<AmountType>('fixed');
  const [amount, setAmount] = useState(30000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [receiptRequired, setReceiptRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    lecture_title: '',
    lecture_description: '',
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 강의 정보 */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">강의 정보</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">강의 제목</label>
            <input
              type="text"
              required
              value={formData.lecture_title}
              onChange={(e) => setFormData({ ...formData, lecture_title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="예: 2025년 1월 심리학 강의"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">강의 설명 (선택)</label>
            <textarea
              value={formData.lecture_description}
              onChange={(e) => setFormData({ ...formData, lecture_description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows={3}
              placeholder="강의에 대한 간단한 설명"
            />
          </div>
        </div>
      </section>

      {/* 금액 */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">기부 금액</h2>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="amountType"
              checked={amountType === 'fixed'}
              onChange={() => setAmountType('fixed')}
            />
            <span>고정 금액</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="amountType"
              checked={amountType === 'free'}
              onChange={() => setAmountType('free')}
            />
            <span>자유 금액</span>
          </label>
        </div>
        {amountType === 'fixed' ? (
          <div className="flex flex-wrap gap-2">
            {FIXED_AMOUNTS.filter(Boolean).map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt)}
                className={`px-4 py-2 rounded-lg border transition ${
                  amount === amt
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white border-slate-300 hover:border-emerald-400'
                }`}
              >
                {amt.toLocaleString()}원
              </button>
            ))}
          </div>
        ) : (
          <div>
            <input
              type="number"
              min={1000}
              step={1000}
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              placeholder="금액 입력"
            />
          </div>
        )}
      </section>

      {/* 결제 방식 */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">결제 방식</h2>
        <div className="grid grid-cols-2 gap-4">
          <label
            className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition ${
              paymentMethod === 'bank_transfer'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-slate-200 hover:border-slate-300'
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
            <span className="text-2xl mb-2">🏦</span>
            <span className="font-medium">무통장입금</span>
            <span className="text-xs text-slate-500 mt-1">수수료 0원</span>
          </label>
          <label
            className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition ${
              paymentMethod === 'kakaopay'
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-slate-200 hover:border-slate-300'
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
            <span className="text-2xl mb-2">💛</span>
            <span className="font-medium">카카오페이</span>
            <span className="text-xs text-slate-500 mt-1">즉시 결제</span>
          </label>
        </div>
      </section>

      {/* 기부자 정보 */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">기부자 정보</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">이름 *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="홍길동"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">연락처 *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="010-1234-5678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">이메일 *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="example@email.com"
            />
          </div>
        </div>
      </section>

      {/* 영수증 */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={receiptRequired}
            onChange={(e) => setReceiptRequired(e.target.checked)}
          />
          <span className="font-medium">기부금 영수증 발급 필요</span>
        </label>
        {receiptRequired && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              주민번호 앞 7자리 *
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
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              placeholder="9001011"
            />
            <p className="text-xs text-slate-500 mt-1">예: 9001011 (생년월일 + 성별코드)</p>
          </div>
        )}
      </section>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading
          ? '처리 중...'
          : paymentMethod === 'bank_transfer'
                ? '입금 신청하기'
                : '카카오페이로 결제하기'}
      </button>
    </form>
  );
}
