import Link from 'next/link';

export default function CancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <p className="text-slate-600 mb-4">결제가 취소되었습니다.</p>
        <Link
          href="/"
          className="inline-block py-3 px-6 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
