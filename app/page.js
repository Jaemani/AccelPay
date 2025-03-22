'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Web3Context } from '@/app/context/Web3Context';
import { useContext } from 'react';
import Link from 'next/link';
import { Wallet, CreditCard, Image, Receipt } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { account, connected, connect } = useContext(Web3Context);

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
              XRP Ledger 기반의 빠르고 안전한 탈중앙화 결제 플랫폼
            </p>
            <div className="flex flex-wrap gap-4">
              {!connected ? (
                <button 
                  onClick={connect}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center gap-2"
                >
                  <Wallet size={20} /> 지갑 연결하기
                </button>
              ) : (
                <button 
                  onClick={() => router.push('/wallet')}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md flex items-center gap-2"
                >
                  <Wallet size={20} /> 내 지갑 관리
                </button>
              )}
              <button 
                onClick={() => router.push('/payment')}
                className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-900 rounded-md flex items-center gap-2"
              >
                <CreditCard size={20} /> 결제하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          AccelPay 주요 기능
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: 'XRP 결제', icon: <CreditCard size={40} />, link: '/payment', description: '빠르고 저렴한 학비 결제' },
            { title: 'NFT 학생증', icon: <Image size={40} />, link: '/nft-issue', description: '디지털 학생증 발급' },
            { title: '지갑 관리', icon: <Wallet size={40} />, link: '/wallet', description: 'XRP 지갑 관리' },
            { title: '영수증 관리', icon: <Receipt size={40} />, link: '/receipts', description: '결제 내역 및 영수증' },
          ].map(({ title, icon, link, description }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-blue-500">
              <div className="mb-4 text-blue-400">{icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-100">{title}</h3>
              <p className="text-gray-400 mb-4">{description}</p>
              <button 
                onClick={() => router.push(link)} 
                className="w-full bg-gray-800 hover:bg-gray-700 py-2 rounded-md"
              >
                {title} 바로가기
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-16">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: '거래 건수', value: '1M+' },
            { label: '사용자 수', value: '50K+' },
            { label: '연동 서비스', value: '100+' },
            { label: '서비스 안정성', value: '99.9%' },
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
            <p className="text-gray-400 mt-2">XRP Ledger 기반 결제 서비스</p>
          </div>
          <div className="flex space-x-6">
            {['이용약관', '개인정보처리방침', '문서', '연락처'].map((text) => (
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