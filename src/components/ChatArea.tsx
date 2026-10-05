import React, { useState, useEffect, useRef } from 'react';
import { ChatItem, ChatMessage } from '../types';
import { getDisplayPhone } from '../services/greenApi';
import {
  Send,
  User,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface ChatAreaProps {
  chat: ChatItem;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isSending: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  messages,
  onSendMessage,
  isSending,
}) => {
  const [inputText, setInputText] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [chat.chatId]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    setSendError(null);
    try {
      setInputText('');
      await onSendMessage(trimmed);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось отправить сообщение';
      setSendError(msg);
      setInputText(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayName = chat.name || getDisplayPhone(chat.chatId);

  const formatMessageTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#efeae2] relative overflow-hidden">
      <div className="h-16 px-4 py-2.5 bg-[#f0f2f5] border-b border-gray-200 flex items-center justify-between z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {chat.name ? (
              chat.name.slice(0, 2).toUpperCase()
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 leading-tight">
              {displayName}
            </h3>
            <p className="text-[11px] text-gray-500 font-mono">
              {chat.chatId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500">
          <span className="text-[11px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
            чат готов
          </span>
        </div>
      </div>

      {sendError && (
        <div className="px-4 py-2 bg-red-100 text-red-700 text-xs flex items-center justify-between border-b border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{sendError}</span>
          </div>
          <button
            onClick={() => setSendError(null)}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Закрыть
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2.5 chat-pattern-bg">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-200/50 text-xs text-gray-500 text-center max-w-xs">
              Сообщений пока нет. Напишите первое текстовое сообщение ниже.
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOut = msg.isOutgoing;
            return (
              <div
                key={msg.id}
                className={`flex ${isOut ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3.5 py-2 text-xs md:text-sm shadow-sm relative group ${
                    isOut
                      ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none'
                      : 'bg-white text-gray-900 rounded-tl-none'
                  }`}
                >
                  {!isOut && msg.sender && (
                    <div className="text-[10px] font-semibold text-brand-700 mb-0.5">
                      {msg.sender}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap break-words leading-relaxed text-[13px]">
                    {msg.text}
                  </p>

                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500 float-right ml-2 -mb-0.5">
                    <span>{formatMessageTime(msg.timestamp)}</span>
                    {isOut && (
                      <span>
                        {msg.status === 'pending' && (
                          <Clock className="w-3 h-3 text-gray-400 animate-spin" />
                        )}
                        {msg.status === 'sent' && (
                          <Check className="w-3 h-3 text-gray-400" />
                        )}
                        {(msg.status === 'delivered' || msg.status === 'read') && (
                          <CheckCheck className="w-3 h-3 text-brand-600" />
                        )}
                        {msg.status === 'failed' && (
                          <AlertCircle className="w-3 h-3 text-red-500" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-[#f0f2f5] border-t border-gray-200">
        <form onSubmit={handleSend} className="flex items-end gap-2 max-w-5xl mx-auto">
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 px-3 py-1.5 focus-within:border-brand-500 transition-all flex items-end">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите текстовое сообщение... (Enter — отправить, Shift+Enter — перенос)"
              className="w-full resize-none text-xs md:text-sm text-gray-800 bg-transparent focus:outline-none max-h-32 py-1 leading-relaxed"
              style={{ minHeight: '24px' }}
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-10 h-10 rounded-full bg-[#1ea678] hover:bg-[#148761] text-white flex items-center justify-center shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
            title="Отправить (Enter)"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
