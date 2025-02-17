export interface CryptoAsset {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  additionalData?: {
    athPrice: number
    athDate: string
    atlPrice: number
    atlDate: string
    totalSupply: number
    circulatingSupply: number
    maxSupply: number | null
  }
}

export interface TechnicalIndicators {
  rsi: number
  macd: {
    value: number
    signal: number
    histogram: number
  }
  bollingerBands: {
    upper: number
    middle: number
    lower: number
  }
}

export interface MarketSentiment {
  news: 'positive' | 'neutral' | 'negative'
  social: 'positive' | 'neutral' | 'negative'
  overall: 'positive' | 'neutral' | 'negative'
  fearGreedIndex: number
}

export interface WhaleAlert {
  timestamp: number
  amount: number
  fromAddress: string
  toAddress: string
  transactionType: 'transfer' | 'exchange_deposit' | 'exchange_withdrawal'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface TradingAdvice {
  recommendation: 'buy' | 'sell' | 'hold'
  confidence: number
  reasoning: string
  riskLevel: 'low' | 'medium' | 'high'
  suggestedEntryPrice?: number
  suggestedStopLoss?: number
  suggestedTakeProfit?: number
}
