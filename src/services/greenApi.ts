import {
  GreenApiCredentials,
  ReceiveNotificationResponse,
  SendMessageResponse,
  StateInstanceResponse,
} from '../types';

export const DEFAULT_API_URL = 'https://api.green-api.com';

export function normalizeApiUrl(url?: string): string {
  if (!url || !url.trim()) return DEFAULT_API_URL;
  return url.trim().replace(/\/+$/, '');
}

export function formatChatId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (trimmed.includes('@')) {
    return trimmed;
  }

  const cleanDigits = trimmed.replace(/\D/g, '');
  return `${cleanDigits}@c.us`;
}

export function getDisplayPhone(chatId: string): string {
  if (!chatId) return '';
  const [phonePart] = chatId.split('@');
  if (/^\d{11}$/.test(phonePart) && (phonePart.startsWith('7') || phonePart.startsWith('8'))) {
    return `+7 (${phonePart.slice(1, 4)}) ${phonePart.slice(4, 7)}-${phonePart.slice(7, 9)}-${phonePart.slice(9, 11)}`;
  }
  if (/^\d+$/.test(phonePart)) {
    return `+${phonePart}`;
  }
  return chatId;
}

export class GreenApiService {
  private static getBaseUrl(creds: GreenApiCredentials): string {
    const host = normalizeApiUrl(creds.apiUrl);
    return `${host}/waInstance${creds.idInstance.trim()}`;
  }

  public static async getStateInstance(
    creds: GreenApiCredentials
  ): Promise<StateInstanceResponse> {
    const url = `${this.getBaseUrl(creds)}/getStateInstance/${creds.apiTokenInstance.trim()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ошибка подключения (${response.status}): ${errText || response.statusText}`);
    }

    return response.json();
  }

  public static async sendMessage(
    creds: GreenApiCredentials,
    chatId: string,
    message: string
  ): Promise<SendMessageResponse> {
    const url = `${this.getBaseUrl(creds)}/sendMessage/${creds.apiTokenInstance.trim()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        chatId,
        message,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Не удалось отправить сообщение: ${errText || response.statusText}`);
    }

    return response.json();
  }

  public static async receiveNotification(
    creds: GreenApiCredentials,
    receiveTimeout = 5,
    signal?: AbortSignal
  ): Promise<ReceiveNotificationResponse | null> {
    const url = `${this.getBaseUrl(creds)}/receiveNotification/${creds.apiTokenInstance.trim()}?receiveTimeout=${receiveTimeout}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ошибка получения уведомления (${response.status}): ${errText || response.statusText}`);
    }

    const text = await response.text();
    if (!text || text.trim() === 'null' || text.trim() === '') {
      return null;
    }

    try {
      return JSON.parse(text) as ReceiveNotificationResponse;
    } catch {
      return null;
    }
  }

  public static async deleteNotification(
    creds: GreenApiCredentials,
    receiptId: number
  ): Promise<{ result: boolean }> {
    const url = `${this.getBaseUrl(creds)}/deleteNotification/${creds.apiTokenInstance.trim()}/${receiptId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ошибка удаления уведомления: ${errText || response.statusText}`);
    }

    return response.json();
  }
}
