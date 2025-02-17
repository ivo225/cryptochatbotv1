# Crypto Trading Assistant

A modern AI-powered crypto trading assistant that provides real-time market analysis, trading insights, and portfolio management.

## Tech Stack

- Frontend: React + TypeScript
- Backend: Supabase Edge Functions
- AI: DeepSeek AI, OpenAI
- APIs: Binance, CoinGecko, CryptoPanic, WhaleAlert
- Database: Supabase PostgreSQL

## Project Structure

```
/crypto-chatbot
├── /functions           # Supabase Edge Functions
├── /src
│   ├── /components     # React components
│   ├── /services       # API services
│   ├── /utils          # Utility functions
│   └── /types          # TypeScript types
└── /supabase           # Supabase configuration
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
COINGECKO_API_KEY=your_coingecko_api_key
BINANCE_API_KEY=your_binance_api_key
CRYPTOPANIC_API_KEY=your_cryptopanic_api_key
WHALEALERT_API_KEY=your_whalealert_api_key
```

3. Start the development server:
```bash
npm run dev
```

## Features

- Real-time crypto market data and analysis
- AI-powered trading insights
- Technical analysis indicators (RSI, MACD, Bollinger Bands)
- News sentiment analysis
- Whale transaction monitoring
- Portfolio tracking
- Price alerts
- Dark/Light mode support
