export interface Chat {
  chatId: string;
  type: 'ONE_TO_ONE' | 'GROUP';
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  participants: ChatParticipant[];
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  hasDoctor: boolean;
  hasClient: boolean;
}

export interface ChatParticipant {
  userId: string;
  user: {
    name: string;
    email: string;
    role: 'client' | 'doctor' | 'admin' | 'supervisor';
    specialization?: string;
  };
  isOnline: boolean;
  lastSeen?: string;
}

export interface GetAllChatsResponse {
  chats: Chat[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ChatStatistics {
  totalMessages: number;
  activeParticipants: number;
  averageResponseTime: number;
  messagesByDay: Array<{
    date: string;
    count: number;
  }>;
}
