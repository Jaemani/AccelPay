'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, CreditCard, Image, Receipt } from 'lucide-react';
import { Web3Context } from '@/app/context/Web3Context';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { account, connectWallet } = useContext(Web3Context);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="relative w-full h-96 overflow-hidden bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="container mx-auto px-6 relative z-10 flex items-center h-full">
          <div className="w-full md:w-2/3">
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              AccelPay
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              The future of payments on XRP Ledger. Fast, secure, and decentralized.
            </p>
            <div className="flex flex-wrap gap-4">
              {!account ? (
                <Button onClick={connectWallet} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600">
                  <Wallet size={20} /> Connect Wallet
                </Button>
              ) : (
                <Button onClick={() => router.push('/wallet')} className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600">
                  <Wallet size={20} /> Manage Wallet
                </Button>
              )}
              <Button onClick={() => router.push('/payment')} className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-900">
                <CreditCard size={20} /> Make Payment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Explore AccelPay Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: 'XRP Payments', icon: <CreditCard size={40} />, link: '/payment' },
            { title: 'NFT Issuance', icon: <Image size={40} />, link: '/nft-issue' },
            { title: 'Wallet Management', icon: <Wallet size={40} />, link: '/wallet' },
            { title: 'Transaction History', icon: <Receipt size={40} />, link: '/receipts' },
          ].map(({ title, icon, link }) => (
            <Card key={title} className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-blue-500">
              <div className="mb-4 text-blue-400">{icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-100">{title}</h3>
              <Button onClick={() => router.push(link)} className="mt-4 w-full bg-gray-800 hover:bg-gray-700">
                Go to {title}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-16">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Transactions', value: '1M+' },
            { label: 'Users', value: '50K+' },
            { label: 'Integrations', value: '100+' },
            { label: 'Uptime', value: '99.9%' },
          ].map(({ label, value }) => (
            <div key={label} className="p-4">
              <p className="text-4xl font-bold text-white mb-2">{value}</p>
              <p className="text-gray-300">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-gray-900 py-12 mt-auto">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">AccelPay</h2>
            <p className="text-gray-400 mt-2">Powered by XRP Ledger</p>
          </div>
          <div className="flex space-x-6">
            {['Terms', 'Privacy', 'Docs', 'Contact'].map((text) => (
              <a key={text} href="#" className="text-gray-400 hover:text-white">
                {text}
              </a>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex justify-center">
          <p className="text-gray-500">© 2025 AccelPay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}