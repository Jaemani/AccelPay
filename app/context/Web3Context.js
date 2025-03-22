'use client';
import React, { createContext, useState, useCallback, useEffect } from 'react';
import * as xrpl from 'xrpl';

export const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  
  // 초기화 시 로컬 스토리지에서 지갑 복구 시도
  useEffect(() => {
    const savedWalletSeed = localStorage.getItem('walletSeed');
    if (savedWalletSeed) {
      try {
        const recoveredWallet = xrpl.Wallet.fromSeed(savedWalletSeed);
        setWallet(recoveredWallet);
        setAccount(recoveredWallet.address);
        setIsConnected(true);
        fetchBalance(recoveredWallet.address);
      } catch (error) {
        console.error("저장된 지갑 복구 실패:", error);
        localStorage.removeItem('walletSeed');
      }
    }
  }, []);

  // 잔액 조회 함수
  const fetchBalance = async (address) => {
    try {
      const response = await fetch(`/api/wallet/balance?address=${address}`);
      if (!response.ok) throw new Error('잔액 조회 실패');
      
      const data = await response.json();
      if (data.success) {
        setBalance(data.data.balance);
      }
    } catch (error) {
      console.error("잔액 조회 오류:", error);
      setBalance('0');
    }
  };

  // 지갑 연결 함수
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      
      // 기존 지갑이 있는 경우
      if (wallet) {
        await fetchBalance(wallet.address);
        setLoading(false);
        return wallet;
      }
      
      // 새 지갑 생성 (백엔드 API 호출)
      const response = await fetch('/api/wallet/create', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('지갑 생성 실패');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '지갑 생성 실패');
      }
      
      // 생성된 지갑 정보 설정
      const newWallet = xrpl.Wallet.fromSeed(data.data.seed);
      setWallet(newWallet);
      setAccount(data.data.address);
      setBalance(data.data.balance || '0');
      setIsConnected(true);
      
      // 로컬 스토리지에 지갑 시드 저장 (실제 서비스에서는 보안상 위험할 수 있음)
      localStorage.setItem('walletSeed', data.data.seed);
      
      setLoading(false);
      return newWallet;
    } catch (error) {
      console.error("지갑 연결 오류:", error);
      setLoading(false);
      return null;
    }
  }, [wallet]);

  // 지갑 연결 해제 함수
  const disconnectWallet = useCallback(() => {
    setWallet(null);
    setAccount(null);
    setIsConnected(false);
    setBalance('0');
    localStorage.removeItem('walletSeed');
  }, []);
  
  // 잔액 새로고침 함수
  const refreshBalance = useCallback(async () => {
    if (account) {
      await fetchBalance(account);
    }
  }, [account]);
  
  const value = {
    account,
    wallet,
    isConnected,
    balance,
    loading,
    connectWallet,
    disconnectWallet,
    refreshBalance
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