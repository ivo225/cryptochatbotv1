import { ChatMessage } from '../types/crypto'
import { config } from '../utils/config'

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekChoice {
  message: DeepSeekMessage
  finish_reason?: string
  index: number
}

interface DeepSeekResponse {
  id: string
  object: string
  created: number
  model: string
  choices: DeepSeekChoice[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  error?: {
    message: string
    type?: string
    code?: string
  }
}

interface DeepSeekRequest {
  model: string
  messages: DeepSeekMessage[]
  temperature: number
  max_tokens: number
  stream: boolean
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

const COMMANDS = {
  ANALYZE: '/analyze'
}

const systemPrompt = `You are a cryptocurrency market analyst and trading assistant. Your role is to analyze market data and provide clear, data-driven insights. Present your analysis in a clean, modern format with clear sections.

For analysis requests, structure your response as follows:

MARKET SUMMARY
• Current Price & 24h Change
• Trading Volume Overview
• Market Cap Analysis

TECHNICAL ANALYSIS
• Trend Analysis
• Key Support & Resistance
• Volume Patterns
• Technical Indicators

MARKET SENTIMENT
• Overall Market Mood
• News Impact
• Social Media Signals
• Fear & Greed Index

RISKS VS OPPORTUNITIES
• Growth Catalysts
• Risk Factors
• Key Price Levels
• Market Position

TRADING INSIGHTS
• Short-term View (24-48h)
• Mid-term Outlook (1-4w)
• Action Steps
• Risk Management Tips

IMPORTANT NOTES
• For information only
• High volatility market
• Past ≠ Future results
• Invest responsibly
• DYOR

Format numbers nicely (e.g., $52.5K instead of $52,500).
Use bullet points for better readability.
Keep sections concise but informative.
Ensure each section is separated by a blank line for clarity.
Present data in an organized, easy-to-scan format.`

interface DeepSeekError extends Error {
  status?: number
  statusText?: string
  response?: Response
}

export const deepseekService = {
  generateResponse: async (userMessage: string): Promise<ChatMessage> => {
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

      // Validate API key
      if (!config.ai.deepseekKey?.trim()) {
        throw new Error('DeepSeek API key is missing or invalid')
      }
      const cleanKey = config.ai.deepseekKey.trim()
      
      // Validate API key format
      if (!cleanKey.startsWith('sk-')) {
        throw new Error('Invalid DeepSeek API key format. Key should start with "sk-"')
      }

      const maxRetries = 3
      let lastError = null
      let data: DeepSeekResponse | null = null
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Prepare request
          const requestBody: DeepSeekRequest = {
            model: DEEPSEEK_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            stream: false
          }

          // Validate request
          if (!requestBody.messages.length) {
            throw new Error('No messages provided')
          }

          if (requestBody.messages.some(msg => !msg.content?.trim())) {
            throw new Error('Empty message content')
          }

          // Log request (redact sensitive info)
          console.log('DeepSeek request:', {
            url: DEEPSEEK_API_URL,
            model: requestBody.model,
            messageCount: requestBody.messages.length,
            systemPromptLength: requestBody.messages[0].content.length,
            userMessageLength: requestBody.messages[1].content.length,
            settings: {
              temperature: requestBody.temperature,
              max_tokens: requestBody.max_tokens,
              stream: requestBody.stream
            }
          })

          console.log('Making DeepSeek API request...')
          let response
          try {
            response = await fetch(DEEPSEEK_API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cleanKey}`,
                'Accept': 'application/json'
              },
              body: JSON.stringify(requestBody)
            })
          } catch (error) {
            const networkError = error as DeepSeekError
            lastError = networkError
            console.error(`Attempt ${attempt}/${maxRetries} - Network error:`, {
              message: networkError.message,
              cause: networkError.cause,
              url: DEEPSEEK_API_URL
            })
            
            if (attempt === maxRetries) {
              throw new Error(`Failed to connect to DeepSeek API after ${maxRetries} attempts: ${error.message}`)
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt - 1), 5000)))
            continue
          }

          // Log response details
          console.log('DeepSeek response:', {
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type'),
            requestId: response.headers.get('x-request-id')
          })

          // Get response text and headers
          const responseBuffer = await response.arrayBuffer()
          const contentType = response.headers.get('content-type')
          const contentLength = response.headers.get('content-length')

          // Convert buffer to text with UTF-8 encoding
          const responseText = new TextDecoder('utf-8', { fatal: true }).decode(responseBuffer)

          // Log response details
          console.log('DeepSeek response:', {
            byteLength: responseBuffer.byteLength,
            textLength: responseText.length,
            preview: responseText.slice(0, 100) + (responseText.length > 100 ? '...' : ''),
            status: response.status,
            contentType,
            contentLength,
            allHeaders: Object.fromEntries(response.headers.entries())
          })

          // Handle response status
          if (!response.ok) {
            console.error('DeepSeek API error:', {
              status: response.status,
              statusText: response.statusText,
              contentType,
              contentLength,
              responsePreview: responseText.slice(0, 200)
            })

            if (response.status === 401) {
              throw new Error('Authentication failed. Please check your DeepSeek API key.')
            } else if (response.status === 429) {
              throw new Error('Rate limit exceeded. Please try again in a moment.')
            } else {
              throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
            }
          }

          // Validate content type
          if (!contentType?.includes('application/json')) {
            console.error('Invalid content type from DeepSeek API:', {
              contentType,
              contentLength,
              responsePreview: responseText.slice(0, 200)
            })
            throw new Error(`Invalid content type from DeepSeek API: ${contentType}`)
          }

          // Handle empty responses
          if (!responseBuffer.byteLength || !responseText.trim()) {
            console.error('Empty response from DeepSeek API:', {
              status: response.status,
              statusText: response.statusText,
              contentType,
              contentLength,
              byteLength: responseBuffer.byteLength,
              textLength: responseText.length,
              rawBuffer: Array.from(new Uint8Array(responseBuffer)).join(','),
              allHeaders: Object.fromEntries(response.headers.entries())
            })
            throw new Error(`Empty response from DeepSeek API (Status: ${response.status}, Bytes: ${responseBuffer.byteLength})`)
          }

          // Parse and validate JSON response
          try {
            console.log('Starting response validation:', {
              responseLength: responseText.length,
              firstChars: responseText.slice(0, 50),
              lastChars: responseText.slice(-50),
              isEmptyOrWhitespace: !responseText.trim(),
              contentType,
              status: response.status
            })

            // First check if we actually have content
            if (!responseText.trim()) {
              throw new Error('Empty response body')
            }

            // Try to parse as JSON
            let parsed: any
            try {
              parsed = JSON.parse(responseText)
            } catch (parseError) {
              console.error('JSON parse error:', {
                error: (parseError as Error).message,
                responsePreview: responseText.slice(0, 200)
              })
              throw new Error(`Failed to parse JSON: ${(parseError as Error).message}`)
            }

            console.log('Parsed response structure:', {
              hasChoices: 'choices' in parsed,
              choicesType: typeof parsed.choices,
              hasError: 'error' in parsed,
              responseKeys: Object.keys(parsed)
            })

            // Validate response structure
            if (!parsed || typeof parsed !== 'object') {
              throw new Error('Response is not an object')
            }

            // Check for API error response
            if ('error' in parsed) {
              throw new Error(`API Error: ${(parsed as { error: { message: string } }).error.message}`)
            }

            // Validate required fields
            if (!Array.isArray(parsed.choices)) {
              throw new Error('Response missing choices array')
            }

            if (!parsed.choices.length) {
              throw new Error('Response has empty choices array')
            }

            const choice = parsed.choices[0]
            if (!choice.message?.content) {
              throw new Error('Response missing message content')
            }

            // If all validation passes, assign to data
            data = parsed as DeepSeekResponse
            console.log('Validated DeepSeek response:', {
              id: data.id,
              model: data.model,
              choicesCount: data.choices.length,
              contentLength: data.choices[0].message.content.length,
              firstContentChars: data.choices[0].message.content.slice(0, 50)
            })
            
            // If we got here, the request was successful
            break
          } catch (error) {
            const parseError = error as Error
            lastError = new Error(`Response validation failed: ${parseError.message}`)
            console.error(`Attempt ${attempt}/${maxRetries} failed:`, {
              error: parseError.message,
              responseText: responseText.slice(0, 200),
              responseLength: responseText.length,
              status: response.status,
              contentType
            })
            
            if (attempt === maxRetries) {
              throw lastError
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt - 1), 5000)))
            continue
          }
        } catch (error) {
          const retryError = error as DeepSeekError
          lastError = retryError
          if (attempt === maxRetries) {
            throw retryError
          }
          continue
        }
      }

      // Final validation after all retries
      if (!data) {
        throw new Error('No valid response data after all retries')
      }

      // Get first choice - we've already validated the structure in the try block
      const choice = data.choices[0]
      
      // One final check of the content
      if (!choice?.message?.content?.trim()) {
        throw new Error('Missing or empty content in validated response')
      }

      // Return successful response
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: choice.message.content.trim(),
        timestamp: Date.now()
      }
    } catch (error) {
      const err = error as DeepSeekError
      // Log the full error details
      console.error('DeepSeek service error:', {
        message: err.message,
        status: err.status,
        statusText: err.statusText,
        stack: err.stack,
        response: err.response
      })

      let errorMessage = 'I encountered an error. Please try again later.'
      if (err.response?.status === 401) {
        errorMessage = 'Authentication error. Please check the API key configuration.'
      } else if (err.response?.status === 429) {
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
