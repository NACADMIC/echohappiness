import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "에코행복연구소 자유후원",
  description: "에코행복연구소 자유후원 - 비영리단체 기부금 결제 - 무통장입금·카카오페이 지원",
  openGraph: {
    title: "에코행복연구소 자유후원",
    description: "에코행복연구소 자유후원 - 비영리단체 기부금 결제",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
