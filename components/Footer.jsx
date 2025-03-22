import React from 'react';
import { Github, Twitter, Globe, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AccelPay
            </Link>
            <p className="mt-2 text-gray-400 text-sm">
              The future of payments on XRP Ledger. Fast, secure, and decentralized.
            </p>
            <div className="flex mt-4 space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Website</span>
                <Globe size={20} />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Products</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/payment" className="text-gray-400 hover:text-white text-sm">
                  Payments
                </Link>
              </li>
              <li>
                <Link to="/nft" className="text-gray-400 hover:text-white text-sm">
                  NFT Issuance
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="text-gray-400 hover:text-white text-sm">
                  Wallet Management
                </Link>
              </li>
              <li>
                <Link to="/receipts" className="text-gray-400 hover:text-white text-sm">
                  Payment Tracking
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm flex items-center">
                  Documentation <ArrowUpRight size={14} className="ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm flex items-center">
                  API Reference <ArrowUpRight size={14} className="ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm flex items-center">
                  XRP Ledger Docs <ArrowUpRight size={14} className="ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm flex items-center">
                  Developer Hub <ArrowUpRight size={14} className="ml-1" />
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom section with legal links */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} AccelPay. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
          
          {/* Network Status */}
          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-400 text-xs">All systems operational</span>
            </div>
            <span className="mx-3 text-gray-600">•</span>
            <a href="#" className="text-blue-400 hover:text-blue-300 text-xs flex items-center">
              Status <ArrowUpRight size={10} className="ml-1" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;