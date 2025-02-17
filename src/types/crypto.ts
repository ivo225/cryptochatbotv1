export type HistoricalDataPoint = [number, number] // [timestamp, value]

export interface HistoricalData {
  prices: HistoricalDataPoint[]
  volumes: HistoricalDataPoint[]
  marketCaps: HistoricalDataPoint[]
}

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
  historicalData?: HistoricalData
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

export interface Article {
  title: string
  url: string
  source: string
  publishedAt: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

export interface MarketSentiment {
  news: 'positive' | 'neutral' | 'negative'
  overall: 'positive' | 'neutral' | 'negative'
  symbol: string
  social?: 'positive' | 'neutral' | 'negative'
  fearGreedIndex?: number
  articles?: Article[]
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
