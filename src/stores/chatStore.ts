import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage } from '../types/crypto'

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
}

interface ChatStore {
  chats: Chat[]
  currentChatId: string | null
  addChat: () => void
  addMessageToChat: (chatId: string, message: ChatMessage) => void
  setCurrentChat: (chatId: string) => void
  getChatById: (chatId: string) => Chat | undefined
  deleteChat: (chatId: string) => void
  updateChatTitle: (chatId: string, title: string) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,

      addChat: () => {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
        }
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
        }))
        return newChat.id
      },

      addMessageToChat: (chatId: string, message: ChatMessage) => {
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              // Update chat title based on first user message if it's still "New Chat"
              let title = chat.title
              if (
                title === 'New Chat' &&
                message.role === 'user' &&
                chat.messages.length === 0
              ) {
                title = message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '')
              }
              return {
                ...chat,
                title,
                messages: [...chat.messages, message],
              }
            }
            return chat
          }),
        }))
      },

      setCurrentChat: (chatId: string) => {
        set({ currentChatId: chatId })
      },

      getChatById: (chatId: string) => {
        return get().chats.find((chat) => chat.id === chatId)
      },

      deleteChat: (chatId: string) => {
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== chatId),
          currentChatId:
            state.currentChatId === chatId
              ? state.chats[0]?.id ?? null
              : state.currentChatId,
        }))
      },

      updateChatTitle: (chatId: string, title: string) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, title } : chat
          ),
        }))
      },
    }),
    {
      name: 'crypto-chat-storage',
    }
  )
)
