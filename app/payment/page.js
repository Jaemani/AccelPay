'use client';

import { useState, useContext } from 'react';
import { Web3Context } from '@/app/context/Web3Context';
import { useRouter } from 'next/navigation';
import * as xrpl from 'xrpl';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// Spinner 컴포넌트 직접 구현 (누락된 컴포넌트 대체)
const Spinner = () => (
  <Loader2 className="h-4 w-4 animate-spin" />
);

const PaymentPage = () => {
  const router = useRouter();
  const { account, wallet, connected, connect, balance, sendTransaction } = useContext(Web3Context);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [currency, setCurrency] = useState('XRP');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [txHash, setTxHash] = useState('');

  const currencies = [
    { value: 'XRP', label: 'XRP (XRP)' },
    { value: 'USDT', label: 'Tether (USDT)' },
    { value: 'USDC', label: 'USD Coin (USDC)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connected) {
      await connect();
      return;
    }

    if (!xrpl.isValidAddress(recipient)) {
      setStatus({ type: 'error', message: '유효하지 않은 수신자 주소입니다' });
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      if (currency === 'XRP') {
        // Web3Context의 sendTransaction 함수 사용
        const transaction = {
          TransactionType: 'Payment',
          Account: account,
          Destination: recipient,
          Amount: xrpl.xrpToDrops(amount),
        };

        const result = await sendTransaction(transaction);
        
        if (result && result.result) {
          setTxHash(result.result.hash);
          setStatus({ type: 'success', message: '결제가 성공적으로 처리되었습니다!' });
        } else {
          throw new Error('트랜잭션 처리 중 오류가 발생했습니다');
        }
      } else {
        setStatus({ type: 'error', message: '토큰 전송은 이 데모에서 구현되지 않았습니다' });
      }
    } catch (error) {
      console.error('결제 오류:', error);
      setStatus({ type: 'error', message: error.message || '결제에 실패했습니다' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
        결제하기
      </h1>
      
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">수신자 주소</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="r..."
              className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">통화</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {currencies.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">금액</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.001"
                className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 text-sm">
                {currency}
              </div>
            </div>
            {connected && (
              <p className="mt-1 text-sm text-gray-400">
                잔액: {parseFloat(balance).toFixed(4)} XRP
              </p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium rounded-lg py-3 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : connected ? (
              '결제 보내기'
            ) : (
              '지갑 연결하기'
            )}
          </button>
          
          {status && (
            <div className={`mt-4 p-3 rounded-lg ${status.type === 'error' ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'}`}>
              <div className="flex items-center">
                {status.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                <p>{status.message}</p>
              </div>
              {txHash && (
                <a 
                  href={`https://testnet.xrpl.org/transactions/${txHash}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm mt-2 block"
                >
                  트랜잭션 보기
                </a>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;