'use client';
import React, { createContext, useState, useCallback, useEffect } from 'react';
import * as xrpl from 'xrpl';

export const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletType, setWalletType] = useState(null); // 'gemwallet' or 'local'

  // 테스트넷 서버 URL
  const TESTNET_URL = "wss://s.altnet.rippletest.net:51233";
  
  // XRPL 클라이언트 생성 함수
  const createClient = async () => {
    const client = new xrpl.Client(TESTNET_URL);
    await client.connect();
    return client;
  };

  // 초기화 시 로컬 스토리지에서 지갑 복구 시도
  useEffect(() => {
    const savedWalletSeed = localStorage.getItem('walletSeed');
    const savedWalletType = localStorage.getItem('walletType');
    
    if (savedWalletType === 'gemwallet') {
      // GemWallet 세션이 저장되어 있는 경우 다시 연결 시도
      checkGemWalletConnection();
    } else if (savedWalletSeed) {
      try {
        const recoveredWallet = xrpl.Wallet.fromSeed(savedWalletSeed);
        setWallet(recoveredWallet);
        setAccount(recoveredWallet.address);
        setConnected(true);
        setWalletType('local');
        fetchBalance(recoveredWallet.address);
      } catch (error) {
        console.error("저장된 지갑 복구 실패:", error);
        localStorage.removeItem('walletSeed');
        localStorage.removeItem('walletType');
        setError("저장된 지갑을 복구하는 데 실패했습니다.");
      }
    }
  }, []);

  // GemWallet 연결 확인
  const checkGemWalletConnection = async () => {
    try {
      // GemWallet API를 사용할 수 있는지 확인
      if (typeof window !== 'undefined' && window.GemWalletApi) {
        const isGemWalletConnected = await window.GemWalletApi.isConnected();
        
        if (isGemWalletConnected) {
          const address = await window.GemWalletApi.getAddress();
          
          if (address) {
            setAccount(address);
            setConnected(true);
            setWalletType('gemwallet');
            localStorage.setItem('walletType', 'gemwallet');
            fetchBalance(address);
          }
        }
      } else if (typeof window !== 'undefined' && typeof window.gemWallet !== 'undefined') {
        // 또는 NPM 패키지를 통한 접근 방식
        const { isConnected, getAddress } = window.gemWallet;
        const isGemWalletConnected = await isConnected();
        
        if (isGemWalletConnected) {
          const address = await getAddress();
          
          if (address) {
            setAccount(address);
            setConnected(true);
            setWalletType('gemwallet');
            localStorage.setItem('walletType', 'gemwallet');
            fetchBalance(address);
          }
        }
      }
    } catch (error) {
      console.error("GemWallet 연결 확인 오류:", error);
    }
  };

  // 잔액 조회 함수
  const fetchBalance = async (address) => {
    try {
      setLoading(true);
      const client = await createClient();
      
      const response = await client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      });
      
      const xrpBalance = xrpl.dropsToXrp(response.result.account_data.Balance);
      setBalance(xrpBalance);
      setError(null);
      
      await client.disconnect();
    } catch (error) {
      console.error("잔액 조회 오류:", error);
      
      // 계정이 아직 활성화되지 않았거나 존재하지 않는 경우
      if (error.message && error.message.includes('Account not found')) {
        setBalance('0');
      } else {
        setError("잔액 조회 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 지갑 생성 함수 (테스트용)
  const createWallet = async () => {
    try {
      setLoading(true);
      const client = await createClient();
      
      // 테스트넷에서 자금이 있는 새 지갑 생성
      const { wallet: newWallet, balance: initialBalance } = await client.fundWallet();
      
      setWallet(newWallet);
      setAccount(newWallet.address);
      setConnected(true);
      setWalletType('local');
      setBalance(xrpl.dropsToXrp(initialBalance));
      setError(null);
      
      // 로컬 스토리지에 지갑 시드 저장 (실제 서비스에서는 보안상 위험할 수 있음)
      localStorage.setItem('walletSeed', newWallet.seed);
      localStorage.setItem('walletType', 'local');
      
      await client.disconnect();
      return newWallet;
    } catch (error) {
      console.error("지갑 생성 오류:", error);
      setError("지갑 생성 중 오류가 발생했습니다.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // GemWallet 연결 함수
  const connectGemWallet = async () => {
    try {
      setLoading(true);
      
      // GemWallet API 사용 가능 여부 확인
      if (typeof window !== 'undefined' && window.GemWalletApi) {
        const isGemWalletInstalled = await window.GemWalletApi.isConnected();
        
        if (!isGemWalletInstalled) {
          setError("GemWallet 확장 프로그램이 설치되어 있지 않습니다.");
          return null;
        }
        
        // 주소 가져오기
        const address = await window.GemWalletApi.getAddress();
        
        if (address) {
          setAccount(address);
          setConnected(true);
          setWalletType('gemwallet');
          localStorage.setItem('walletType', 'gemwallet');
          
          // 네트워크 확인
          const network = await window.GemWalletApi.getNetwork();
          console.log(`연결된 네트워크: ${network}`);
          
          // 잔액 조회
          await fetchBalance(address);
          
          return { address };
        } else {
          setError("사용자가 주소 공유를 거부했습니다.");
        }
      } else if (typeof window !== 'undefined' && typeof window.gemWallet !== 'undefined') {
        // 또는 NPM 패키지를 통한 접근 방식
        const { isConnected, getAddress, getNetwork } = window.gemWallet;
        const isGemWalletInstalled = await isConnected();
        
        if (!isGemWalletInstalled) {
          setError("GemWallet 확장 프로그램이 설치되어 있지 않습니다.");
          return null;
        }
        
        // 주소 가져오기
        const address = await getAddress();
        
        if (address) {
          setAccount(address);
          setConnected(true);
          setWalletType('gemwallet');
          localStorage.setItem('walletType', 'gemwallet');
          
          // 네트워크 확인
          const network = await getNetwork();
          console.log(`연결된 네트워크: ${network}`);
          
          // 잔액 조회
          await fetchBalance(address);
          
          return { address };
        } else {
          setError("사용자가 주소 공유를 거부했습니다.");
        }
      } else {
        setError("GemWallet이 설치되어 있지 않습니다. 먼저 GemWallet 확장 프로그램을 설치해주세요.");
      }
      
      return null;
    } catch (error) {
      console.error("GemWallet 연결 오류:", error);
      setError(`GemWallet 연결 중 오류가 발생했습니다: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 지갑 연결 함수 (GemWallet 또는 로컬 지갑)
  const connect = useCallback(async (type = 'gemwallet') => {
    if (connected) return wallet || { address: account };
    
    if (type === 'gemwallet') {
      return await connectGemWallet();
    } else if (type === 'local') {
      // 이미 지갑이 있으면 잔액만 새로고침
      if (wallet) {
        await fetchBalance(wallet.address);
        setConnected(true);
        return wallet;
      }
      
      // 없으면 새 지갑 생성 (테스트용)
      return await createWallet();
    }
  }, [wallet, connected, account]);

  // 지갑 연결 해제 함수
  const disconnect = useCallback(() => {
    setWallet(null);
    setAccount(null);
    setConnected(false);
    setBalance('0');
    setWalletType(null);
    localStorage.removeItem('walletSeed');
    localStorage.removeItem('walletType');
    setError(null);
  }, []);
  
  // 잔액 새로고침 함수
  const refreshBalance = useCallback(async () => {
    if (account) {
      await fetchBalance(account);
    }
  }, [account]);
  
  // 트랜잭션 전송 함수
  const sendTransaction = useCallback(async (transaction) => {
    if (!connected) {
      setError("지갑이 연결되지 않았습니다.");
      return null;
    }
    
    try {
      setLoading(true);
      
      if (walletType === 'gemwallet') {
        // GemWallet을 통한 트랜잭션 처리
        if (transaction.TransactionType === 'Payment') {
          const payment = {
            amount: xrpl.dropsToXrp(transaction.Amount),
            destination: transaction.Destination,
          };
          
          // 통화 및 발행자가 있는 경우 (토큰 전송)
          if (transaction.Amount && typeof transaction.Amount === 'object') {
            payment.currency = transaction.Amount.currency;
            payment.issuer = transaction.Amount.issuer;
          }
          
          let txHash;
          
          if (typeof window !== 'undefined' && window.GemWalletApi) {
            txHash = await window.GemWalletApi.sendPayment(payment);
          } else if (typeof window !== 'undefined' && typeof window.gemWallet !== 'undefined') {
            const { sendPayment } = window.gemWallet;
            txHash = await sendPayment(payment);
          }
          
          if (!txHash) {
            throw new Error('트랜잭션이 취소되었거나 실패했습니다.');
          }
          
          // 잔액 새로고침
          await fetchBalance(account);
          
          // 트랜잭션 해시로 결과 조회
          const client = await createClient();
          const txResult = await client.request({
            command: 'tx',
            transaction: txHash
          });
          
          await client.disconnect();
          
          return txResult;
        } else {
          throw new Error(`GemWallet은 현재 ${transaction.TransactionType} 트랜잭션 유형을 지원하지 않습니다.`);
        }
      } else if (walletType === 'local' && wallet) {
        // 로컬 지갑을 통한 트랜잭션 처리
        const client = await createClient();
        
        // 트랜잭션 자동 채우기
        const prepared = await client.autofill(transaction);
        
        // 트랜잭션 서명
        const signed = wallet.sign(prepared);
        
        // 트랜잭션 제출 및 결과 대기
        const result = await client.submitAndWait(signed.tx_blob);
        
        // 잔액 새로고침
        await fetchBalance(wallet.address);
        
        await client.disconnect();
        return result;
      } else {
        throw new Error('지갑이 올바르게 설정되지 않았습니다.');
      }
    } catch (error) {
      console.error("트랜잭션 전송 오류:", error);
      setError(`트랜잭션 전송 중 오류가 발생했습니다: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet, walletType, connected, account]);
  
  const value = {
    account,
    wallet,
    connected,
    balance,
    loading,
    error,
    walletType,
    connect,
    connectGemWallet,
    createWallet,
    disconnect,
    refreshBalance,
    sendTransaction
  };
  
  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return React.useContext(Web3Context);
}