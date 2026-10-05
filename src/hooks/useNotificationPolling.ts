import { useEffect, useRef, useState, useCallback } from 'react';
import { ChatMessage, GreenApiCredentials } from '../types';
import { GreenApiService } from '../services/greenApi';

interface UseNotificationPollingOptions {
  credentials: GreenApiCredentials | null;
  enabled: boolean;
  onMessageReceived: (message: ChatMessage) => void;
}

export function useNotificationPolling({
  credentials,
  enabled,
  onMessageReceived,
}: UseNotificationPollingOptions) {
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const onMessageRef = useRef(onMessageReceived);
  onMessageRef.current = onMessageReceived;

  const pollLoop = useCallback(async () => {
    if (!credentials || !enabled) return;

    setIsPolling(true);
    abortControllerRef.current = new AbortController();

    while (enabled && credentials.idInstance && credentials.apiTokenInstance) {
      try {
        const notification = await GreenApiService.receiveNotification(
          credentials,
          5,
          abortControllerRef.current?.signal
        );

        setLastSyncTime(new Date());
        setError(null);

        if (notification && notification.receiptId) {
          const { receiptId, body } = notification;

          if (
            body.typeWebhook === 'incomingMessageReceived' ||
            body.typeWebhook === 'outgoingMessageReceived' ||
            body.typeWebhook === 'outgoingAPIMessageReceived'
          ) {
            const text =
              body.messageData?.textMessageData?.textMessage ||
              body.messageData?.extendedTextMessageData?.text ||
              '';

            const rawChatId =
              body.senderData?.chatId ||
              body.senderData?.sender ||
              (body as unknown as { chatId?: string }).chatId ||
              '';

            if (text && rawChatId) {
              const isOutgoing = body.typeWebhook.startsWith('outgoing');
              const msg: ChatMessage = {
                id: body.idMessage || `receipt-${receiptId}`,
                chatId: rawChatId,
                sender:
                  body.senderData?.senderName ||
                  body.senderData?.senderContactName ||
                  body.senderData?.chatName ||
                  (isOutgoing ? 'Вы' : rawChatId),
                text,
                timestamp: body.timestamp ? body.timestamp * 1000 : Date.now(),
                isOutgoing,
                status: 'delivered',
              };

              onMessageRef.current(msg);
            }
          }

          try {
            await GreenApiService.deleteNotification(credentials, receiptId);
          } catch (delErr) {
            console.warn('Failed to delete notification:', delErr);
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          break;
        }

        const msg = err instanceof Error ? err.message : 'Ошибка соединения с GREEN-API';
        setError(msg);
        await new Promise((res) => setTimeout(res, 4000));
      }
    }

    setIsPolling(false);
  }, [credentials, enabled]);

  useEffect(() => {
    if (!enabled || !credentials?.idInstance || !credentials?.apiTokenInstance) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsPolling(false);
      return;
    }

    pollLoop();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [credentials, enabled, pollLoop]);

  return { isPolling, error, lastSyncTime };
}
