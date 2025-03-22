'use client';

import React, { useState, useContext, useEffect } from 'react';
import { Web3Context } from '@/app/context/Web3Context';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { Wallet, Menu, X, ChevronDown, ExternalLink } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { account, connectWallet, disconnectWallet, balance } = useContext(Web3Context);
  const pathname = usePathname();

  // Check if the page is scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Truncate wallet address for display
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Navigation links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Payments', path: '/payment' },
    { name: 'NFTs', path: '/nft-issue' },
    { name: 'Receipts', path: '/receipts' },
    { name: 'Wallet', path: '/wallet' }
  ];

  // Close menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <nav className={`fixed w-full z-30 transition-all duration-300 ${
      isScrolled ? 'bg-black/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AccelPay
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-white bg-blue-600'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Wallet Connection / Account Info */}
          <div className="hidden md:flex items-center gap-4">
            {account ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <Wallet size={16} />
                  <span>{truncateAddress(account)}</span>
                  <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
                        <div>Balance</div>
                        <div className="font-medium text-white">{balance} XRP</div>
                      </div>
                      <Link
                        to="/wallet"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        role="menuitem"
                      >
                        Manage Wallet
                      </Link>
                      <a
                        href={`https://testnet.xrpscan.com/account/${account}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        role="menuitem"
                      >
                        View on Explorer
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                        role="menuitem"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4 py-2 flex items-center gap-2 text-white"
              >
                <Wallet size={16} />
                Connect Wallet
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {account && (
              <Button
                className="mr-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={() => {}}
              >
                <Wallet size={16} className="mr-1" /> 
                {truncateAddress(account)}
              </Button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 shadow-xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.path
                    ? 'text-white bg-blue-600'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {!account && (
              <Button
                onClick={connectWallet}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 mt-3"
              >
                <Wallet size={16} className="mr-2" />
                Connect Wallet
              </Button>
            )}
            {account && (
              <button
                onClick={disconnectWallet}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-700"
              >
                Disconnect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;