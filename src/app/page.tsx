import { DonationForm } from '@/components/DonationForm';

export const metadata = {
  title: '에코행복연구소 자유후원',
  description: '에코행복연구소 자유후원',
  openGraph: {
    title: '에코행복연구소 자유후원',
    description: '에코행복연구소 자유후원',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-emerald-50/80 via-white to-stone-50/50">
      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-8 pb-6 sm:pt-12 sm:pb-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.15),transparent)]" />
        <div className="relative mx-auto max-w-md text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <span className="text-lg">🌱</span>
            사단법인
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-800 sm:text-3xl">
            에코행복연구소
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              자유후원
            </span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            작은 마음이 모여 큰 사랑이 됩니다
          </p>
          <p className="mt-2 text-sm text-stone-500">
            후원해 주시는 모든 분의 따뜻한 마음에 감사드립니다.
            <br />
            여러분의 기부가 누군가의 행복한 내일을 만듭니다.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 pb-8 sm:pb-12">
        <div className="mx-auto max-w-md">
          <DonationForm />
        </div>
      </div>
    </main>
  );
}
