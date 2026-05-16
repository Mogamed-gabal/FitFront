export interface Chat {
  chatId: string;
  type: 'ONE_TO_ONE' | 'GROUP';
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  participants: ChatParticipant[];
  subscriptionBinding: SubscriptionBinding;
  createdAt: string;
  updatedAt: string;
  participantNames: string[];
  participantRoles: string[];
  hasDoctor: boolean;
  hasClient: boolean;
}

export interface ChatParticipant {
  userId: string;
  role: 'DOCTOR' | 'CLIENT' | 'ADMIN' | 'SUPERVISOR';
  isActive: boolean;
  lastReadAt: string | null;
  _id: string;
  joinedAt: string;
  user: User;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  region: string;
  gender: 'male' | 'female';
  role: 'client' | 'doctor' | 'admin' | 'supervisor';
  specialization?: string;
  emailVerified: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
  status: 'approved' | 'pending' | 'rejected';
  isRecommended: boolean;
  profilePicture?: {
    secure_url: string;
  };
}

export interface SubscriptionBinding {
  subscriptionId: string | null;
  accessType: 'FREE' | 'PAID';
  allowedParticipantsSource: 'FREE_USERS' | 'SUBSCRIBED_USERS';
  validatedAt: string;
  isActive: boolean;
}

export interface GetAllChatsResponse {
  success: boolean;
  data: {
    chats: Chat[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      applied: any;
      available: any;
    };
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
