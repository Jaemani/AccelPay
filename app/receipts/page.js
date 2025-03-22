'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Web3Context } from '@/app/context/Web3Context';
import { AlertCircle, CheckCircle, Download, ExternalLink, Receipt, Clock, XCircle, Loader2 } from 'lucide-react';

// Spinner 컴포넌트 직접 구현
const Spinner = () => (
  <Loader2 className="h-5 w-5 animate-spin" />
);

// 예시 트랜잭션 데이터 가져오는 함수 (실제 구현 시 API 호출로 대체)
const getTransactions = async (account) => {
  // 해커톤 데모용 예시 데이터
  return [
    {
      id: 'tx-001',
      type: 'payment',
      hash: 'AB1234567890CDEF...',
      from: account,
      to: 'rLcn4VGsKTjoReU...',
      amount: '500',
      currency: 'XRP',
      status: 'completed',
      timestamp: Date.now() - 86400000,
      receipt: true
    },
    {
      id: 'tx-002',
      type: 'payment',
      hash: 'CD9876543210ABEF...',
      from: 'rJkT1pWhtw8Nu3h...',
      to: account,
      amount: '1000',
      currency: 'XRP',
      status: 'completed',
      timestamp: Date.now() - 172800000,
      receipt: true
    },
    {
      id: 'tx-003',
      type: 'payment',
      hash: 'EF13579BDCA2468...',
      from: account,
      to: 'rHb9CJAWyB4rj91...',
      amount: '200',
      currency: 'XRP',
      status: 'pending',
      timestamp: Date.now() - 3600000,
      receipt: false
    }
  ];
};

const ReceiptsPage = () => {
  const router = useRouter();
  const { account, connected, connect } = useContext(Web3Context);
  const [transactions, setTransactions] = useState([]);
  const [filteredTxns, setFilteredTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    if (connected) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [connected, account]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const txns = await getTransactions(account);
      setTransactions(txns);
    } catch (error) {
      console.error('트랜잭션 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];
    
    // 상태 필터 적용
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.status === filter);
    }
    
    // 검색어 필터 적용
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        tx => tx.hash.toLowerCase().includes(search) || 
              tx.type.toLowerCase().includes(search) ||
              (tx.to && tx.to.toLowerCase().includes(search)) ||
              (tx.currency && tx.currency.toLowerCase().includes(search))
      );
    }
    
    setFilteredTxns(filtered);
  };

  const handleViewReceipt = (tx) => {
    setSelectedTx(tx);
    setReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setReceiptModalOpen(false);
    setSelectedTx(null);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'pending':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'failed':
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const downloadReceipt = () => {
    console.log('영수증 다운로드:', selectedTx.id);
    alert('영수증 다운로드가 시작되었습니다!');
    // 실제 구현에서는 PDF 생성 및 다운로드 로직 구현
  };

  const formatTransactionType = (type) => {
    const typeMapping = {
      'payment': '결제',
      'nft-mint': 'NFT 발행',
      'receive': '수신'
    };
    return typeMapping[type] || type;
  };

  if (!connected) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <Receipt className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4">지갑 연결이 필요합니다</h2>
        <p className="text-gray-400 mb-6">거래 영수증을 확인하려면 지갑을 연결하세요</p>
        <button 
          onClick={connect}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-medium rounded-lg px-6 py-3 text-white"
        >
          지갑 연결하기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-green-500">
        거래 영수증
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="트랜잭션 해시, 유형, 주소로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm rounded-l-lg ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-sm ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            완료
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-sm rounded-r-lg ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            진행중
          </button>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Spinner />
            <span className="ml-2">영수증 로딩 중...</span>
          </div>
        ) : filteredTxns.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">트랜잭션을 찾을 수 없습니다</h3>
            <p className="text-gray-400">
              {searchTerm || filter !== 'all' ? 
                '필터 조건을 변경해보세요' : 
                '트랜잭션이 생성되면 여기에 표시됩니다'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr className="text-left">
                  <th className="px-4 py-3 text-sm font-medium">유형</th>
                  <th className="px-4 py-3 text-sm font-medium">금액</th>
                  <th className="px-4 py-3 text-sm font-medium hidden md:table-cell">트랜잭션 해시</th>
                  <th className="px-4 py-3 text-sm font-medium hidden md:table-cell">날짜</th>
                  <th className="px-4 py-3 text-sm font-medium">상태</th>
                  <th className="px-4 py-3 text-sm font-medium text-right">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTxns.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{formatTransactionType(tx.type)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {tx.amount} {tx.currency}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm truncate max-w-[120px]">{tx.hash}</span>
                        <button
                          onClick={() => window.open(`https://testnet.xrpl.org/transactions/${tx.hash}`, '_blank')}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">{formatDate(tx.timestamp)}</td>
                    <td className="px-4 py-3">
                      <div className={`px-2 py-1 text-xs rounded-full flex items-center w-fit ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)} 
                        <span>{tx.status === 'completed' ? '완료' : tx.status === 'pending' ? '진행중' : '실패'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewReceipt(tx)}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg"
                      >
                        영수증 보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTx && receiptModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6 max-w-lg w-full mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">트랜잭션 영수증</h3>
              <button 
                onClick={closeReceiptModal}
                className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">트랜잭션 유형:</span>
                <span>{formatTransactionType(selectedTx.type)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">상태:</span>
                <div className={`px-2 py-0.5 text-xs rounded-full flex items-center ${getStatusColor(selectedTx.status)}`}>
                  {getStatusIcon(selectedTx.status)} 
                  <span>{selectedTx.status === 'completed' ? '완료' : selectedTx.status === 'pending' ? '진행중' : '실패'}</span>
                </div>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">금액:</span>
                <span>{selectedTx.amount} {selectedTx.currency}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">날짜:</span>
                <span>{formatDate(selectedTx.timestamp)}</span>
              </div>
              <div className="pt-2 border-t border-gray-600 mt-2">
                <div className="text-gray-400 mb-1">트랜잭션 해시:</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate">{selectedTx.hash}</span>
                  <a 
                    href={`https://testnet.xrpl.org/transactions/${selectedTx.hash}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 ml-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            
            <button
              onClick={downloadReceipt}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 flex items-center justify-center"
            >
              <Download className="h-5 w-5 mr-2" />
              영수증 다운로드
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptsPage;