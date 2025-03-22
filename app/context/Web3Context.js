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
    if (savedWalletSeed) {
      try {
        const recoveredWallet = xrpl.Wallet.fromSeed(savedWalletSeed);
        setWallet(recoveredWallet);
        setAccount(recoveredWallet.address);
        setConnected(true);
        fetchBalance(recoveredWallet.address);
      } catch (error) {
        console.error("저장된 지갑 복구 실패:", error);
        localStorage.removeItem('walletSeed');
        setError("저장된 지갑을 복구하는 데 실패했습니다.");
      }
    }
  }, []);

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

  // 지갑 생성 함수
  const createWallet = async () => {
    try {
      setLoading(true);
      const client = await createClient();
      
      // 테스트넷에서 자금이 있는 새 지갑 생성
      const { wallet: newWallet, balance: initialBalance } = await client.fundWallet();
      
      setWallet(newWallet);
      setAccount(newWallet.address);
      setConnected(true);
      setBalance(xrpl.dropsToXrp(initialBalance));
      setError(null);
      
      // 로컬 스토리지에 지갑 시드 저장 (실제 서비스에서는 보안상 위험할 수 있음)
      localStorage.setItem('walletSeed', newWallet.seed);
      
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

  // 지갑 연결 함수
  const connect = useCallback(async () => {
    if (connected) return wallet;
    
    // 이미 지갑이 있으면 잔액만 새로고침
    if (wallet) {
      await fetchBalance(wallet.address);
      setConnected(true);
      return wallet;
    }
    
    // 없으면 새 지갑 생성
    return await createWallet();
  }, [wallet, connected]);

  // 지갑 연결 해제 함수
  const disconnect = useCallback(() => {
    setWallet(null);
    setAccount(null);
    setConnected(false);
    setBalance('0');
    localStorage.removeItem('walletSeed');
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
    if (!wallet) {
      setError("지갑이 연결되지 않았습니다.");
      return null;
    }
    
    try {
      setLoading(true);
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
    } catch (error) {
      console.error("트랜잭션 전송 오류:", error);
      setError("트랜잭션 전송 중 오류가 발생했습니다.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet]);
  
  const value = {
    account,
    wallet,
    connected,
    balance,
    loading,
    error,
    connect,
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