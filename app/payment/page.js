'use client';

import { useState, useContext, useEffect } from 'react';
import { Web3Context } from '@/app/context/Web3Context';
import { Receipt } from '@/app/receipts/page';
import { useRouter } from 'next/navigation';
import * as xrpl from 'xrpl';
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ArrowRight, 
  CreditCard, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Globe, 
  Clock
} from 'lucide-react';

// Spinner 컴포넌트
const Spinner = () => (
  <Loader2 className="h-5 w-5 animate-spin" />
);

const PaymentPage = () => {
  const router = useRouter();
  const { account, wallet, connected, connect, balance, sendTransaction } = useContext(Web3Context);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [currency, setCurrency] = useState('XRP');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // 예시 대학교 목록
  const universities = [
    { name: '한양대학교', address: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' },
    { name: '하버드', address: 'rDsbeomae4FXwgQTJp9Rs64Qg9vDiTCdBv' },
    { name: '스탠포드', address: 'rJb5KsHsDHF1YS5B5DU6QCkH5NsPaKQTcy' },
  ];

  const currencies = [
    { value: 'XRP', label: 'XRP (XRP)', icon: '💎' },
    { value: 'USDT', label: 'Tether (USDT)', icon: '💵' },
    { value: 'USDC', label: 'USD Coin (USDC)', icon: '💲' },
  ];

  // 배경 애니메이션 효과
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
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

  const selectUniversity = (university) => {
    setRecipient(university.address);
    setMemo(`${university.name} 학비 결제`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connected) {
      await connect();
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (!xrpl.isValidAddress(recipient)) {
      setStatus({ type: 'error', message: '유효하지 않은 수신자 주소입니다' });
      return;
    }

    try {
      setLoading(true);
      setStatus({ type: 'info', message: '트랜잭션 처리 중...' });

      if (currency === 'XRP') {
        // Web3Context의 sendTransaction 함수 사용
        const transaction = {
          TransactionType: 'Payment',
          Account: account,
          Destination: recipient,
          Amount: xrpl.xrpToDrops(amount),
        };
        
        // 메모가 있는 경우 추가
        if (memo) {
          transaction.Memos = [{
            Memo: {
              MemoData: Buffer.from(memo).toString('hex').toUpperCase()
            }
          }];
        }

        const result = await sendTransaction(transaction);
        
        if (result && result.result) {
          setTxHash(result.result.hash);
          setStatus({ type: 'success', message: '결제가 성공적으로 처리되었습니다!' });
          setShowConfetti(true);
          
          // 5초 후 컨페티 효과 제거
          setTimeout(() => {
            setShowConfetti(false);
          }, 5000);
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

  const resetForm = () => {
    setStep(1);
    setAmount('');
    setRecipient('');
    setMemo('');
    setStatus(null);
    setTxHash('');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* 동적 배경 효과 */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-black">
          <div 
            className="absolute rounded-full w-[800px] h-[800px] blur-[120px] opacity-30"
            style={{ 
              background: 'radial-gradient(circle, rgba(0,123,255,1) 0%, rgba(0,123,255,0) 70%)', 
              top: `${mousePosition.y * 0.1}px`, 
              left: `${mousePosition.x * 0.1}px` 
            }}
          ></div>
          <div 
            className="absolute rounded-full w-[600px] h-[600px] blur-[100px] opacity-20"
            style={{ 
              background: 'radial-gradient(circle, rgba(102,16,242,1) 0%, rgba(102,16,242,0) 70%)', 
              top: `${window.innerHeight - mousePosition.y * 0.2}px`, 
              right: `${window.innerWidth - mousePosition.x * 0.2}px` 
            }}
          ></div>
        </div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      {/* 컨페티 효과 */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-5%',
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  background: `hsl(${Math.random() * 360}, 100%, 70%)`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div className="flex-grow flex flex-col md:flex-row items-stretch relative z-10">
        <div className="w-full md:w-1/2 p-6 flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                {step === 1 ? '빠르고 안전한 결제' : '결제 확인'}
              </h1>
              <p className="text-gray-400 mt-2">XRP를 이용한 글로벌 금융 서비스</p>
            </div>

            {/* 단계 표시기 */}
            <div className="flex items-center justify-center mb-8">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <span className="text-white text-sm">1</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <span className="text-white text-sm">2</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <span className="text-white text-sm">3</span>
              </div>
            </div>

            {/* 단계 1: 결제 정보 입력 */}
            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium mb-1 text-gray-300">학교 선택</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {universities.map((uni) => (
                      <button
                        type="button"
                        key={uni.name}
                        onClick={() => selectUniversity(uni)}
                        className={`py-3 px-4 rounded-lg border ${
                          recipient === uni.address
                            ? 'border-blue-500 bg-blue-900/30 text-white'
                            : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        {uni.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium mb-1 text-gray-300">직접 입력 (수신자 주소)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="r..."
                      className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium mb-1 text-gray-300">통화 선택</label>
                  <div className="relative">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    >
                      {currencies.map(option => (
                        <option key={option.value} value={option.value}>{option.icon} {option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium mb-1 text-gray-300">금액</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.001"
                      className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white pr-16"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                      {currency}
                    </div>
                  </div>
                  {connected && (
                    <p className="mt-1 text-sm text-gray-400 flex items-center">
                      <span>잔액: {parseFloat(balance).toFixed(4)} XRP</span>
                      {parseFloat(amount) > parseFloat(balance) && (
                        <span className="ml-1 text-red-500 text-xs flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> 잔액 부족
                        </span>
                      )}
                    </p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium mb-1 text-gray-300">메모 (선택사항)</label>
                  <div className="relative">
                    <textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="결제 목적 또는 참고사항"
                      className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      rows="2"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium rounded-lg py-3 text-white flex items-center justify-center gap-2 relative overflow-hidden group"
                  disabled={loading || !amount || !recipient}
                >
                  {loading ? (
                    <>
                      <Spinner className="mr-2" />
                      처리 중...
                    </>
                  ) : connected ? (
                    <>
                      다음 단계
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  ) : (
                    <>
                      지갑 연결하기
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 단계 2: 결제 확인 */}
            {step === 2 && (
              <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-center">결제 정보 확인</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-3 border-b border-gray-800">
                    <span className="text-gray-400">수신자</span>
                    <span className="font-medium text-white">{recipient.substring(0, 6)}...{recipient.substring(recipient.length - 4)}</span>
                  </div>
                  
                  <div className="flex justify-between py-3 border-b border-gray-800">
                    <span className="text-gray-400">금액</span>
                    <span className="font-medium text-white">{amount} {currency}</span>
                  </div>
                  
                  {memo && (
                    <div className="flex justify-between py-3 border-b border-gray-800">
                      <span className="text-gray-400">메모</span>
                      <span className="font-medium text-white">{memo}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-3 border-b border-gray-800">
                    <span className="text-gray-400">수수료</span>
                    <span className="font-medium text-green-400">~0.00001 XRP</span>
                  </div>
                  
                  <div className="flex justify-between py-3">
                    <span className="text-gray-400">예상 처리 시간</span>
                    <span className="font-medium text-white">3-5초</span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
                  >
                    이전
                  </button>
                  
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium rounded-lg py-3 text-white flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner className="mr-2" />
                        처리 중...
                      </>
                    ) : (
                      '결제 실행'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 결제 상태 */}
            {status && (
              <div className={`mt-6 p-4 rounded-lg ${
                status.type === 'error' ? 'bg-red-900/20 text-red-400 border border-red-800/50' : 
                status.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-800/50' :
                'bg-blue-900/20 text-blue-400 border border-blue-800/50'
              }`}>
                <div className="flex items-start">
                  {status.type === 'error' ? (
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  ) : status.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Loader2 className="h-5 w-5 mr-2 mt-0.5 animate-spin flex-shrink-0" />
                  )}
                  <div>
                    <p>{status.message}</p>
                    {txHash && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-sm mb-1">트랜잭션 해시:</p>
                        <div className="flex items-center justify-between">
                          <code className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300 overflow-hidden overflow-ellipsis">{txHash}</code>
                          <a 
                            href={`https://testnet.xrpl.org/transactions/${txHash}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <button 
                            onClick={() => router.push('/receipts')}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                          >
                            <div className="h-4 w-4 mr-2" />
                            영수증 보기
                          </button>
                          <button
                            onClick={resetForm}
                            className="flex-1 bg-blue-900/30 hover:bg-blue-900/50 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            새 결제
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 정보 패널 */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-md p-6 flex items-center justify-center hidden md:block">
          <div className="max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              AccelPay로 결제하세요
            </h2>
            
            <div className="space-y-6">
              <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-lg bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <Globe className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-white">글로벌 송금</h3>
                    <p className="text-gray-400 text-sm mt-1">국가간 경계 없이 빠르고 저렴하게 송금하세요. 수수료는 1% 미만입니다.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-lg bg-green-900/50 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-white">초고속 결제</h3>
                    <p className="text-gray-400 text-sm mt-1">3-5초 내에 트랜잭션이 확정됩니다. 기존 금융기관보다 수천 배 빠릅니다.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-lg bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-white">안전한 블록체인</h3>
                    <p className="text-gray-400 text-sm mt-1">XRP Ledger의 검증된 보안 기술로 안전한 거래를 보장합니다.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">XRP 시세</p>
                  <p className="text-xl font-semibold">$0.50 USD</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">네트워크 상태</p>
                  <p className="text-green-400 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    정상 운영중
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;