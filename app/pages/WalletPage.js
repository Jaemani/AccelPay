'use client';

import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '@/app/context/Web3Context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, ExternalLink, RefreshCw, Wallet, Send, CreditCard, Coins } from 'lucide-react';

const WalletPage = () => {
  const { account, provider, balance, connected, connect, refreshBalance } = useContext(Web3Context);
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('assets');

  useEffect(() => {
    if (connected) {
      fetchWalletData();
    }
  }, [connected, account]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Refresh ETH balance
      refreshBalance();
      
      // Fetch ERC-20 tokens
      const userTokens = await getUserTokens(account);
      setTokens(userTokens.tokens || []);
      
      // Fetch NFTs (mock data for example)
      setNfts([
        { id: 1, name: 'CryptoPunk #3100', collection: 'CryptoPunks', image: '/api/placeholder/100/100' },
        { id: 2, name: 'Bored Ape #7329', collection: 'BAYC', image: '/api/placeholder/100/100' },
        { id: 3, name: 'Azuki #1234', collection: 'Azuki', image: '/api/placeholder/100/100' }
      ]);
      
      // Fetch recent transactions (mock data for example)
      setTransactions([
        { hash: '0x123...abc', type: 'send', amount: '0.5 ETH', timestamp: Date.now() - 86400000, status: 'confirmed' },
        { hash: '0x456...def', type: 'receive', amount: '100 USDC', timestamp: Date.now() - 172800000, status: 'confirmed' },
        { hash: '0x789...ghi', type: 'swap', amount: '1 ETH → 1800 USDC', timestamp: Date.now() - 259200000, status: 'confirmed' }
      ]);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    // You could add toast notification here
  };

  const viewOnExplorer = () => {
    window.open(`https://etherscan.io/address/${account}`, '_blank');
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!connected) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <Wallet className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Connect your wallet</h2>
        <p className="text-gray-400 mb-6">Connect your wallet to view your assets and transactions</p>
        <Button 
          onClick={connect}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-medium rounded-lg px-6 py-3"
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4 md:mb-0">
          My Wallet
        </h1>
        
        <div className="flex items-center bg-gray-800 rounded-lg p-2 border border-gray-700">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="font-medium mr-2">{formatAddress(account)}</span>
          <button onClick={copyAddress} className="p-1 text-gray-400 hover:text-white">
            <Copy className="h-4 w-4" />
          </button>
          <button onClick={viewOnExplorer} className="p-1 text-gray-400 hover:text-white">
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-gray-700 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Total Balance</h3>
              <p className="text-2xl font-bold">{parseFloat(balance).toFixed(4)} ETH</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-full">
              <Coins className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-gray-400">≈ ${(parseFloat(balance) * 2500).toFixed(2)} USD</p>
        </Card>
        
        <Card className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-sm font-medium text-gray-400">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-16 bg-gray-700/50 border-gray-600 hover:bg-gray-700"
              onClick={() => window.location.href = '/payment'}
            >
              <Send className="h-5 w-5 mb-1" />
              <span className="text-xs">Send</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-16 bg-gray-700/50 border-gray-600 hover:bg-gray-700"
              onClick={() => window.open('https://app.uniswap.org', '_blank')}
            >
              <CreditCard className="h-5 w-5 mb-1" />
              <span className="text-xs">Buy</span>
            </Button>
          </div>
        </Card>
        
        <Card className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Network</h3>
              <p className="font-medium">Ethereum Mainnet</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-2 bg-gray-700/50 border-gray-600 hover:bg-gray-700"
            onClick={fetchWalletData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </Card>
      </div>
      
      <Card className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="nfts">NFTs</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="assets" className="p-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-4 text-gray-400 font-medium">Token</th>
                  <th className="pb-4 text-gray-400 font-medium text-right">Balance</th>
                  <th className="pb-4 text-gray-400 font-medium text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                        <span className="text-xs font-bold">ETH</span>
                      </div>
                      <div>
                        <p className="font-medium">Ethereum</p>
                        <p className="text-xs text-gray-400">ETH</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-right font-medium">{parseFloat(balance).toFixed(4)}</td>
                  <td className="py-4 text-right font-medium">${(parseFloat(balance) * 2500).toFixed(2)}</td>
                </tr>
                
                {tokens.map((token, index) => (
                  <tr key={token.symbol} className="border-b border-gray-700">
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                          <span className="text-xs font-bold">{token.symbol}</span>
                        </div>
                        <div>
                          <p className="font-medium">{token.name}</p>
                          <p className="text-xs text-gray-400">{token.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right font-medium">{token.balance}</td>
                    <td className="py-4 text-right font-medium">${token.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
          
          <TabsContent value="nfts" className="p-6">
            {loading ? (
              <div className="flex justify-center items-center">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nfts.map((nft) => (
                  <Card key={nft.id} className="bg-gray-700/50 border-gray-600 rounded-lg shadow-lg">
                    <img src={nft.image} alt={nft.name} className="w-full h-64 object-cover rounded-t-lg" />
                    <div className="p-4">
                      <h4 className="text-lg font-medium text-white">{nft.name}</h4>
                      <p className="text-sm text-gray-400">{nft.collection}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="activity" className="p-6">
            {loading ? (
              <div className="flex justify-center items-center">
                <Spinner />
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-4 text-gray-400 font-medium">Type</th>
                    <th className="pb-4 text-gray-400 font-medium">Amount</th>
                    <th className="pb-4 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn, index) => (
                    <tr key={txn.hash} className="border-b border-gray-700">
                      <td className="py-4">{txn.type}</td>
                      <td className="py-4">{txn.amount}</td>
                      <td className="py-4">{txn.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default WalletPage;
