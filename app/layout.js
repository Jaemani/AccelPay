import { Web3Provider } from '@/app/context/Web3Context';
// You'll want to uncomment these when you have the components created
// import Navbar from '@/components/Navbar';
// import Footer from '@/components/Footer';

export const metadata = {
  title: 'AccelPay - XRPL Payments',
  description: 'Fast, secure, and decentralized payments on the XRP Ledger',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {/* Your homepage now includes its own footer, so we don't need one here */}
          {/* <Navbar /> */}
          {children}
          {/* <Footer /> */}
        </Web3Provider>
      </body>
    </html>
  );
}