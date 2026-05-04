export interface DeletedUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'client' | 'doctor' | 'supervisor' | 'admin';
  emailVerified: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
  status: 'approved' | 'pending' | 'rejected' | 'active';
  loginAttempts: number;
  passwordResetOtpAttempts: number;
  packages: any[];
  certificates: any[];
  weightHistory: any[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  lockUntil?: string;
  deletedAt: string;
  deletedBy: string;
  isRecommended: boolean;
  sortDate: string;
  restoredAt?: string;
  restoredBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface GetDeletedUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  deletedFrom?: string;
  deletedTo?: string;
}

export interface GetDeletedUsersResponse {
  success: boolean;
  data: {
    users: DeletedUser[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    statistics: {
      totalRecords: number;
      blockedUsers: number;
      deletedSupervisors: number;
      roleStatistics: {
        _id: string;
        count: number;
        oldestBlocking: string;
        newestBlocking: string;
      }[];
      overallStats: {
        _id: null;
        totalBlocked: number;
        blockedByRole: {
          role: string;
          count: number;
        }[];
        avgBlockedDuration: number;
      };
    };
    filters: {
      search: null | string;
      role: null | string;
      blockedFrom: null | string;
      blockedTo: null | string;
    };
  };
}

export interface RestoreUserResponse {
  success: boolean;
  message: string;
  data: {
    user: DeletedUser;
    reason: string;
  };
}

export interface PermanentDeleteResponse {
  success: boolean;
  message: string;
}
