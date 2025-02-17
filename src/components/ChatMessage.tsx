import React from 'react'
import type { ChatMessage as ChatMessageType } from '../types/crypto'

interface Props {
  message: ChatMessageType
}

export const ChatMessage: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div
      className={`message-animation mb-4 flex ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
          🤖
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-lg p-4 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-white'
        }`}
      >
        {message.content}
      </div>
      {isUser && (
        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
          👤
        </div>
      )}
    </div>
  )
}
