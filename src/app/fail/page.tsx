import Link from 'next/link';

export default function FailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <p className="text-red-600 mb-4">결제에 실패했습니다. 다시 시도해 주세요.</p>
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
