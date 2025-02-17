import React from 'react'
import type { Chat } from '../stores/chatStore'
import { useChatStore } from '../stores/chatStore'

type SidebarProps = {
  chats: Chat[]
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  currentChatId: string
}

const Sidebar = (props: SidebarProps) => {
  const { chats, onSelectChat, onNewChat, currentChatId } = props
  const { deleteChat } = useChatStore()

  return (
    <div className="flex h-full w-64 flex-col bg-[#202123] text-gray-200">
      {/* New Chat Button */}
      <div className="p-2">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-3 rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-gray-700"
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
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`group flex w-full items-center gap-3 px-3 py-3 text-sm hover:bg-[#2A2B32] ${
              currentChatId === chat.id ? 'bg-[#2A2B32]' : ''
            }`}
          >
            <button
              onClick={() => onSelectChat(chat.id)}
              className="flex flex-1 items-center gap-3 overflow-hidden"
            >
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 flex-shrink-0"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <div className="relative max-h-5 flex-1 overflow-hidden text-ellipsis break-all">
                {chat.title}
              </div>
            </button>
            {chats.length > 1 && (
              <button
                onClick={() => deleteChat(chat.id)}
                className="invisible rounded p-1 text-gray-400 hover:text-white group-hover:visible"
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
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="border-t border-white/20 p-2">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-gray-700">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600">
            A
          </div>
          <div className="grow overflow-hidden text-ellipsis whitespace-nowrap text-left">
            AI Assistant
          </div>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
