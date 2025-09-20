import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create Supabase client if environment variables are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface SharedToken {
  id: string;
  contract_address: string;
  added_by: string;
  added_at: string;
  token_data?: any;
  last_updated?: string;
}

export interface TokenGroup {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  members: string[];
}
