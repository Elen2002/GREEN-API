export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl?: string;
}

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatMessage {
  id: string;
  chatId: string;
  sender: string;
  senderName?: string;
  text: string;
  timestamp: number;
  isOutgoing: boolean;
  status: MessageStatus;
}

export interface ChatItem {
  chatId: string;
  phoneNumber: string;
  name: string;
  lastMessage?: string;
  lastMessageTimestamp?: number;
  unreadCount?: number;
}

export interface ReceiveNotificationResponse {
  receiptId: number;
  body: {
    typeWebhook: string;
    instanceData?: {
      idInstance: number | string;
      wid?: string;
      typeInstance?: string;
    };
    timestamp?: number;
    idMessage?: string;
    senderData?: {
      chatId?: string;
      chatName?: string;
      sender?: string;
      senderName?: string;
      senderContactName?: string;
    };
    messageData?: {
      typeMessage: string;
      textMessageData?: {
        textMessage: string;
      };
      extendedTextMessageData?: {
        text: string;
        description?: string;
        title?: string;
        previewUrl?: string;
      };
      quotedMessage?: {
        stanzaId?: string;
        participant?: string;
        typeMessage?: string;
        textMessage?: string;
      };
    };
  };
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface StateInstanceResponse {
  stateInstance: 'authorized' | 'notAuthorized' | 'blocked' | 'sleepMode' | 'starting';
}
