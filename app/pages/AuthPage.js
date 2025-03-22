'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Web3Context } from '@/app/context/Web3Context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CheckCircle, Key, Mail, User, Wallet } from 'lucide-react';

const AuthPage = () => {
  const router = useRouter();
  const { account, connected, connect } = useContext(Web3Context);
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleWalletAuth = async () => {
    if (!connected) {
      await connect();
      return;
    }
    try {
      setLoading(true);
      setStatus(null);
      setStatus({ type: 'success', message: 'Wallet authentication successful!' });
      setTimeout(() => router.push('/wallet'), 1500);
    } catch (error) {
      setStatus({ type: 'error', message: 'Authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setStatus({ type: 'success', message: 'Sign in successful!' });
      setTimeout(() => router.push('/wallet'), 1500);
    } catch (error) {
      setStatus({ type: 'error', message: 'Sign in failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
              <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
              <Button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
            </form>
          </TabsContent>
        </Tabs>
        {status && <div>{status.message}</div>}
      </Card>
    </div>
  );
};

export default AuthPage;
