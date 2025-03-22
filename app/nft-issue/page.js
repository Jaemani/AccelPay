'use client';

import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '@/app/context/Web3Context';
import { useRouter } from 'next/navigation';
import * as xrpl from 'xrpl';
import { Copy, ExternalLink, RefreshCw, Wallet, Send, CreditCard, Coins, Loader2 } from 'lucide-react';

// Spinner 컴포넌트 직접 구현
const Spinner = () => (
  <Loader2 className="h-5 w-5 animate-spin" />
);

const WalletPage = () => {
  const router = useRouter();
  const { account, connected, connect, balance, refreshBalance, disconnect } = useContext(Web3Context);
  const [transactions, setTransactions] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('assets');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (connected) {
      fetchWalletData();
    }
  }, [connected, account]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // 잔액 새로고침
      await refreshBalance();
      
      // 트랜잭션 내역 조회 (해커톤 데모에서는 예시 데이터 사용)
      setTransactions([
        { 
          hash: 'A1B2C3D4E5F6...', 
          type: '송금', 
          amount: '10 XRP', 
          timestamp: Date.now() - 86400000, 
          status: '완료',
          destination: 'rDest...' 
        },
        { 
          hash: 'F6E5D4C3B2A1...', 
          type: '수신', 
          amount: '25 XRP', 
          timestamp: Date.now() - 172800000, 
          status: '완료',
          destination: account 
        }
      ]);
      
      // NFT 목록 조회 (해커톤 데모에서는 예시 데이터 사용)
      setNfts([
        {
          nftId: 'NFT1234567890',
          name: '서울대학교 학생증',
          description: '컴퓨터공학과 - 학번: 2023-12345',
          image: '/api/placeholder/100/100'
        }
      ]);
      
    } catch (error) {
      console.error('지갑 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (!account) return;
    
    navigator.clipboard.writeText(account);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const viewOnExplorer = () => {
    if (!account) return;
    window.open(`https://testnet.xrpl.org/accounts/${account}`, '_blank');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!connected) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <Wallet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4">지갑 연결이 필요합니다</h2>
        <p className="text-gray-400 mb-6">자산과 거래 내역을 보려면 XRP 지갑을 연결하세요</p>
        <button 
          onClick={connect}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium rounded-lg px-6 py-3 text-white"
        >
          지갑 연결하기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4 md:mb-0">
          내 지갑
        </h1>
        
        <div className="flex items-center bg-gray-800 rounded-lg p-2 border border-gray-700">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="font-medium mr-2">{formatAddress(account)}</span>
          <button 
            onClick={copyAddress} 
            className="p-1 text-gray-400 hover:text-white relative"
            aria-label="주소 복사"
          >
            <Copy className="h-4 w-4" />
            {copySuccess && (
              <span className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-green-800 text-white text-xs px-2 py-1 rounded">
                복사됨!
              </span>
            )}
          </button>
          <button 
            onClick={viewOnExplorer} 
            className="p-1 text-gray-400 hover:text-white"
            aria-label="블록 탐색기에서 보기"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-gray-700 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">총 자산</h3>
              <p className="text-2xl font-bold">{parseFloat(balance).toFixed(4)} XRP</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-full">
              <Coins className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-gray-400">≈ ${(parseFloat(balance) * 0.5).toFixed(2)} USD</p>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-sm font-medium text-gray-400">빠른 메뉴</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => router.push('/payment')}
              className="flex flex-col items-center justify-center h-16 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700"
            >
              <Send className="h-5 w-5 mb-1" />
              <span className="text-xs">송금하기</span>
            </button>
            <button
              onClick={() => router.push('/nft-issue')}
              className="flex flex-col items-center justify-center h-16 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700"
            >
              <CreditCard className="h-5 w-5 mb-1" />
              <span className="text-xs">학생증 발급</span>
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">네트워크</h3>
              <p className="font-medium">XRPL 테스트넷</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={fetchWalletData}
              className="flex items-center justify-center h-10 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700"
              disabled={loading}
            >
              {loading ? <Spinner /> : <RefreshCw className="h-4 w-4 mr-2" />}
              <span>새로고침</span>
            </button>
            <button
              onClick={disconnect}
              className="flex items-center justify-center h-10 bg-red-900/20 border border-red-800/30 text-red-400 rounded-lg hover:bg-red-900/30"
            >
              <span>연결 해제</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
        <div className="flex border-b border-gray-700">
          <button 
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'assets' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('assets')}
          >
            자산
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'nfts' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('nfts')}
          >
            NFT 학생증
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'activity' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('activity')}
          >
            거래 내역
          </button>
        </div>
        
        {activeTab === 'assets' && (
          <div className="p-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-4 text-gray-400 font-medium">자산</th>
                  <th className="pb-4 text-gray-400 font-medium text-right">잔액</th>
                  <th className="pb-4 text-gray-400 font-medium text-right">가치 (USD)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                        <span className="text-xs font-bold">XRP</span>
                      </div>
                      <div>
                        <p className="font-medium">XRP</p>
                        <p className="text-xs text-gray-400">XRP Ledger</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-right font-medium">{parseFloat(balance).toFixed(4)}</td>
                  <td className="py-4 text-right font-medium">${(parseFloat(balance) * 0.5).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'nfts' && (
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner />
                <span className="ml-2">NFT 로딩 중...</span>
              </div>
            ) : nfts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">보유 중인 NFT가 없습니다</p>
                <button
                  onClick={() => router.push('/nft-issue')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  NFT 학생증 발급하기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nfts.map((nft, index) => (
                  <div key={index} className="bg-gray-700/50 border border-gray-600 rounded-lg shadow-lg overflow-hidden">
                    <div className="h-48 bg-gray-600 flex items-center justify-center">
                      {nft.image ? (
                        <img 
                          src={nft.image} 
                          alt={nft.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="text-gray-400">이미지 없음</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-medium text-white">{nft.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">{nft.description}</p>
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <p className="text-xs text-gray-400">NFT ID:</p>
                        <p className="text-xs text-gray-300 truncate">{nft.nftId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner />
                <span className="ml-2">거래 내역 로딩 중...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">거래 내역이 없습니다</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-4 text-gray-400 font-medium">유형</th>
                    <th className="pb-4 text-gray-400 font-medium">금액</th>
                    <th className="pb-4 text-gray-400 font-medium hidden md:table-cell">날짜</th>
                    <th className="pb-4 text-gray-400 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="py-4">{tx.type}</td>
                      <td className="py-4">{tx.amount}</td>
                      <td className="py-4 hidden md:table-cell">{formatDate(tx.timestamp)}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          tx.status === '완료' ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;