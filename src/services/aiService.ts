import type { ChatMessage, TradingAdvice } from '../types/crypto'
import { deepseekService } from './deepseekService'
import { cryptoService } from './cryptoService'

class AiService {
  async generateResponse(message: string): Promise<ChatMessage> {
    console.log('AI Service: Generating response for message:', message)
    try {
      // Check if it's an analysis command
      if (message.startsWith('/analyze')) {
        const symbol = message.replace('/analyze', '').trim().toUpperCase()
        if (!symbol) {
          return {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Please provide a cryptocurrency symbol to analyze. Example: /analyze BTC',
            timestamp: Date.now()
          }
        }

        console.log('AI Service: Analyzing', symbol)
        try {
          // Get comprehensive market data
          const [price, sentiment, history] = await Promise.all([
            cryptoService.getAssetPrice(symbol),
            cryptoService.getMarketSentiment(symbol),
            cryptoService.getMarketChart(symbol, 30) // Last 30 days
          ])

          // Enhance message with market data
          const enhancedMessage = `/analyze ${symbol}\n\nCurrent Market Data:\n` +
            `Price: $${price.price.toFixed(2)}\n` +
            `24h Change: ${price.change24h.toFixed(2)}%\n` +
            `24h Volume: $${(price.volume24h / 1000000).toFixed(2)}M\n` +
            `Market Cap: $${(price.marketCap / 1000000000).toFixed(2)}B\n\n` +
            `Market Sentiment:\n` +
            `Overall: ${sentiment.overall}\n` +
            `News: ${sentiment.news}\n` +
            `Social: ${sentiment.social}\n` +
            `Fear & Greed Index: ${sentiment.fearGreedIndex}\n\n` +
            `Historical Data:\n` +
            `30-day price range: $${Math.min(...history.prices.map(p => p[1])).toFixed(2)} - $${Math.max(...history.prices.map(p => p[1])).toFixed(2)}\n` +
            `30-day volume range: $${(Math.min(...history.totalVolumes.map(v => v[1])) / 1000000).toFixed(2)}M - $${(Math.max(...history.totalVolumes.map(v => v[1])) / 1000000).toFixed(2)}M`

          // Get enhanced response from DeepSeek
          return await deepseekService.generateResponse(enhancedMessage)
        } catch (error) {
          console.error('Error fetching market data for analysis:', error)
          // Still proceed with basic analysis if market data fails
          return await deepseekService.generateResponse(message)
        }
      }

      // For non-analysis commands, proceed with normal flow
      const symbol = await this.extractCryptoSymbol(message)
      console.log('AI Service: Extracted symbol:', symbol)
      
      if (symbol) {
        console.log('AI Service: Found valid crypto symbol, gathering market data...')
        let marketData = null

        try {
          // Get basic market data for context
          console.log('AI Service: Fetching data for', symbol)
          const [price, technicals, sentiment] = await Promise.all([
            cryptoService.getAssetPrice(symbol),
            cryptoService.getTechnicalIndicators(symbol),
            cryptoService.getMarketSentiment(symbol)
          ])

          console.log('AI Service: Successfully gathered all market data')

          // Enhance the user's message with market data
          const enhancedMessage = `
          User Question: ${message}

          Current Market Data for ${symbol} (${price.name}):
          
          Price Information:
          - Current Price: $${price.price.toLocaleString()}
          - 24h Change: ${price.change24h.toFixed(2)}%
          - 24h Volume: $${(price.volume24h / 1000000).toFixed(2)}M
          - Market Cap: $${(price.marketCap / 1000000000).toFixed(2)}B
          
          Historical Milestones:
          - All-Time High: $${price.additionalData?.athPrice.toLocaleString()} (${new Date(price.additionalData?.athDate || '').toLocaleDateString()})
          - All-Time Low: $${price.additionalData?.atlPrice.toLocaleString()} (${new Date(price.additionalData?.atlDate || '').toLocaleDateString()})
          
          Supply Information:
          - Circulating Supply: ${(price.additionalData?.circulatingSupply || 0).toLocaleString()} ${symbol}
          - Total Supply: ${(price.additionalData?.totalSupply || 0).toLocaleString()} ${symbol}
          - Maximum Supply: ${price.additionalData?.maxSupply ? price.additionalData.maxSupply.toLocaleString() : 'Unlimited'} ${symbol}
          
          Please analyze the available market data and provide trading insights for ${symbol}, considering:
          1. Current price and recent price action
          2. Market trends and potential support/resistance levels
          3. Risk assessment and trading considerations
          4. General market sentiment

          Remember to include appropriate risk disclaimers in your analysis.
        `

          // Use DeepSeek to generate response with market context
          console.log('AI Service: Sending enhanced message to DeepSeek')
          let enhancedPrompt = `The user asked about ${symbol}. `

          if (marketData?.price) {
            enhancedPrompt += `\n\nCurrent Market Data:\n`
            enhancedPrompt += `- Current Price: $${marketData.price.price.toLocaleString()}\n`
            enhancedPrompt += `- 24h Price Change: ${marketData.price.change24h.toFixed(2)}%\n`
          }

          // Add a note about data limitations
          enhancedPrompt += `\nNote: Using CoinGecko free API with limited data availability. `
          enhancedPrompt += `For more detailed analysis, consider upgrading to CoinGecko Pro.`

          enhancedPrompt += `\nUser's question: ${message}`

          return await deepseekService.generateResponse(enhancedPrompt)
        } catch (error) {
          console.error('AI Service: Error gathering market data:', error)
          // If market data gathering fails, provide a response with any data we managed to get
          let fallbackPrompt = `The user asked about ${symbol}. `
          
          if (marketData?.price) {
            fallbackPrompt += `I have some limited market data: The current price is $${marketData.price.price.toLocaleString()} `
            fallbackPrompt += `(${marketData.price.change24h > 0 ? '+' : ''}${marketData.price.change24h.toFixed(2)}% in 24h). `
          }
          
          fallbackPrompt += `\n\nThe user's question was: ${message}`
          
          return await deepseekService.generateResponse(fallbackPrompt)
        }
      }

      // If no crypto symbol found, use DeepSeek for general crypto questions
      console.log('AI Service: No crypto symbol found, using general response')
      return await deepseekService.generateResponse(message)
    } catch (error) {
      console.error('Error generating AI response:', error)
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while analyzing the market data. Please try again.',
        timestamp: Date.now(),
      }
    }
  }

  private async extractCryptoSymbol(message: string): Promise<string | null> {
    console.log('AI Service: Extracting crypto symbol from message:', message)
    try {
      // Split message into words and clean them
      const words = message.toUpperCase()
        .split(/\s+/)
        .map(word => word.replace(/[^A-Z]/g, '')) // Remove non-alphabetic characters
        .filter(word => word.length > 0)

      // Try to find a valid crypto symbol
      for (const word of words) {
        const coinInfo = await cryptoService.getCoinInfo(word)
        if (coinInfo) {
          return word
        }
      }

      return null
    } catch (error) {
      console.error('Error extracting crypto symbol:', error)
      return null
    }
  }

  async generateTradingAdvice(symbol: string): Promise<TradingAdvice> {
    try {
      const [price, technicals, sentiment] = await Promise.all([
        cryptoService.getAssetPrice(symbol),
        cryptoService.getTechnicalIndicators(symbol),
        cryptoService.getMarketSentiment(symbol),
      ])

      // Create a detailed analysis request
      const analysisRequest = `
        Please generate trading advice for ${symbol} (${price.name}) based on the following data:
        
        Price Information:
        - Current Price: $${price.price.toLocaleString()}
        - 24h Change: ${price.change24h.toFixed(2)}%
        - 24h Volume: $${(price.volume24h / 1000000).toFixed(2)}M
        - Market Cap: $${(price.marketCap / 1000000000).toFixed(2)}B

        Historical Performance:
        - Distance from ATH: ${price.additionalData ? ((price.price / price.additionalData.athPrice - 1) * 100).toFixed(2) : 'N/A'}%
        - Distance from ATL: ${price.additionalData ? ((price.price / price.additionalData.atlPrice - 1) * 100).toFixed(2) : 'N/A'}%

        Technical Analysis:
        - RSI (14): ${technicals.rsi}
        - MACD Value: ${technicals.macd.value}
        - MACD Signal: ${technicals.macd.signal}
        - MACD Histogram: ${technicals.macd.histogram}
        - Bollinger Bands Position: ${(() => {
          const bb = technicals.bollingerBands
          const position = ((price.price - bb.lower) / (bb.upper - bb.lower) * 100).toFixed(2)
          return `${position}% (0% = Lower Band, 100% = Upper Band)`
        })()}

        Market Sentiment:
        - Overall: ${sentiment.overall.toUpperCase()}
        - News Sentiment: ${sentiment.news}
        - Social Sentiment: ${sentiment.social}
        - Fear & Greed Index: ${sentiment.fearGreedIndex}

        Please provide detailed trading advice including:
        1. Entry price range with reasoning
        2. Stop loss level with technical justification
        3. Take profit targets (multiple levels if applicable)
        4. Position sizing recommendation based on risk level
        5. Key technical levels to watch
        6. Potential catalysts or risks to monitor
      `

      // Get AI analysis
      const aiResponse = await deepseekService.generateResponse(analysisRequest)
      
      // For now, return a structured response
      // In the future, we could parse the AI response to extract specific values
      return {
        recommendation: technicals.rsi > 70 ? 'sell' : technicals.rsi < 30 ? 'buy' : 'hold',
        confidence: 0.7,
        reasoning: aiResponse.content,
        riskLevel: technicals.rsi > 70 || technicals.rsi < 30 ? 'high' : 'medium',
        suggestedEntryPrice: price.price * 0.95,
        suggestedStopLoss: price.price * 0.9,
        suggestedTakeProfit: price.price * 1.1,
      }
    } catch (error) {
      console.error('Error generating trading advice:', error)
      throw error
    }
  }
}

export const aiService = new AiService()
