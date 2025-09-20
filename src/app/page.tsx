'use client';

import { useState, useEffect } from 'react';
import TokenInput from '@/components/TokenInput';
import TokenDashboard from '@/components/TokenDashboard';
import { Coins } from 'lucide-react';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [userName, setUserName] = useState('');

  const handleTokenAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Load user name from localStorage or prompt for it
  useEffect(() => {
    const savedName = localStorage.getItem('crypto-checker-username');
    if (savedName) {
      setUserName(savedName);
    } else {
      const name = prompt('What should we call you? (This will be shown when you add tokens)') || 'Anonymous';
      setUserName(name);
      localStorage.setItem('crypto-checker-username', name);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Crypto Checker
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your favorite crypto tokens by contract address
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Add Token Form */}
          <TokenInput onTokenAdded={handleTokenAdded} userName={userName} />
          
          {/* Token Dashboard */}
          <TokenDashboard key={refreshKey} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Built with Next.js, TypeScript, and Tailwind CSS
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Data provided by CoinGecko & DexScreener APIs
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
