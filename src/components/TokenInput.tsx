'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { CryptoAPI } from '@/lib/crypto-api';
import { TokenStorage } from '@/lib/storage';

interface TokenInputProps {
  onTokenAdded: () => void;
  userName: string;
}

export default function TokenInput({ onTokenAdded, userName }: TokenInputProps) {
  const [contractAddress, setContractAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contractAddress.trim()) {
      setError('Please enter a contract address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const api = CryptoAPI.getInstance();
      const result = await api.getTokenByContractAddress(contractAddress.trim());
      
      if (result.error) {
        setError(result.error);
      } else if (result.data.length > 0) {
        const success = await TokenStorage.addTrackedToken(contractAddress.trim(), userName);
        if (success) {
          setSuccess(`Successfully added ${result.data[0].name} (${result.data[0].symbol}) to shared list!`);
        } else {
          setSuccess(`Added ${result.data[0].name} (${result.data[0].symbol}) locally (database unavailable)`);
        }
        setContractAddress('');
        onTokenAdded();
      } else {
        setError('Token not found. Please check the contract address.');
      }
    } catch (err) {
      setError('An error occurred while fetching token data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Add Token to Track
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="contract-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contract Address (CA)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              id="contract-address"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="Enter contract address..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter the contract address of the token you want to track
            <br />
            <span className="text-blue-600 dark:text-blue-400">
              Supports: Ethereum (0x...), Solana addresses
            </span>
            <br />
            <span className="text-green-600 dark:text-green-400 text-xs">
              Powered by CoinGecko + DexScreener APIs
            </span>
            <br />
            <span className="text-gray-400">
              Examples: USDC (0xA0b86a33E6441b8C4C8C0C4C0C4C0C4C0C4C0C4C0) or SOL (So11111111111111111111111111111111111111112)
            </span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !contractAddress.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Adding Token...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add Token
            </>
          )}
        </button>
      </form>
    </div>
  );
}
