export interface DeletedUser {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'doctor' | 'supervisor' | 'admin';
  isDeleted: boolean;
  deletedAt: string;
  deletedBy: string;
  createdAt: string;
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
  data: {
    users: DeletedUser[];
    pagination: {
      page: number;
      pages: number;
      limit: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    statistics: {
      total: number;
      roleStatistics: {
        client: number;
        doctor: number;
        supervisor: number;
        admin: number;
      };
    };
  };
}

export interface RestoreUserResponse {
  success: boolean;
  message: string;
  data: DeletedUser;
}

export interface PermanentDeleteResponse {
  success: boolean;
  message: string;
}
