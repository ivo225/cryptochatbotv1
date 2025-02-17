import type { NextApiRequest, NextApiResponse } from 'next'
import { config } from '@/utils/config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { currency } = req.query
  if (!currency || typeof currency !== 'string') {
    return res.status(400).json({ error: 'Currency parameter is required' })
  }

  try {
    const params = new URLSearchParams({
      auth_token: config.crypto.cryptopanic.apiKey,
      currencies: currency.toLowerCase(),
      filter: 'important',
      public: 'true'
    })

    const apiUrl = `${config.crypto.cryptopanic.baseUrl}/posts/?${params}`
    console.log('Proxying request to:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      redirect: 'follow'
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

    const data = await response.json()
    res.status(200).json(data)
  } catch (error: any) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: error.message })
  }
}
