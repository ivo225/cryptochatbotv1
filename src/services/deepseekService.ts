import { ChatMessage } from '../types/crypto'
import { config } from '../utils/config'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
// We'll validate the API key when making requests instead of at initialization
if (config.ai.deepseekKey) {
  console.log('DeepSeek Service: Initialized with API key:', config.ai.deepseekKey.substring(0, 5) + '...')
} else {
  console.warn('DeepSeek Service: No API key provided. Please set NEXT_PUBLIC_DEEPSEEK_API_KEY in your environment variables.')
}

const COMMANDS = {
  ANALYZE: '/analyze'
}

const systemPrompt = `You are a cryptocurrency market analyst and trading assistant. Your role is to analyze market data and provide clear, data-driven insights. When given market data, analyze it thoroughly and present your findings in a structured format.

For analysis requests, structure your response as follows:

1. MARKET SUMMARY
- Current price and 24h change
- Trading volume analysis
- Market capitalization context

2. TECHNICAL ANALYSIS
- Price trends and patterns
- Support and resistance levels
- Volume analysis
- Key technical indicators

3. MARKET SENTIMENT
- Overall market sentiment
- News sentiment impact
- Social sentiment signals
- Fear & Greed context

4. RISKS AND OPPORTUNITIES
- Potential upside catalysts
- Downside risks
- Key levels to watch
- Market positioning

5. RECOMMENDATION SUMMARY
- Short-term outlook (24-48 hours)
- Medium-term perspective (1-4 weeks)
- Key action points for traders
- Risk management suggestions

Always conclude with these important disclaimers:
• This analysis is for informational purposes only
• Cryptocurrency markets are highly volatile
• Past performance doesn't guarantee future results
• Never invest more than you can afford to lose
• Always do your own research (DYOR)
`

export const deepseekService = {
  generateResponse: async (userMessage: string): Promise<ChatMessage> => {
    console.log('Generating response for:', userMessage)
    try {
      // Check for analysis command
      if (userMessage.startsWith(COMMANDS.ANALYZE)) {
        const symbol = userMessage.replace(COMMANDS.ANALYZE, '').trim().toUpperCase()
        if (!symbol) {
          return {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Please provide a cryptocurrency symbol to analyze. Example: /analyze BTC',
            timestamp: Date.now()
          }
        }
        // Enhance the user message with specific analysis request
        userMessage = `Please provide a detailed analysis for ${symbol} including:
1. Current market conditions
2. Recent price movements
3. Technical indicators
4. Market sentiment
5. Key support and resistance levels
6. Potential risks and opportunities

Please format your response in clear sections and include relevant disclaimers about market volatility and risk.`
      }
      console.log('Calling DeepSeek API...')
      if (!config.ai.deepseekKey) {
        throw new Error('DeepSeek API key is required. Please set NEXT_PUBLIC_DEEPSEEK_API_KEY in your environment variables.')
      }

      const requestBody = {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      }

      console.log('DeepSeek Service: Sending request:', JSON.stringify(requestBody, null, 2))

      // Log the full request details for debugging
      console.log('DeepSeek API request URL:', DEEPSEEK_API_URL)
      console.log('DeepSeek API headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.ai.deepseekKey}`
      })

      // Clean and validate the API key
      if (!config.ai.deepseekKey?.trim()) {
        throw new Error('DeepSeek API key is missing or invalid')
      }
      const cleanKey = config.ai.deepseekKey.trim()
      
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        cache: 'no-cache',
        mode: 'cors'
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('DeepSeek API error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        
        let errorMessage = 'An error occurred while processing your request.'
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          }
        } catch (e) {
          console.error('Error parsing error response:', e)
        }

        throw new Error(`DeepSeek API error: ${errorMessage}`)
      }

      console.log('DeepSeek API response status:', response.status)
      console.log('DeepSeek API response headers:', Object.fromEntries(response.headers.entries()))
      
      const responseText = await response.text()
      console.log('DeepSeek API raw response:', responseText)
      
      // Handle empty responses
      if (!responseText.trim()) {
        console.error('Empty response from DeepSeek API')
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'I apologize, but I was unable to generate a response at this time. Please try again.',
          timestamp: Date.now()
        }
      }
      
      try {
        const data = JSON.parse(responseText)
        console.log('DeepSeek API response:', data)

        if (!data.choices?.[0]?.message?.content) {
          // Log more details about the response
          console.error('Invalid response format from DeepSeek API:', {
            data,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
          })

          // Check for specific error cases
          if (data.error) {
            console.error('DeepSeek API error:', data.error)
            return {
              id: Date.now().toString(),
              role: 'assistant',
              content: `I encountered an error: ${data.error.message || 'Unknown error'}. Please try again.`,
              timestamp: Date.now()
            }
          }

          return {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'I received an invalid response format. Please try your request again.',
            timestamp: Date.now()
          }
        }

        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: Date.now()
        }
      } catch (parseError) {
        console.error('Error parsing DeepSeek API response:', parseError)
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'I encountered an error processing the response. Please try again.',
          timestamp: Date.now()
        }
      }
    } catch (error: any) {
      // Log the full error details
      console.error('DeepSeek service error:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        stack: error.stack,
        response: error.response
      })

      let errorMessage = 'I encountered an error. Please try again later.'
      if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please check the API key configuration.'
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a moment.'
      }

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now()
      }
    }
  }
}
