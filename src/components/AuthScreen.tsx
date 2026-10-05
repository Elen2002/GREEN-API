import React, { useState } from 'react';
import { GreenApiCredentials } from '../types';
import { GreenApiService, DEFAULT_API_URL } from '../services/greenApi';
import { KeyRound, ShieldCheck, HelpCircle, ExternalLink, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (creds: GreenApiCredentials) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = idInstance.trim();
    const cleanToken = apiTokenInstance.trim();

    if (!cleanId) {
      setError('Пожалуйста, введите idInstance');
      return;
    }
    if (!cleanToken) {
      setError('Пожалуйста, введите apiTokenInstance');
      return;
    }

    const creds: GreenApiCredentials = {
      idInstance: cleanId,
      apiTokenInstance: cleanToken,
      apiUrl: apiUrl.trim() || DEFAULT_API_URL,
    };

    setIsLoading(true);
    try {
      await GreenApiService.getStateInstance(creds);
      onLogin(creds);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось подключиться к GREEN-API';
      setError(`${message}. Проверьте правильность введенных ключей или статус инстанса.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    onLogin({
      idInstance: '1101820000',
      apiTokenInstance: 'demo-token-green-api-example-key',
      apiUrl: DEFAULT_API_URL,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2e24] via-[#114b38] to-[#0a1f19] flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-[#0f4736] text-white p-6 text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1ea678] text-white shadow-lg mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">GREEN-API Чат</h1>
          <p className="text-xs text-brand-200 mt-1">
            Клиент отправки и получения сообщений (MAX / WhatsApp)
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 text-xs leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                idInstance
              </label>
              <input
                type="text"
                required
                placeholder="Например: 1101823456"
                value={idInstance}
                onChange={(e) => setIdInstance(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                apiTokenInstance
              </label>
              <input
                type="password"
                required
                placeholder="Вставьте токен из личного кабинета"
                value={apiTokenInstance}
                onChange={(e) => setApiTokenInstance(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-mono"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-gray-500 hover:text-brand-600 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <span>{showAdvanced ? '− Скрыть apiUrl' : '+ Настроить apiUrl (по умолчанию api.green-api.com)'}</span>
              </button>

              {showAdvanced && (
                <div className="mt-2.5">
                  <label className="block text-xs text-gray-500 mb-1">
                    API Host Url
                  </label>
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.green-api.com"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#1ea678] hover:bg-[#148761] text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Проверка подключения...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Войти в чат</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={handleDemoMode}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-700 font-medium py-1.5 px-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Войти в демонстрационном режиме (тест интерфейса)</span>
            </button>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-100 space-y-1.5">
            <div className="font-semibold text-gray-700 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
              <span>Где взять ключи?</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              1. Зарегистрируйтесь на сайте{' '}
              <a
                href="https://green-api.com"
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 hover:underline inline-flex items-center gap-0.5 font-medium"
              >
                green-api.com <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
            <p className="leading-relaxed text-[11px]">
              2. Создайте инстанс (MAX или WhatsApp) и перейдите в его карточку.
            </p>
            <p className="leading-relaxed text-[11px]">
              3. Скопируйте <strong>idInstance</strong> и <strong>apiTokenInstance</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
