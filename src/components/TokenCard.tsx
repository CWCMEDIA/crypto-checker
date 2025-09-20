'use client';

import { TokenData } from '@/types/crypto';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Volume2, Trash2 } from 'lucide-react';
import { TokenStorage } from '@/lib/storage';

interface TokenCardProps {
  token: TokenData;
  onRemove: () => void;
  addedBy?: string;
}

export default function TokenCard({ token, onRemove, addedBy }: TokenCardProps) {
  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const isPositive = token.price_change_percentage_24h >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={token.image}
            alt={token.name}
            className="w-12 h-12 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-coin.svg';
            }}
          />
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {token.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {token.symbol}
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
          title="Remove token"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPrice(token.current_price)}
          </span>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
            isPositive 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isPositive ? '+' : ''}{token.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatMarketCap(token.market_cap)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">24h Volume</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatVolume(token.total_volume)}
              </p>
            </div>
          </div>
        </div>

        {token.contract_address && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Contract Address</p>
            <p className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
              {token.contract_address}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-400 dark:text-gray-500">
          Last updated: {new Date(token.last_updated).toLocaleString()}
          {addedBy && (
            <span className="block mt-1">
              Added by: <span className="text-blue-500">{addedBy}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
