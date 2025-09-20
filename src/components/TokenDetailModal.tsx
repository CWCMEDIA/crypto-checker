'use client';

import { useState } from 'react';
import { TokenData } from '@/types/crypto';
import { X, ExternalLink, BarChart3, Volume2, TrendingUp, TrendingDown, Globe, Shield } from 'lucide-react';

interface TokenDetailModalProps {
  token: TokenData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TokenDetailModal({ token, isOpen, onClose }: TokenDetailModalProps) {
  const [chartType, setChartType] = useState<'coingecko' | 'dexscreener' | 'tradingview'>('dexscreener');
  
  if (!isOpen || !token) return null;

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

  // Generate DexScreener URL based on token data
  const getDexScreenerUrl = () => {
    if (token.dexscreener_url) {
      return token.dexscreener_url;
    }
    // Fallback to contract address based URL
    if (token.contract_address?.startsWith('0x')) {
      return `https://dexscreener.com/ethereum/${token.contract_address}`;
    } else {
      return `https://dexscreener.com/solana/${token.contract_address}`;
    }
  };

  // Generate DexScreener embed URL with proper embed parameters
  const getDexScreenerEmbedUrl = () => {
    if (token.dexscreener_pair_address && token.dexscreener_chain) {
      return `https://dexscreener.com/${token.dexscreener_chain}/${token.dexscreener_pair_address}?embed=1&loadChartSettings=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15`;
    }
    // Fallback to contract address based URL
    if (token.contract_address?.startsWith('0x')) {
      return `https://dexscreener.com/ethereum/${token.contract_address}?embed=1&loadChartSettings=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15`;
    } else {
      return `https://dexscreener.com/solana/${token.contract_address}?embed=1&loadChartSettings=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15`;
    }
  };

  // Generate CoinGecko chart URL - this actually works!
  const getCoinGeckoChartUrl = () => {
    return `https://www.coingecko.com/en/coins/${token.id}/chart`;
  };

  // Generate TradingView widget URL - use popular tokens that actually exist
  const getTradingViewUrl = () => {
    // Map common tokens to their actual exchange symbols
    const symbolMap: { [key: string]: string } = {
      'BTC': 'BTCUSDT',
      'ETH': 'ETHUSDT', 
      'USDC': 'USDCUSDT',
      'USDT': 'USDTUSDT',
      'BNB': 'BNBUSDT',
      'ADA': 'ADAUSDT',
      'SOL': 'SOLUSDT',
      'MATIC': 'MATICUSDT',
      'DOT': 'DOTUSDT',
      'AVAX': 'AVAXUSDT'
    };
    
    const mappedSymbol = symbolMap[token.symbol] || 'BTCUSDT'; // Default to BTC if not found
    return `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${token.symbol}&symbol=BINANCE:${mappedSymbol}&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=0&range=12M&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${mappedSymbol}`;
  };

  const dexscreenerUrl = getDexScreenerUrl();
  const dexscreenerEmbedUrl = getDexScreenerEmbedUrl();
  const tradingViewUrl = getTradingViewUrl();
  const coinGeckoChartUrl = getCoinGeckoChartUrl();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <img
              src={token.image}
              alt={token.name}
              className="w-12 h-12 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-coin.svg';
              }}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {token.name}
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                {token.symbol}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Price Info */}
            <div className="space-y-6">
              {/* Price Display */}
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatPrice(token.current_price)}
                </div>
                <div className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-full inline-flex ${
                  isPositive 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="text-lg font-medium">
                    {isPositive ? '+' : ''}{token.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Market Cap</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatMarketCap(token.market_cap)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Volume2 className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">24h Volume</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatVolume(token.total_volume)}
                  </div>
                </div>
              </div>

              {/* Contract Address */}
              {token.contract_address && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Contract Address</span>
                  </div>
                  <div className="text-sm font-mono text-gray-600 dark:text-gray-300 break-all">
                    {token.contract_address}
                  </div>
                </div>
              )}

              {/* External Links */}
              <div className="space-y-3">
                <a
                  href={dexscreenerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors duration-200"
                >
                  <Globe className="w-5 h-5" />
                  <span>View on DexScreener</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Column - Live Chart */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Live Chart & Trading
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setChartType('coingecko')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      chartType === 'coingecko' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    CoinGecko
                  </button>
                  <button
                    onClick={() => setChartType('dexscreener')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      chartType === 'dexscreener' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    DexScreener
                  </button>
                  <button
                    onClick={() => setChartType('tradingview')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      chartType === 'tradingview' 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    TradingView
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                {chartType === 'coingecko' ? (
                  <div className="h-96 flex flex-col items-center justify-center">
                    <div className="text-6xl mb-4">🟢</div>
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      CoinGecko Chart
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 text-center max-w-md">
                      View live price chart and historical data
                    </p>
                    <a
                      href={coinGeckoChartUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                      <Globe className="w-5 h-5" />
                      <span>Open on CoinGecko</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ) : chartType === 'dexscreener' ? (
                  <div className="h-96">
                    <div 
                      id="dexscreener-embed" 
                      className="dexscreener-embed"
                      style={{
                        position: 'relative',
                        width: '100%',
                        paddingBottom: '125%'
                      }}
                    >
                      <iframe
                        src={getDexScreenerEmbedUrl()}
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          top: 0,
                          left: 0,
                          border: 0
                        }}
                        title={`${token.name} DexScreener Chart`}
                        allow="clipboard-write"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center">
                    <div className="text-6xl mb-4">📈</div>
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      TradingView Chart
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 text-center max-w-md">
                      {['BTC', 'ETH', 'USDC', 'USDT', 'BNB', 'ADA', 'SOL', 'MATIC', 'DOT', 'AVAX'].includes(token.symbol)
                        ? 'Chart available on TradingView'
                        : 'This token may not be available on major exchanges'
                      }
                    </p>
                    <a
                      href={`https://www.tradingview.com/chart/?symbol=BINANCE:${token.symbol}USDT`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                      <span>Open on TradingView</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 flex-wrap">
                <a
                  href={coinGeckoChartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                >
                  <Globe className="w-4 h-4" />
                  <span>CoinGecko</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={dexscreenerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                >
                  <Globe className="w-4 h-4" />
                  <span>DexScreener</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={`https://www.tradingview.com/chart/?symbol=BINANCE:${token.symbol}USDT`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                >
                  <span>TradingView</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
