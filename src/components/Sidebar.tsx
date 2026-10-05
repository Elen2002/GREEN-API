import React, { useState } from 'react';
import { ChatItem, GreenApiCredentials } from '../types';
import { getDisplayPhone } from '../services/greenApi';
import {
  MessageSquarePlus,
  Search,
  LogOut,
  Radio,
  User,
} from 'lucide-react';

interface SidebarProps {
  credentials: GreenApiCredentials;
  chats: ChatItem[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenNewChat: () => void;
  onLogout: () => void;
  isPolling: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  credentials,
  chats,
  activeChatId,
  onSelectChat,
  onOpenNewChat,
  onLogout,
  isPolling,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phoneNumber.toLowerCase().includes(q) ||
      c.chatId.toLowerCase().includes(q) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  });

  const formatTimestamp = (ts?: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-white border-r border-gray-200 select-none">
      <div className="p-3.5 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1ea678] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {credentials.idInstance.slice(0, 2) || 'ID'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-800">
                Инстанс {credentials.idInstance}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span
                className={`w-2 h-2 rounded-full ${
                  isPolling ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
              <span>{isPolling ? 'Слушатель активен' : 'Ожидание'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenNewChat}
            title="Создать новый чат"
            className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
          <button
            onClick={onLogout}
            title="Выйти из аккаунта"
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-3 bg-white border-b border-gray-100 flex gap-2">
        <button
          onClick={onOpenNewChat}
          className="w-full py-2 px-3 bg-[#1ea678] hover:bg-[#148761] text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Начать новый чат</span>
        </button>
      </div>

      <div className="p-2.5 bg-white border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по сообщениям или номеру..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-100/80 border border-transparent rounded-lg focus:bg-white focus:border-brand-500 focus:outline-none transition-all"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
            <Radio className="w-8 h-8 text-gray-300" />
            <p>
              {chats.length === 0
                ? 'Нет активных чатов. Нажмите «Начать новый чат», чтобы написать сообщение.'
                : 'Чатов по данному запросу не найдено.'}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.chatId === activeChatId;
            const displayName = chat.name || getDisplayPhone(chat.chatId);

            return (
              <div
                key={chat.chatId}
                onClick={() => onSelectChat(chat.chatId)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#eefcf5] border-l-4 border-l-[#1ea678]'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-sm ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {chat.name ? (
                    chat.name.slice(0, 2).toUpperCase()
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-gray-900 truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                      {formatTimestamp(chat.lastMessageTimestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <p className="truncate text-[11px] text-gray-500 max-w-[200px]">
                      {chat.lastMessage || 'Чат создан'}
                    </p>
                    {chat.unreadCount && chat.unreadCount > 0 ? (
                      <span className="w-4 h-4 rounded-full bg-[#1ea678] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 ml-1">
                        {chat.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
