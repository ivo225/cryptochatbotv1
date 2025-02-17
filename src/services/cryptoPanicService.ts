import { config } from '@/utils/config'

const CRYPTOPANIC_API_URL = config.crypto.cryptopanic.baseUrl

export interface CryptoPanicPost {
  kind: string
  domain: string
  title: string
  published_at: string
  slug: string
  id: number
  url: string
  created_at: string
  votes: {
    negative: number
    positive: number
    important: number
    liked: number
    disliked: number
    lol: number
    toxic: number
    saved: number
    comments: number
  }
  source: {
    title: string
    region: string
    domain: string
  }
  currencies: Array<{
    code: string
    title: string
    slug: string
    url: string
  }>
}

export interface CryptoPanicResponse {
  count: number
  next: string | null
  previous: string | null
  results: CryptoPanicPost[]
}

export interface SentimentAnalysis {
  overallSentiment: 'positive' | 'negative' | 'neutral'
  positiveCount: number
  negativeCount: number
  neutralCount: number
  totalArticles: number
  topArticles: CryptoPanicPost[]
  latestUpdate: string
}

export const cryptoPanicService = {
  async getNewsByCurrency(currency: string): Promise<SentimentAnalysis> {
    try {
      if (!config.crypto.cryptopanic.apiKey) {
        throw new Error('CryptoPanic API key is missing')
      }

      const response = await fetch(`/api/proxy/cryptopanic?currency=${encodeURIComponent(currency)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('CryptoPanic API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(`CryptoPanic API error: ${response.statusText}`)
      }

      const data: CryptoPanicResponse = await response.json()
      
      // Calculate sentiment based on votes
      let positiveCount = 0
      let negativeCount = 0
      let neutralCount = 0

      data.results.forEach(post => {
        const { votes } = post
        const sentiment = votes.positive - votes.negative
        if (sentiment > 0) positiveCount++
        else if (sentiment < 0) negativeCount++
        else neutralCount++
      })

      const totalArticles = data.results.length
      const overallSentiment = positiveCount > negativeCount 
        ? 'positive' 
        : negativeCount > positiveCount 
          ? 'negative' 
          : 'neutral'

      // Sort articles by importance (total votes)
      const topArticles = [...data.results]
        .sort((a, b) => {
          const votesA = Object.values(a.votes).reduce((sum, count) => sum + count, 0)
          const votesB = Object.values(b.votes).reduce((sum, count) => sum + count, 0)
          return votesB - votesA
        })
        .slice(0, 5) // Get top 5 articles

      return {
        overallSentiment,
        positiveCount,
        negativeCount,
        neutralCount,
        totalArticles,
        topArticles,
        latestUpdate: new Date().toISOString()
      }
    } catch (error: any) {
      console.error('CryptoPanic service error:', error)
      throw new Error(`Failed to fetch news: ${error.message}`)
    }
  }
}
