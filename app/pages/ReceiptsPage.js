'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { XRPLContext } from '@/context/XRPLContext';  // Assuming you have a context for XRPL
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Download, ExternalLink, Receipt, Clock, CheckCircle, XCircle } from 'lucide-react';

// Example function to fetch XRPL transactions (use an actual function)
const getXRPLTransactions = async (account) => {
  // Replace this with actual logic to fetch transactions from XRPL
  return [
    {
      id: 'tx-001',
      type: 'payment',
      hash: 'rJz2Nn1qVtkG4hg...',
      from: account,
      to: 'rLcn4VGsKTjoReU...',
      amount: '500',
      currency: 'XRP',
      status: 'completed',
      timestamp: Date.now() - 86400000,
      receipt: true
    },
    // Add more mock transactions as needed
  ];
};

const ReceiptsPage = () => {
  const { account, connected, connect } = useContext(XRPLContext); // Replace with XRPLContext
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
      const txns = await getXRPLTransactions(account);
      setTransactions(txns);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.status === filter);
    }
    
    // Apply search
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

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
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
        return <CheckCircle className="h-5 w-5" />;
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'failed':
        return <XCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const downloadReceipt = () => {
    console.log('Downloading receipt for', selectedTx.id);
    alert('Receipt download started!');
  };

  const formatTransactionType = (type) => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!connected) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <Receipt className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Connect your wallet</h2>
        <p className="text-gray-400 mb-6">Connect your wallet to view your transaction receipts</p>
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
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-green-500">
        Transaction Receipts
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by tx hash, type, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600"
          />
        </div>
        
        <div>
          <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Spinner className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredTxns.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">No transactions found</h3>
            <p className="text-gray-400">
              {searchTerm || filter !== 'all' ? 
                'Try adjusting your filters' : 
                'When you make transactions, they will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr className="text-left">
                  <th className="px-4 py-3 text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-sm font-medium">Amount</th>
                  <th className="px-4 py-3 text-sm font-medium hidden md:table-cell">Transaction Hash</th>
                  <th className="px-4 py-3 text-sm font-medium hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-right">Actions</th>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleViewReceipt(tx)}
                        >
                          <ExternalLink className="h-5 w-5" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">{formatDate(tx.timestamp)}</td>
                    <td className="px-4 py-3">
                      <div className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)} {tx.status}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        onClick={() => handleViewReceipt(tx)}
                        size="sm"
                      >
                        View Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedTx && (
        <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
          <DialogContent className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6 max-w-lg mx-auto">
            <DialogHeader>
              <DialogTitle>Receipt for {selectedTx.id}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="text-gray-400 mb-4">Transaction Hash: {selectedTx.hash}</div>
              <Button
                onClick={downloadReceipt}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Download Receipt
              </Button>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setReceiptModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReceiptsPage;
