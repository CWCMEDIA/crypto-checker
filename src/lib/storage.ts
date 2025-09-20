import { TrackedToken } from '@/types/crypto';
import { supabase, SharedToken } from './supabase';

const STORAGE_KEY = 'crypto-checker-tracked-tokens';

export class TokenStorage {
  // Local storage fallback for when Supabase is not configured
  static getTrackedTokensLocal(): TrackedToken[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading tracked tokens from localStorage:', error);
      return [];
    }
  }

  // Supabase methods
  static async getTrackedTokens(): Promise<TrackedToken[]> {
    if (!supabase) {
      console.log('Supabase not configured, using local storage');
      return this.getTrackedTokensLocal();
    }

    try {
      const { data, error } = await supabase
        .from('shared_tokens')
        .select('*')
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching tokens from Supabase:', error);
        return this.getTrackedTokensLocal();
      }

      return data?.map((token: SharedToken) => ({
        contractAddress: token.contract_address,
        addedAt: token.added_at,
        addedBy: token.added_by,
        tokenData: token.token_data
      })) || [];
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return this.getTrackedTokensLocal();
    }
  }

  static async addTrackedToken(contractAddress: string, addedBy: string = 'anonymous'): Promise<boolean> {
    if (!supabase) {
      console.log('Supabase not configured, using local storage');
      this.addTrackedTokenLocal(contractAddress);
      return false;
    }

    try {
      // Check if token already exists
      const { data: existing } = await supabase
        .from('shared_tokens')
        .select('id')
        .eq('contract_address', contractAddress.toLowerCase())
        .single();

      if (existing) {
        console.log('Token already exists in database');
        return true;
      }

      // Add new token
      const { error } = await supabase
        .from('shared_tokens')
        .insert({
          contract_address: contractAddress.toLowerCase(),
          added_by: addedBy
        });

      if (error) {
        console.error('Error adding token to Supabase:', error);
        // Fallback to local storage
        this.addTrackedTokenLocal(contractAddress);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding token:', error);
      this.addTrackedTokenLocal(contractAddress);
      return false;
    }
  }

  static async removeTrackedToken(contractAddress: string): Promise<boolean> {
    if (!supabase) {
      console.log('Supabase not configured, using local storage');
      this.removeTrackedTokenLocal(contractAddress);
      return false;
    }

    try {
      const { error } = await supabase
        .from('shared_tokens')
        .delete()
        .eq('contract_address', contractAddress.toLowerCase());

      if (error) {
        console.error('Error removing token from Supabase:', error);
        this.removeTrackedTokenLocal(contractAddress);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing token:', error);
      this.removeTrackedTokenLocal(contractAddress);
      return false;
    }
  }

  static async updateTokenData(contractAddress: string, tokenData: any): Promise<boolean> {
    if (!supabase) {
      console.log('Supabase not configured, skipping update');
      return false;
    }

    try {
      const { error } = await supabase
        .from('shared_tokens')
        .update({
          token_data: tokenData,
          last_updated: new Date().toISOString()
        })
        .eq('contract_address', contractAddress.toLowerCase());

      if (error) {
        console.error('Error updating token data:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating token data:', error);
      return false;
    }
  }

  // Local storage fallback methods
  static addTrackedTokenLocal(contractAddress: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const tokens = this.getTrackedTokensLocal();
      const exists = tokens.some(token => 
        token.contractAddress.toLowerCase() === contractAddress.toLowerCase()
      );
      
      if (!exists) {
        const newToken: TrackedToken = {
          contractAddress,
          addedAt: new Date().toISOString()
        };
        
        tokens.push(newToken);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
      }
    } catch (error) {
      console.error('Error adding tracked token to localStorage:', error);
    }
  }

  static removeTrackedTokenLocal(contractAddress: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const tokens = this.getTrackedTokensLocal();
      const filtered = tokens.filter(token => 
        token.contractAddress.toLowerCase() !== contractAddress.toLowerCase()
      );
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing tracked token from localStorage:', error);
    }
  }

  static clearAllTokens(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing tracked tokens:', error);
    }
  }
}
