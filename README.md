# Crypto Checker

A modern web application for tracking cryptocurrency tokens by their contract addresses. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔍 **Token Search**: Add tokens by entering their contract address (CA)
- 📊 **Real-time Data**: Get current price, market cap, volume, and 24h change
- 💾 **Local Storage**: Your tracked tokens are saved locally in your browser
- 🎨 **Modern UI**: Clean, responsive design with dark mode support
- ⚡ **Fast Performance**: Optimized with caching and efficient API calls

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd crypto-checker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Add a Token**: Enter the contract address of any ERC-20 token in the input field
2. **Track Performance**: View real-time price data, market cap, and 24h changes
3. **Remove Tokens**: Click the trash icon on any token card to remove it
4. **Refresh Data**: Use the refresh button to get the latest token data

## API

This app uses the [CoinGecko API](https://www.coingecko.com/en/api) to fetch cryptocurrency data. The API is free and doesn't require authentication for basic usage.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with one click

The app is already configured for Vercel deployment with the included `vercel.json` file.

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Data Source**: CoinGecko API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.