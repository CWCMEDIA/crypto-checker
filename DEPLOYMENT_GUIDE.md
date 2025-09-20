# Deployment Guide for Crypto Checker

## 🚀 Quick Setup (5 minutes)

### 1. Set Up Supabase (Free)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Choose a region close to you
5. Wait for the project to be ready

### 2. Get Your Supabase Credentials

1. Go to your project dashboard
2. Click on "Settings" → "API"
3. Copy your:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### 3. Set Up Database

1. Go to the SQL Editor in your Supabase dashboard
2. Run this SQL to create the tables:

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

-- Enable Row Level Security
ALTER TABLE shared_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy (allow all for now)
CREATE POLICY "Allow all operations on shared_tokens" ON shared_tokens FOR ALL USING (true);
```

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
5. Deploy!

### 5. Test the App

1. Open your deployed app
2. Enter your name when prompted
3. Add a token (try: `5UUH9RTDiSpq6HKS6bp4NdU9PNJpXRXuiw6ShBTBhgH2`)
4. Share the URL with your friends!

## 🎉 Features

- ✅ **Shared Token List**: All friends see the same tokens
- ✅ **Real-time Updates**: Tokens appear instantly when friends add them
- ✅ **User Attribution**: See who added each token
- ✅ **Multi-chain Support**: Ethereum, Solana, Polygon, BSC
- ✅ **Dual API**: CoinGecko + DexScreener for maximum coverage
- ✅ **Free Hosting**: Vercel + Supabase free tiers

## 🔧 Local Development

1. Create `.env.local` with your Supabase credentials
2. Run `npm run dev`
3. Open `http://localhost:3000`

## 📱 Share with Friends

Just send them the Vercel URL! They can:
- Add tokens that everyone will see
- See who added each token
- Get real-time updates when others add tokens

## 💰 Cost

- **Vercel**: Free (unlimited deployments)
- **Supabase**: Free (up to 50,000 rows, 500MB database)
- **APIs**: Free (CoinGecko + DexScreener)

Perfect for your crypto tracking group! 🚀
