import { MessageSquare, ShieldCheck, Plus } from 'lucide-react';

interface EmptyStateProps {
  onOpenNewChat: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onOpenNewChat }) => {
  return (
    <div className="flex-1 h-full bg-[#f0f2f5] flex flex-col items-center justify-center p-8 text-center select-none border-b-[6px] border-b-[#1ea678]">
      <div className="max-w-md flex flex-col items-center space-y-5 animate-fadeIn">
        <div className="w-20 h-20 rounded-3xl bg-white shadow-md flex items-center justify-center text-brand-500">
          <MessageSquare className="w-10 h-10 text-[#1ea678]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-800">
            GREEN-API Веб-клиент
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
            Отправляйте и принимайте текстовые сообщения в реальном времени. Выберите существующий диалог слева или начните новый.
          </p>
        </div>

        <button
          onClick={onOpenNewChat}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1ea678] hover:bg-[#148761] text-white font-medium text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Начать новый диалог</span>
        </button>

        <div className="pt-8 flex items-center gap-2 text-[11px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
          <span>Синхронизация через ReceiveNotification HTTP API</span>
        </div>
      </div>
    </div>
  );
};
