import axios from 'axios'
import { config } from '../utils/config'
import type { CryptoAsset, TechnicalIndicators, MarketSentiment } from '../types/crypto'
import { cryptoPanicService, type SentimentAnalysis } from './cryptoPanicService'

class CryptoService {
  private readonly coingeckoApi = axios.create({
    baseURL: 'https://api.coingecko.com/api/v3',
    timeout: 5000
  })

  constructor() {
    // Log whether we're using the free or pro tier
    console.log('CryptoService: Using CoinGecko', config.crypto.coingecko.apiKey ? 'Pro API' : 'Free API')
  }

  private readonly binanceApi = axios.create({
    baseURL: config.crypto.binance.baseUrl,
  })

  private readonly cryptopanicApi = axios.create({
    baseURL: config.crypto.cryptopanic.baseUrl,
    params: {
      auth_token: config.crypto.cryptopanic.apiKey,
      public: 'true' // Use public API to avoid CORS
    }
  })

  private coinList: Map<string, { id: string; name: string }> = new Map()
  private isInitialized = false

  private async initialize() {
    console.log('CryptoService: Initializing...')
    if (this.isInitialized) {
      console.log('CryptoService: Already initialized')
      return
    }

    try {
      // Fetch the full list of coins from CoinGecko
      console.log('CryptoService: Fetching coin list from CoinGecko...')
      const response = await this.coingeckoApi.get('/coins/list', {
        params: {
          include_platform: false
        }
      })

      // Create a map of symbol to coin info
      console.log('CryptoService: Processing', response.data.length, 'coins')
      response.data.forEach((coin: { id: string; symbol: string; name: string }) => {
        this.coinList.set(coin.symbol.toUpperCase(), {
          id: coin.id,
          name: coin.name
        })
      })

      this.isInitialized = true
      console.log(`Initialized CryptoService with ${this.coinList.size} coins`)
    } catch (error) {
      console.error('Error initializing CryptoService:', error)
      throw error
    }
  }

  private readonly commonCoins: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'DOGE': 'dogecoin',
    'ADA': 'cardano',
    'DOT': 'polkadot',
    'LINK': 'chainlink',
    'XRP': 'ripple',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'BNB': 'binancecoin',
    'USDT': 'tether',
    'USDC': 'usd-coin'
  }

  async getCoinInfo(symbol: string): Promise<{ id: string; name: string } | null> {
    const upperSymbol = symbol.toUpperCase()
    console.log('CryptoService: Getting coin info for symbol:', upperSymbol)
    
    // First check common coins for faster response
    if (this.commonCoins[upperSymbol]) {
      return {
        id: this.commonCoins[upperSymbol],
        name: upperSymbol
      }
    }

    // If not found in common coins, check the full list
    await this.initialize()
    return this.coinList.get(upperSymbol) || null
  }

  async getAssetPrice(symbol: string): Promise<CryptoAsset> {
    try {
      const upperSymbol = symbol.toUpperCase()
      const coinId = this.commonCoins[upperSymbol]
      
      if (!coinId) {
        throw new Error(`Unsupported cryptocurrency symbol: ${symbol}. Only major cryptocurrencies are supported in the free tier.`)
      }

      console.log('CryptoService: Fetching data for', coinId)
      
      // Fetch current price data
      const priceResponse = await this.coingeckoApi.get('/coins/' + coinId, {
        params: {
          localization: false,
          tickers: false,
          community_data: false,
          developer_data: false,
          sparkline: false
        }
      })

      // Fetch historical data (365 days)
      console.log('CryptoService: Fetching historical data for', coinId)
      const historyResponse = await this.coingeckoApi.get(`/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: '365',
          interval: 'daily'
        }
      })

      const priceData = priceResponse.data
      const historyData = historyResponse.data

      if (!priceData?.market_data) {
        throw new Error(`No price data available for ${symbol}`)
      }

      console.log('CryptoService: Successfully fetched data:', {
        currentPrice: priceData.market_data.current_price.usd,
        historicalDataPoints: historyData.prices.length
      })
      
      return {
        symbol: upperSymbol,
        name: priceData.name,
        price: priceData.market_data.current_price.usd || 0,
        change24h: priceData.market_data.price_change_percentage_24h || 0,
        volume24h: priceData.market_data.total_volume.usd || 0,
        marketCap: priceData.market_data.market_cap.usd || 0,
        additionalData: {
          athPrice: priceData.market_data.ath.usd,
          athDate: priceData.market_data.ath_date.usd,
          atlPrice: priceData.market_data.atl.usd,
          atlDate: priceData.market_data.atl_date.usd,
          totalSupply: priceData.market_data.total_supply,
          circulatingSupply: priceData.market_data.circulating_supply,
          maxSupply: priceData.market_data.max_supply
        },
        historicalData: {
          prices: historyData.prices, // [[timestamp, price], ...]
          volumes: historyData.total_volumes, // [[timestamp, volume], ...]
          marketCaps: historyData.market_caps // [[timestamp, marketCap], ...]
        }
      }
    } catch (error: any) {
      console.error('Error fetching asset price from CoinGecko:', error?.response?.data || error)
      if (error?.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.')
      } else if (error?.response?.status === 400) {
        throw new Error(`Invalid request for ${symbol}. The cryptocurrency might not be supported.`)
      } else {
        throw new Error(`Failed to fetch data for ${symbol}: ${error?.message || 'Unknown error'}`)
      }
    }
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
    try {
      // In a real implementation, you would calculate these indicators
      // using historical price data from the Binance API
      return {
        rsi: 50, // Placeholder
        macd: {
          value: 0,
          signal: 0,
          histogram: 0,
        },
        bollingerBands: {
          upper: 0,
          middle: 0,
          lower: 0,
        },
      }
    } catch (error) {
      console.error('Error calculating technical indicators:', error)
      throw error
    }
  }

  async getMarketSentiment(symbol: string): Promise<MarketSentiment> {
    try {
      const upperSymbol = symbol.toUpperCase()
      
      // Verify it's a supported coin
      if (!this.commonCoins[upperSymbol]) {
        throw new Error(`Unsupported cryptocurrency symbol: ${symbol}. Only major cryptocurrencies are supported.`)
      }

      // Get sentiment data from CryptoPanic
      const cryptoPanicData = await cryptoPanicService.getNewsByCurrency(upperSymbol)
      
      // Map CryptoPanic sentiment to our format
      const sentiment: MarketSentiment = {
        symbol: upperSymbol,
        overall: cryptoPanicData.overallSentiment,
        news: cryptoPanicData.overallSentiment, // Use the same sentiment for news since it's news-based
        articles: cryptoPanicData.topArticles.map(article => ({
          title: article.title,
          url: article.url,
          source: article.source.title,
          publishedAt: article.published_at,
          sentiment: article.votes.positive > article.votes.negative ? 'positive' : 
                     article.votes.negative > article.votes.positive ? 'negative' : 'neutral'
        }))
      }
      
      return sentiment
    } catch (error) {
      console.error('Error getting market sentiment:', error)
      throw error
    }
  }
  async getCoinHistory(symbol: string, date: Date): Promise<any> {
    try {
      const upperSymbol = symbol.toUpperCase()
      
      // Verify it's a supported coin
      if (!this.commonCoins[upperSymbol]) {
        throw new Error(`Unsupported cryptocurrency symbol: ${symbol}. Only major cryptocurrencies are supported.`)
      }

      const coinId = this.commonCoins[upperSymbol]
      const formattedDate = date.toISOString().split('T')[0] // Format as YYYY-MM-DD
      
      const response = await this.coingeckoApi.get(`/coins/${coinId}/history`, {
        params: {
          date: formattedDate
        }
      })

      return {
        symbol: upperSymbol,
        date: formattedDate,
        price: response.data.market_data?.current_price?.usd,
        marketCap: response.data.market_data?.market_cap?.usd,
        volume: response.data.market_data?.total_volume?.usd
      }
    } catch (error) {
      console.error('Error getting coin history:', error)
      throw error
    }
  }

  async getMarketChart(symbol: string, days: number = 30): Promise<any> {
    try {
      const upperSymbol = symbol.toUpperCase()
      
      // Verify it's a supported coin and days limit
      if (!this.commonCoins[upperSymbol]) {
        throw new Error(`Unsupported cryptocurrency symbol: ${symbol}. Only major cryptocurrencies are supported.`)
      }
      if (days > 90) {
        throw new Error('Free tier is limited to 90 days of historical data')
      }

      const coinId = this.commonCoins[upperSymbol]
      const response = await this.coingeckoApi.get(`/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: 'daily'
        }
      })

      return {
        symbol: upperSymbol,
        timeframe: `${days} days`,
        prices: response.data.prices,
        marketCaps: response.data.market_caps,
        totalVolumes: response.data.total_volumes
      }
    } catch (error) {
      console.error('Error getting market chart:', error)
      throw error
    }
  }

  async getMarketChartRange(symbol: string, from: Date, to: Date): Promise<any> {
    try {
      const upperSymbol = symbol.toUpperCase()
      
      // Verify it's a supported coin
      if (!this.commonCoins[upperSymbol]) {
        throw new Error(`Unsupported cryptocurrency symbol: ${symbol}. Only major cryptocurrencies are supported.`)
      }

      // Check if date range is within 365 days
      const daysDiff = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff > 365) {
        throw new Error('Free tier is limited to 365 days of historical range data')
      }

      const coinId = this.commonCoins[upperSymbol]
      const response = await this.coingeckoApi.get(`/coins/${coinId}/market_chart/range`, {
        params: {
          vs_currency: 'usd',
          from: Math.floor(from.getTime() / 1000),
          to: Math.floor(to.getTime() / 1000)
        }
      })

      return {
        symbol: upperSymbol,
        timeframe: {
          from: from.toISOString(),
          to: to.toISOString()
        },
        prices: response.data.prices,
        marketCaps: response.data.market_caps,
        totalVolumes: response.data.total_volumes
      }
    } catch (error) {
      console.error('Error getting market chart range:', error)
      throw error
    }
  }
}

export const cryptoService = new CryptoService()
