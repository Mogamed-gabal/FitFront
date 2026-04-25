export interface AuditLog {
  _id: string;
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: {
    type: string;
    name: string;
    description: string;
  };
  target: {
    id: string;
    type: string;
    name: string;
  };
  module: string;
  context: {
    ip: string;
    userAgent: string;
    sessionId: string;
  };
  details: {
    reason?: string;
    previousData?: any;
  };
  outcome: 'success' | 'failure' | 'error';
  timestamp: string;
  duration: number;
}

export interface GetAuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  statistics: {
    total: number;
    success: number;
    failure: number;
    error: number;
  };
  filters: {
    actionTypes: string[];
    targetTypes: string[];
    modules: string[];
  };
}

export interface ActionType {
  type: string;
  name: string;
  description: string;
}

export interface TargetType {
  type: string;
  name: string;
}

export interface ActivitySummary {
  totalActions: number;
  topActions: Array<{
    action: string;
    count: number;
    percentage: number;
  }>;
  userActivity: Array<{
    userId: string;
    userName: string;
    actionCount: number;
  }>;
  dailyActivity: Array<{
    date: string;
    count: number;
  }>;
}
