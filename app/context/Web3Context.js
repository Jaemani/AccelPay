'use client';
import React, { createContext, useState, useCallback } from 'react';
import { xrpl } from 'xrpl';

export const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState(null);
  
  const connectWallet = useCallback(async () => {
    try {
      // This is a placeholder for actual XRPL wallet connection
      // You would typically connect to XRPL using their client library here
      const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
      await client.connect();
      
      // Create a test wallet or connect to existing one
      // For example purposes, just creating a test wallet
      const testWallet = xrpl.Wallet.generate();
      setWallet(testWallet);
      setAccount(testWallet.address);
      setIsConnected(true);
      
      // Don't forget to disconnect when no longer needed
      // client.disconnect();
      
      return testWallet;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      return null;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet(null);
    setAccount(null);
    setIsConnected(false);
  }, []);
  
  const value = {
    account,
    wallet,
    isConnected,
    connectWallet,
    disconnectWallet,
    // Add other state and methods you need
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