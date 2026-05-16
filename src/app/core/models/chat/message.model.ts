export interface Message {
  _id: string;
  messageId: string;
  chatId: string;
  senderId: MessageSender;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  attachment: MessageAttachment | null;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  metadata: MessageMetadata;
  isDeleted: boolean;
  readBy: ReadBy[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageSender {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'doctor' | 'admin' | 'supervisor';
}

export interface MessageAttachment {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  thumbnailUrl?: string;
}

export interface MessageMetadata {
  isEdited: boolean;
  mentions: any[];
  reactions: any[];
}

export interface ReadBy {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  readAt: string;
  _id: string;
}

export interface GetMessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
    page: number;
    limit: number;
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
