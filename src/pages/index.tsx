import type { NextPage } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import ChatInterface from '../components/ChatInterface'
import { aiService } from '../services/aiService'
import type { ChatMessage as ChatMessageType } from '../types/crypto'
import { useChatStore } from '../stores/chatStore'

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { addMessageToChat } = useChatStore()

  const handleSendMessage = async (message: string, chatId: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    }

    addMessageToChat(chatId, userMessage)
    setIsLoading(true)

    try {
      const aiResponse = await aiService.generateResponse(message)
      addMessageToChat(chatId, aiResponse)
    } catch (error) {
      console.error('Error:', error)
      addMessageToChat(chatId, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: Date.now(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen">
      <Head>
        <title>Crypto AI Trading Assistant</title>
        <meta name="description" content="AI-powered crypto trading insights" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ChatInterface
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Home
