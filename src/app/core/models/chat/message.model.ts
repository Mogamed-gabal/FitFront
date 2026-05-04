export interface Message {
  messageId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: string;
  isRead: boolean;
  attachment?: MessageAttachment;
  sender?: {
    name: string;
    role: 'client' | 'doctor' | 'admin' | 'supervisor';
  };
}

export interface MessageAttachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

export interface GetMessagesResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SocketMessageEvent {
  chatId: string;
  message: Message;
}

export interface SocketTypingEvent {
  chatId: string;
  userId: string;
  userName: string;
}

export interface SocketUserStatusEvent {
  userId: string;
  userName: string;
  isOnline: boolean;
}
