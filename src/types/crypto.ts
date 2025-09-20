export interface TokenData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  contract_address?: string;
  last_updated: string;
  // DexScreener specific fields
  dexscreener_pair_address?: string;
  dexscreener_chain?: string;
  dexscreener_url?: string;
}

export interface TrackedToken {
  contractAddress: string;
  addedAt: string;
  addedBy?: string;
  tokenData?: TokenData;
}

export interface ApiResponse {
  data: TokenData[];
  error?: string;
}
