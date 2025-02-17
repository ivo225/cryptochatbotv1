export const config = {
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
  },
  ai: {
    openaiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    deepseekKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '',
  },
  crypto: {
    coingecko: {
      apiKey: process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '',
      baseUrl: 'https://api.coingecko.com/api/v3',
      isPro: Boolean(process.env.NEXT_PUBLIC_COINGECKO_API_KEY),
    },
    binance: {
      apiKey: process.env.BINANCE_API_KEY,
      secretKey: process.env.BINANCE_SECRET_KEY,
      baseUrl: 'https://api.binance.com/api/v3',
    },
    cryptopanic: {
      apiKey: process.env.NEXT_PUBLIC_CRYPTOPANIC_API_KEY || '',
      baseUrl: 'https://cryptopanic.com/api/v1',
    },
    whalealert: {
      apiKey: process.env.WHALEALERT_API_KEY,
      baseUrl: 'https://api.whale-alert.io/v1',
    },
  },
  app: {
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
}
