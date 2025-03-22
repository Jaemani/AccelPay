import { Web3Provider } from '@/app/context/Web3Context';
import './globals.css';

export const metadata = {
  title: 'AccelPay - XRPL 결제 솔루션',
  description: '빠르고 안전한 XRP Ledger 기반 국제 결제 및 학생증 발급 서비스',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        {/* GemWallet API 스크립트 추가 */}
        <script src="https://unpkg.com/@gemwallet/api@2.1.0/umd/gemwallet-api.js" defer />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}