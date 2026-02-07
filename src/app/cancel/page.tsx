import Link from 'next/link';

export default function CancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
          <span className="text-3xl">🔄</span>
        </div>
        <p className="text-stone-600">결제가 취소되었습니다.</p>
        <Link
          href="/"
          className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-white shadow-lg shadow-emerald-500/30"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
