'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Web3Context } from '@/app/context/Web3Context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CheckCircle } from 'lucide-react';
import xrpl from 'xrpl'; // Import the XRPL library

const PaymentPage = () => {
  const { account, signer, connected, connect, balance } = useContext(Web3Context);
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

    if (!xrpl.utils.isValidAddress(recipient)) {
      setStatus({ type: 'error', message: 'Invalid recipient address' });
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      if (currency === 'XRP') {
        // For XRP transfers
        const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233'); // Testnet client
        await client.connect();

        const preparedTx = await client.autofill({
          TransactionType: 'Payment',
          Account: account,
          Destination: recipient,
          Amount: xrpl.xrpToDrops(amount), // Convert XRP amount to drops
        });

        const signedTx = client.sign(preparedTx, signer);
        const tx = await client.submit(signedTx.tx_blob);

        setTxHash(tx.result.tx_json.hash);
        await client.waitForTransaction(tx.result.tx_json.hash);

        // Save transaction to your backend (if needed)
        // await saveTransaction({
        //   from: account,
        //   to: recipient,
        //   amount,
        //   currency,
        //   txHash: tx.result.tx_json.hash,
        //   status: 'completed'
        // });

        setStatus({ type: 'success', message: 'Payment successful!' });

        await client.disconnect();
      } else {
        setStatus({ type: 'error', message: 'Token transfers not implemented in this demo' });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setStatus({ type: 'error', message: error.message || 'Payment failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
        Make a Payment
      </h1>
      
      <Card className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Recipient Address</label>
            <Input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="r..."
              className="w-full bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Currency</label>
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
            <label className="block text-sm font-medium mb-2">Amount</label>
            <div className="relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.001"
                className="w-full bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 text-sm">
                {currency}
              </div>
            </div>
            {connected && (
              <p className="mt-1 text-sm text-gray-400">
                Balance: {parseFloat(balance).toFixed(4)} XRP
              </p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium rounded-lg py-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : connected ? (
              'Send Payment'
            ) : (
              'Connect Wallet'
            )}
          </Button>
          
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
                  View transaction
                </a>
              )}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default PaymentPage;
