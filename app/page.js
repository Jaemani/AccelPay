'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Web3Context } from '@/app/context/Web3Context';
import { useContext } from 'react';
import Link from 'next/link';
import { Wallet, CreditCard, Image, Receipt, ArrowRight, ExternalLink, Globe, Shield, Zap } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { account, connected, connect, connectGemWallet } = useContext(Web3Context);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [showConnectOptions, setShowConnectOptions] = useState(false);

  // 마우스 움직임에 따른 인터랙티브 효과
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 스크롤 효과
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // GemWallet 연결 핸들러
  const handleConnectGemWallet = async () => {
    await connectGemWallet();
    setShowConnectOptions(false);
    if (connected) {
      router.push('/wallet');
    }
  };

  // 테스트 지갑 생성 핸들러
  const handleCreateTestWallet = async () => {
    await connect('local');
    setShowConnectOptions(false);
    if (connected) {
      router.push('/wallet');
    }
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        <div className="w-24 h-24 relative">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500 opacity-20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
        </div>
        <h1 className="mt-8 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse">
          AccelPay
        </h1>
        <p className="mt-2 text-gray-500">XRPL 기반 금융 솔루션</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white overflow-hidden">
      {/* 동적 배경 효과 */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-black">
          <div 
            className="absolute rounded-full w-[800px] h-[800px] blur-[100px] opacity-20"
            style={{ 
              background: 'radial-gradient(circle, rgba(79,70,229,1) 0%, rgba(79,70,229,0) 70%)', 
              top: `${mousePosition.y * 0.1}px`, 
              left: `${mousePosition.x * 0.1}px` 
            }}
          ></div>
          <div 
            className="absolute rounded-full w-[600px] h-[600px] blur-[100px] opacity-20"
            style={{ 
              background: 'radial-gradient(circle, rgba(147,51,234,1) 0%, rgba(147,51,234,0) 70%)', 
              top: `${window.innerHeight - mousePosition.y * 0.2}px`, 
              right: `${window.innerWidth - mousePosition.x * 0.2}px` 
            }}
          ></div>
        </div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      {/* 영웅 섹션 */}
      <div ref={heroRef} className="relative w-full min-h-screen flex items-center">
        <div 
          className="container mx-auto px-6 z-10 pt-20"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            opacity: Math.max(0, 1 - scrollY * 0.002)
          }}
        >
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-text-gradient">
                AccelPay
              </span>
              <br />
              <span className="text-white">XRP의 미래를 <br/>지금 경험하세요</span>
            </h1>
            <p className="text-xl mb-10 text-gray-300 max-w-xl">
              빠르고 안전한 국제 결제, 디지털 학생증, 그리고 더 많은 것.<br></br>블록체인 기술로 재정의하는 글로벌 유학생 금융 서비스.
            </p>
            <div className="flex flex-wrap gap-4">
              {!connected ? (
                showConnectOptions ? (
                  <div className="flex flex-col md:flex-row gap-4">
                    <button 
                      onClick={handleConnectGemWallet}
                      className="relative group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center gap-2 overflow-hidden transition-all"
                    >
                      <span className="relative z-10">💎 GemWallet 연결</span>
                    </button>
                    <button 
                      onClick={handleCreateTestWallet}
                      className="relative group px-8 py-4 bg-gray-800 border border-gray-700 hover:bg-gray-700 rounded-xl flex items-center gap-2 overflow-hidden transition-all"
                    >
                      <Wallet className="h-5 w-5" />
                      <span className="relative z-10">테스트 지갑 생성</span>
                    </button>
                    <button 
                      onClick={() => setShowConnectOptions(false)}
                      className="px-4 py-2 text-gray-500 hover:text-gray-300"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowConnectOptions(true)}
                    className="relative group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center gap-2 overflow-hidden transition-all hover:pr-12"
                  >
                    <Wallet size={20} className="relative z-10" /> 
                    <span className="relative z-10">지갑 연결하기</span>
                    <div className="absolute right-0 w-8 h-full bg-white/20 skew-x-[-20deg] translate-x-20 group-hover:translate-x-8 transition-transform duration-300"></div>
                    <ArrowRight size={20} className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  </button>
                )
              ) : (
                <button 
                  onClick={() => router.push('/wallet')}
                  className="relative group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center gap-2 overflow-hidden transition-all hover:pr-12"
                >
                  <Wallet size={20} className="relative z-10" /> 
                  <span className="relative z-10">내 지갑 관리</span>
                  <div className="absolute right-0 w-8 h-full bg-white/20 skew-x-[-20deg] translate-x-20 group-hover:translate-x-8 transition-transform duration-300"></div>
                  <ArrowRight size={20} className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                </button>
              )}
              <button 
                onClick={() => router.push('/payment')}
                className="relative group px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl flex items-center gap-2 overflow-hidden border border-gray-700 hover:border-blue-500 transition-all hover:pr-12"
              >
                <CreditCard size={20} className="relative z-10" /> 
                <span className="relative z-10">결제하기</span>
                <div className="absolute right-0 w-8 h-full bg-white/10 skew-x-[-20deg] translate-x-20 group-hover:translate-x-8 transition-transform duration-300"></div>
                <ArrowRight size={20} className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
              </button>
            </div>
            {!connected && showConnectOptions && (
              <div className="mt-6 max-w-lg p-4 bg-gray-800/70 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium mb-2">GemWallet이란?</h3>
                <p className="text-gray-400 text-sm mb-3">
                  GemWallet은 XRPL(XRP Ledger)을 위한 브라우저 확장 지갑으로, 개인 키 관리와 트랜잭션 서명을 쉽게 처리할 수 있게 해줍니다.
                </p>
                <a 
                  href="https://chromewebstore.google.com/detail/gemwallet/egebedonbdapoieedfcfkofloclfghab?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
                >
                  GemWallet 설치하기
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </a>
              </div>
            )}
            <div className="mt-10 flex items-center gap-2 text-gray-500">
              <div className="flex -space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-500 ring-2 ring-black flex items-center justify-center text-xs">P</div>
                <div className="w-6 h-6 rounded-full bg-purple-500 ring-2 ring-black flex items-center justify-center text-xs">X</div>
                <div className="w-6 h-6 rounded-full bg-green-300 ring-2 ring-black flex items-center justify-center text-xs">R</div>
              </div>
              <span>10,000+ 유저들의 선택</span>
            </div>
          </div>
        </div>
      </div>

      {/* 기능 섹션 */}
      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            AccelPay 주요 기능
          </h2>
          <p className="text-gray-400">XRPL 기술을 활용한 혁신적인 금융 솔루션을 경험하세요</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { 
              title: 'XRP 결제', 
              icon: <CreditCard size={28} className="text-blue-400" />, 
              link: '/payment', 
              description: '초당 1,500+ 트랜잭션 처리 속도로 빠르고 저렴한 학비 결제',
              gradient: 'from-blue-600 to-cyan-400' 
            },
            { 
              title: 'NFT 학생증', 
              icon: <Image size={28} className="text-purple-400" />, 
              link: '/nft-issue', 
              description: '위변조가 불가능한 블록체인 기반 디지털 학생증 발급',
              gradient: 'from-purple-600 to-pink-400' 
            },
            { 
              title: '지갑 관리', 
              icon: <Wallet size={28} className="text-green-400" />, 
              link: '/wallet', 
              description: '안전하고 편리한 XRP 지갑 관리 시스템',
              gradient: 'from-green-600 to-emerald-400' 
            },
            { 
              title: '영수증 관리', 
              icon: <Receipt size={28} className="text-amber-400" />, 
              link: '/receipts', 
              description: '투명하고 변경 불가능한 결제 내역 및 디지털 영수증',
              gradient: 'from-amber-600 to-yellow-400' 
            },
          ].map(({ title, icon, link, description, gradient }) => (
            <div key={title} className="relative group">
              <div className="absolute inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur rounded-xl transition-opacity duration-500 -z-10"
                style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}></div>
              <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl hover:border-gray-700 transition-all duration-300 h-full flex flex-col group-hover:translate-y-[-4px]">
                <div className="mb-6 p-3 bg-gray-800 rounded-xl w-max">{icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
                <p className="text-gray-400 mb-6 flex-grow">{description}</p>
                <button 
                  onClick={() => router.push(link)} 
                  className={`w-full bg-gradient-to-r ${gradient} py-3 rounded-lg text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300 flex items-center justify-center gap-2`}
                >
                  <span>{title} 바로가기</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 통계 섹션 */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-50"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { 
                label: '거래 건수', 
                value: '1M+', 
                icon: <Zap className="w-6 h-6" />,
                color: 'text-blue-400' 
              },
              { 
                label: '사용자 수', 
                value: '50K+', 
                icon: <Globe className="w-6 h-6" />,
                color: 'text-purple-400' 
              },
              { 
                label: '연동 서비스', 
                value: '100+', 
                icon: <ExternalLink className="w-6 h-6" />,
                color: 'text-pink-400' 
              },
              { 
                label: '서비스 안정성', 
                value: '99.9%', 
                icon: <Shield className="w-6 h-6" />,
                color: 'text-emerald-400' 
              },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="p-4">
                <div className={`${color} mx-auto mb-4 flex justify-center`}>{icon}</div>
                <p className="text-5xl font-bold text-white mb-2 font-mono">{value}</p>
                <p className="text-gray-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-gray-900 py-12 mt-auto relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">AccelPay</h2>
            <p className="text-gray-400 mt-2">XRP Ledger 기반 결제 서비스</p>
          </div>
          <div className="flex space-x-6 mt-6 md:mt-0">
            {['이용약관', '개인정보처리방침', '문서', '연락처'].map((text) => (
              <a key={text} href="#" className="text-gray-400 hover:text-white transition-colors">
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