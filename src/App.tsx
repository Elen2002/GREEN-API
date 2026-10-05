import React, { useState, useEffect, useCallback } from 'react';
import {
  ChatItem,
  ChatMessage,
  GreenApiCredentials,
} from './types';
import { GreenApiService, getDisplayPhone, formatChatId } from './services/greenApi';
import { useNotificationPolling } from './hooks/useNotificationPolling';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { EmptyState } from './components/EmptyState';
import { NewChatModal } from './components/NewChatModal';

const STORAGE_KEYS = {
  CREDS: 'green_api_creds_v1',
  CHATS: 'green_api_chats_v1',
  MESSAGES: 'green_api_messages_v1',
  ACTIVE_CHAT: 'green_api_active_chat_v1',
};

export const App: React.FC = () => {
  const [credentials, setCredentials] = useState<GreenApiCredentials | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CREDS);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [chats, setChats] = useState<ChatItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHATS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT) || null;
  });

  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (credentials) {
      localStorage.setItem(STORAGE_KEYS.CREDS, JSON.stringify(credentials));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CREDS);
    }
  }, [credentials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT, activeChatId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT);
    }
  }, [activeChatId]);

  const handleIncomingMessage = useCallback((incoming: ChatMessage) => {
    const targetChatId = incoming.chatId;

    setMessages((prev) => {
      const chatMsgs = prev[targetChatId] || [];
      if (chatMsgs.some((m) => m.id === incoming.id)) {
        return prev;
      }
      return {
        ...prev,
        [targetChatId]: [...chatMsgs, incoming],
      };
    });

    setChats((prevChats) => {
      const existingIndex = prevChats.findIndex((c) => c.chatId === targetChatId);
      if (existingIndex !== -1) {
        const updated = [...prevChats];
        const current = updated[existingIndex];
        const isCurrentActive = activeChatId === targetChatId;
        updated[existingIndex] = {
          ...current,
          lastMessage: incoming.text,
          lastMessageTimestamp: incoming.timestamp,
          unreadCount: isCurrentActive ? 0 : (current.unreadCount || 0) + 1,
        };
        const [moved] = updated.splice(existingIndex, 1);
        return [moved, ...updated];
      } else {
        const newChat: ChatItem = {
          chatId: targetChatId,
          phoneNumber: getDisplayPhone(targetChatId),
          name: incoming.sender || getDisplayPhone(targetChatId),
          lastMessage: incoming.text,
          lastMessageTimestamp: incoming.timestamp,
          unreadCount: activeChatId === targetChatId ? 0 : 1,
        };
        return [newChat, ...prevChats];
      }
    });
  }, [activeChatId]);

  const isDemo = credentials?.apiTokenInstance?.startsWith('demo-token');
  const { isPolling } = useNotificationPolling({
    credentials,
    enabled: !!credentials && !isDemo,
    onMessageReceived: handleIncomingMessage,
  });

  const handleLogin = (creds: GreenApiCredentials) => {
    setCredentials(creds);
  };

  const handleLogout = () => {
    setCredentials(null);
    setActiveChatId(null);
    localStorage.removeItem(STORAGE_KEYS.CREDS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT);
  };

  const handleCreateChat = (chatId: string, displayName?: string) => {
    const formattedId = formatChatId(chatId);

    setChats((prev) => {
      const exists = prev.find((c) => c.chatId === formattedId);
      if (exists) {
        return prev;
      }
      const newChat: ChatItem = {
        chatId: formattedId,
        phoneNumber: getDisplayPhone(formattedId),
        name: displayName || getDisplayPhone(formattedId),
        lastMessage: 'Чат создан',
        lastMessageTimestamp: Date.now(),
        unreadCount: 0,
      };
      return [newChat, ...prev];
    });

    setActiveChatId(formattedId);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setChats((prev) =>
      prev.map((c) => (c.chatId === chatId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = async (text: string) => {
    if (!credentials || !activeChatId) return;

    const tempId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      chatId: activeChatId,
      sender: 'Вы',
      text,
      timestamp: Date.now(),
      isOutgoing: true,
      status: 'pending',
    };

    setMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    setChats((prev) =>
      prev.map((c) =>
        c.chatId === activeChatId
          ? {
              ...c,
              lastMessage: text,
              lastMessageTimestamp: Date.now(),
            }
          : c
      )
    );

    setIsSending(true);

    try {
      if (isDemo) {
        await new Promise((res) => setTimeout(res, 600));
        setMessages((prev) => ({
          ...prev,
          [activeChatId]: (prev[activeChatId] || []).map((m) =>
            m.id === tempId ? { ...m, id: `msg-${Date.now()}`, status: 'delivered' } : m
          ),
        }));

        setTimeout(() => {
          handleIncomingMessage({
            id: `demo-incoming-${Date.now()}`,
            chatId: activeChatId,
            sender: 'Собеседник (Демо)',
            text: `Получено: «${text}»! Это симуляция ответа в демо-режиме GREEN-API.`,
            timestamp: Date.now(),
            isOutgoing: false,
            status: 'delivered',
          });
        }, 2200);
      } else {
        const resp = await GreenApiService.sendMessage(
          credentials,
          activeChatId,
          text
        );

        setMessages((prev) => ({
          ...prev,
          [activeChatId]: (prev[activeChatId] || []).map((m) =>
            m.id === tempId
              ? { ...m, id: resp.idMessage || tempId, status: 'sent' }
              : m
          ),
        }));
      }
    } catch (err) {
      setMessages((prev) => ({
        ...prev,
        [activeChatId]: (prev[activeChatId] || []).map((m) =>
          m.id === tempId ? { ...m, status: 'failed' } : m
        ),
      }));
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  if (!credentials) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const activeChat = chats.find((c) => c.chatId === activeChatId);
  const activeChatMessages = activeChatId ? messages[activeChatId] || [] : [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <Sidebar
        credentials={credentials}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onOpenNewChat={() => setIsNewChatModalOpen(true)}
        onLogout={handleLogout}
        isPolling={isPolling || Boolean(isDemo)}
      />

      <main className="flex-1 h-full overflow-hidden flex flex-col">
        {activeChat ? (
          <ChatArea
            chat={activeChat}
            messages={activeChatMessages}
            onSendMessage={handleSendMessage}
            isSending={isSending}
          />
        ) : (
          <EmptyState onOpenNewChat={() => setIsNewChatModalOpen(true)} />
        )}
      </main>

      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onCreateChat={handleCreateChat}
      />
    </div>
  );
};

export default App;
