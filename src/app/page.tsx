import { DonationForm } from '@/components/DonationForm';

export const metadata = {
  title: '강의 기부금 결제 | 심리연구소',
  description: '강의 수강료 기부 및 후원 결제',
  openGraph: {
    title: '강의 기부금 결제 | 심리연구소',
    description: '강의 수강료 기부 및 후원 결제',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <header className="text-center mb-10">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            강의 기부금 결제
          </h1>
          <p className="text-slate-600">
            심리연구소 비영리단체 강의 기부금 결제 시스템
          </p>
        </header>

        <DonationForm />
      </div>
    </main>
  );
}
