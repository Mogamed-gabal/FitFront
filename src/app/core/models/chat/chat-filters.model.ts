export interface ChatFilters {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  search?: string;
  participantRole?: 'client' | 'doctor';
  specialization?: string;
  chatType?: 'ONE_TO_ONE' | 'GROUP';
}

export interface GetMessagesParams {
  page?: number;
  limit?: number;
  before?: string;
  after?: string;
}
