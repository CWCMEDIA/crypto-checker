'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrackedToken, TokenData } from '@/types/crypto';
import { CryptoAPI } from '@/lib/crypto-api';
import { TokenStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import TokenCard from './TokenCard';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function TokenDashboard() {
  const [trackedTokens, setTrackedTokens] = useState<TrackedToken[]>([]);
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTrackedTokens = async () => {
    const tokens = await TokenStorage.getTrackedTokens();
    setTrackedTokens(tokens);
  };

  const fetchTokenData = useCallback(async () => {
    if (trackedTokens.length === 0) return;

    setIsLoading(true);
    setError('');

    try {
      const api = CryptoAPI.getInstance();
      const contractAddresses = trackedTokens.map(token => token.contractAddress);
      const result = await api.getMultipleTokens(contractAddresses);

      if (result.error) {
        setError(result.error);
      } else {
        setTokenData(result.data);
      }
    } catch {
      setError('Failed to fetch token data');
    } finally {
      setIsLoading(false);
    }
  }, [trackedTokens]);

  const handleTokenRemoved = async (contractAddress: string) => {
    await TokenStorage.removeTrackedToken(contractAddress);
    loadTrackedTokens();
    setTokenData(prev => prev.filter(token => 
      token.contract_address?.toLowerCase() !== contractAddress.toLowerCase()
    ));
  };

  const handleRefresh = () => {
    fetchTokenData();
  };

  useEffect(() => {
    loadTrackedTokens();
  }, []);

  useEffect(() => {
    if (trackedTokens.length > 0) {
      fetchTokenData();
    } else {
      setTokenData([]);
    }
  }, [trackedTokens, fetchTokenData]);

  // Real-time updates
  useEffect(() => {
    if (!supabase) {
      console.log('Supabase not configured, skipping real-time updates');
      return;
    }

    const channel = supabase
      .channel('shared_tokens')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'shared_tokens' },
        () => {
          console.log('Token list updated, refreshing...');
          loadTrackedTokens();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (trackedTokens.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Tokens Tracked
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Add some tokens using the form above to start tracking their prices.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tracked Tokens ({trackedTokens.length})
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {isLoading && tokenData.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: trackedTokens.length }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokenData.map((token) => {
            const trackedToken = trackedTokens.find(t => 
              t.contractAddress.toLowerCase() === token.contract_address?.toLowerCase()
            );
            return (
              <TokenCard
                key={token.id}
                token={token}
                onRemove={() => handleTokenRemoved(token.contract_address!)}
                addedBy={trackedToken?.addedBy}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
