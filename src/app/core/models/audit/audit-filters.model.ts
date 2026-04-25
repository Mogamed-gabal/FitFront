export interface AuditFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  target?: string;
  module?: string;
  outcome?: 'success' | 'failure' | 'error';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ActivitySummaryFilters {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}
