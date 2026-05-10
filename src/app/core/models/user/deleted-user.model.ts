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
  isRecommended: boolean;
  loginAttempts: number;
  passwordResetOtpAttempts: number;
  packages: any[];
  certificates: any[];
  weightHistory: any[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  deletedBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  restoredAt?: string;
  restoredBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  __v?: number;
}

export interface GetDeletedUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetDeletedUsersResponse {
  success: boolean;
  data: {
    users: DeletedUser[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    statistics: {
      totalSoftDeleted: number;
      deletedByRole: {
        [key: string]: number;
      };
    };
    filters: {
      role: string;
      sortBy: string;
      sortOrder: string;
      search: string;
    };
  };
}

export interface RestoreUserResponse {
  success: boolean;
  message: string;
  data: {
    user: DeletedUser;
  };
}

export interface PermanentDeleteResponse {
  success: boolean;
  message: string;
  data: {
    deletedUser: DeletedUser;
    deletedBy: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
    deletedAt: string;
    reason: string;
  };
}
