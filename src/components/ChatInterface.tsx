import React, { useState, useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage'
import Sidebar from './Sidebar'
import { useChatStore } from '../stores/chatStore'
import type { ChatMessage as ChatMessageType } from '../types/crypto'

type ChatInterfaceProps = {
  onSendMessage: (message: string, chatId: string) => void
  isLoading: boolean
}

const ChatInterface = (props: ChatInterfaceProps) => {
  const { onSendMessage, isLoading } = props
  const [message, setMessage] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    chats,
    currentChatId,
    addChat,
    setCurrentChat,
    getChatById
  } = useChatStore()

  const currentChat = currentChatId ? getChatById(currentChatId) : null
  const messages = currentChat?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Create initial chat if none exists
    if (chats.length === 0) {
      addChat()
    }
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading || !currentChatId) return
    onSendMessage(message, currentChatId)
    setMessage('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  const handleNewChat = () => {
    addChat()
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      {isSidebarOpen && (
        <Sidebar
          chats={chats}
          onSelectChat={setCurrentChat}
          onNewChat={handleNewChat}
          currentChatId={currentChatId || ''}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-[#1E1F20]">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-gray-700 p-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-md p-2 text-white hover:bg-gray-700"
          >
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-white">
            {currentChat?.title || 'Crypto AI Assistant'}
          </h1>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex items-start gap-4 rounded-lg bg-[#2A2B32] p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                AI
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-white">Hi, I'm an AI assistant.</p>
                <p className="text-gray-400">How can I help you today?</p>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-2 p-4">
              <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="relative mx-auto max-w-3xl">
            <div className="relative flex items-center">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message AI assistant..."
                className="w-full resize-none rounded-lg bg-[#40414F] px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
                style={{ maxHeight: '200px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className={`absolute right-2 rounded-lg p-2 text-gray-400 hover:text-white transition-colors ${
                  isLoading || !message.trim() ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-700'
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
