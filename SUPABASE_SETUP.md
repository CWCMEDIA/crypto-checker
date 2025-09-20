# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Choose a region close to you
5. Wait for the project to be ready

## 2. Get Your Credentials

1. Go to your project dashboard
2. Click on "Settings" → "API"
3. Copy your:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 4. Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Create shared_tokens table
CREATE TABLE shared_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_address TEXT NOT NULL,
  added_by TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  token_data JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create token_groups table for friend groups
CREATE TABLE token_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  members TEXT[] DEFAULT '{}'
);

-- Create group_tokens junction table
CREATE TABLE group_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES token_groups(id) ON DELETE CASCADE,
  token_id UUID REFERENCES shared_tokens(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE shared_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, you can restrict later)
CREATE POLICY "Allow all operations on shared_tokens" ON shared_tokens FOR ALL USING (true);
CREATE POLICY "Allow all operations on token_groups" ON token_groups FOR ALL USING (true);
CREATE POLICY "Allow all operations on group_tokens" ON group_tokens FOR ALL USING (true);
```

## 5. Test the Connection

After setting up, restart your dev server and test adding tokens!
