import axios from 'axios';
import { TokenData, ApiResponse } from '@/types/crypto';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const DEXSCREENER_API_BASE = 'https://api.dexscreener.com/latest/dex';

export class CryptoAPI {
  private static instance: CryptoAPI;
  private cache: Map<string, { data: TokenData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  static getInstance(): CryptoAPI {
    if (!CryptoAPI.instance) {
      CryptoAPI.instance = new CryptoAPI();
    }
    return CryptoAPI.instance;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  async getTokenByContractAddress(contractAddress: string, platform?: string): Promise<ApiResponse> {
    // Auto-detect platform based on address format
    let platformsToTry: string[] = [];
    
    if (platform) {
      platformsToTry = [platform];
    } else {
      if (contractAddress.startsWith('0x') && contractAddress.length === 42) {
        platformsToTry = ['ethereum', 'polygon-pos', 'binance-smart-chain'];
      } else if (contractAddress.length >= 32 && contractAddress.length <= 44 && !contractAddress.startsWith('0x')) {
        platformsToTry = ['solana'];
      } else {
        return { data: [], error: 'Unsupported address format. Please use Ethereum (0x...) or Solana addresses.' };
      }
    }

    let lastError: Error | null = null;

    // Try CoinGecko first
    for (const detectedPlatform of platformsToTry) {
      try {
        // Check cache first
        const cacheKey = `${contractAddress}-${detectedPlatform}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && this.isCacheValid(cached.timestamp)) {
          return { data: [cached.data] };
        }

        // Fetch from CoinGecko API
        const response = await axios.get(
          `${COINGECKO_API_BASE}/coins/${detectedPlatform}/contract/${contractAddress}`,
          {
            params: {
              vs_currency: 'usd',
              include_market_cap: true,
              include_24hr_vol: true,
              include_24hr_change: true,
              include_last_updated_at: true
            }
          }
        );

        const tokenData: TokenData = {
          id: response.data.id,
          symbol: response.data.symbol.toUpperCase(),
          name: response.data.name,
          current_price: response.data.market_data.current_price.usd,
          price_change_percentage_24h: response.data.market_data.price_change_percentage_24h,
          market_cap: response.data.market_data.market_cap.usd,
          total_volume: response.data.market_data.total_volume.usd,
          image: response.data.image.small,
          contract_address: contractAddress,
          last_updated: new Date().toISOString()
        };

        // Cache the result
        this.cache.set(cacheKey, { data: tokenData, timestamp: Date.now() });

        return { data: [tokenData] };
      } catch (error: unknown) {
        lastError = error as Error;
        console.log(`CoinGecko failed for ${detectedPlatform}:`, (error as any).response?.status);
        
        // If it's not a 404, don't try other platforms
        if ((error as any).response?.status !== 404) {
          break;
        }
      }
    }

    // If CoinGecko failed, try DexScreener
    console.log('Trying DexScreener as fallback...');
    try {
      const dexScreenerResult = await this.getTokenFromDexScreener(contractAddress);
      if (dexScreenerResult.data.length > 0) {
        return dexScreenerResult;
      }
    } catch (error) {
      console.log('DexScreener also failed:', error);
    }

    // All platforms failed
    console.error('Error fetching token data from all platforms:', lastError);
    
    if ((lastError as any)?.response?.status === 404) {
      return { 
        data: [], 
        error: `Token not found on CoinGecko or DexScreener. This token may not be listed or the address might be incorrect.` 
      };
    } else if ((lastError as any)?.response?.status === 429) {
      return { 
        data: [], 
        error: 'Rate limit exceeded. Please try again in a moment.' 
      };
    } else if ((lastError as any)?.code === 'ENOTFOUND' || (lastError as any)?.code === 'ECONNREFUSED') {
      return { 
        data: [], 
        error: 'Network error. Please check your internet connection.' 
      };
    }
    
    return { 
      data: [], 
      error: lastError instanceof Error ? lastError.message : 'Failed to fetch token data' 
    };
  }

  private async getTokenFromDexScreener(contractAddress: string): Promise<ApiResponse> {
    try {
      // Check cache first
      const cacheKey = `dexscreener-${contractAddress}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached.timestamp)) {
        return { data: [cached.data] };
      }

      // Fetch from DexScreener API
      const response = await axios.get(`${DEXSCREENER_API_BASE}/tokens/${contractAddress}`);

      if (!response.data.pairs || response.data.pairs.length === 0) {
        return { data: [], error: 'Token not found on DexScreener' };
      }

      // Get the pair with highest liquidity
      const bestPair = response.data.pairs.reduce((prev: any, current: any) => 
        (current.liquidity?.usd > prev.liquidity?.usd) ? current : prev
      );

      const tokenData: TokenData = {
        id: bestPair.baseToken.address,
        symbol: bestPair.baseToken.symbol.toUpperCase(),
        name: bestPair.baseToken.name,
        current_price: bestPair.priceUsd ? parseFloat(bestPair.priceUsd) : 0,
        price_change_percentage_24h: bestPair.priceChange?.h24 ? parseFloat(bestPair.priceChange.h24) : 0,
        market_cap: bestPair.marketCap ? parseFloat(bestPair.marketCap) : 0,
        total_volume: bestPair.volume?.h24 ? parseFloat(bestPair.volume.h24) : 0,
        image: bestPair.baseToken.image || '/placeholder-coin.svg',
        contract_address: contractAddress,
        last_updated: new Date().toISOString()
      };

      // Cache the result
      this.cache.set(cacheKey, { data: tokenData, timestamp: Date.now() });

      return { data: [tokenData] };
    } catch (error: unknown) {
      console.error('DexScreener API error:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch from DexScreener' 
      };
    }
  }

  async getMultipleTokens(contractAddresses: string[], platform: string = 'ethereum'): Promise<ApiResponse> {
    try {
      const promises = contractAddresses.map(address => 
        this.getTokenByContractAddress(address, platform)
      );
      
      const results = await Promise.all(promises);
      const allTokens: TokenData[] = [];
      const errors: string[] = [];

      results.forEach(result => {
        if (result.error) {
          errors.push(result.error);
        } else {
          allTokens.push(...result.data);
        }
      });

      return { 
        data: allTokens, 
        error: errors.length > 0 ? errors.join('; ') : undefined 
      };
    } catch (error) {
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch multiple tokens' 
      };
    }
  }

  // Get popular tokens for reference
  async getPopularTokens(): Promise<ApiResponse> {
    try {
      const response = await axios.get(
        `${COINGECKO_API_BASE}/coins/markets`,
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 20,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          }
        }
      );

      const tokens: TokenData[] = response.data.map((token: any) => ({
        id: token.id,
        symbol: token.symbol.toUpperCase(),
        name: token.name,
        current_price: token.current_price,
        price_change_percentage_24h: token.price_change_percentage_24h,
        market_cap: token.market_cap,
        total_volume: token.total_volume,
        image: token.image,
        last_updated: new Date().toISOString()
      }));

      return { data: tokens };
    } catch (error) {
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch popular tokens' 
      };
    }
  }
}
