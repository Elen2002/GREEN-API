import React, { useState } from 'react';
import { formatChatId, getDisplayPhone } from '../services/greenApi';
import { X, UserPlus, PhoneCall, AlertCircle } from 'lucide-react';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (chatId: string, displayName?: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onCreateChat,
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formattedId = formatChatId(phoneInput);
    const digitsOnly = phoneInput.replace(/\D/g, '');

    if (!digitsOnly || digitsOnly.length < 8) {
      setError('Введите корректный номер телефона получателя (не менее 8-10 цифр с кодом страны)');
      return;
    }

    onCreateChat(formattedId, nameInput.trim() || undefined);
    setPhoneInput('');
    setNameInput('');
    onClose();
  };

  const previewChatId = phoneInput.trim() ? formatChatId(phoneInput) : '';
  const previewFormatted = previewChatId ? getDisplayPhone(previewChatId) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#0f4736] text-white">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-brand-300" />
            <h2 className="text-base font-semibold">Новый чат</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-brand-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Номер телефона получателя
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                required
                placeholder="79991234567 или +7 999 123-45-67"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-mono"
              />
              <PhoneCall className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Указывайте номер в международном формате (с кодом страны, без знака плюс)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Имя собеседника <span className="font-normal text-gray-400">(необязательно)</span>
            </label>
            <input
              type="text"
              placeholder="Например: Иван Иванов"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          {previewChatId && (
            <div className="p-3 bg-brand-50/70 border border-brand-100 rounded-xl text-xs space-y-1">
              <div className="text-gray-500">Предпросмотр чата:</div>
              <div className="font-semibold text-brand-900">{previewFormatted}</div>
              <div className="text-[10px] text-brand-700 font-mono">chatId: {previewChatId}</div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-[#1ea678] hover:bg-[#148761] text-white rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
            >
              Начать чат
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
