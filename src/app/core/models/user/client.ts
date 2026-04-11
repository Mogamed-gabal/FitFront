export interface Client {
        _id: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        dateOfBirth: string;
        region: string;
        gender: 'male' | 'female';
        role: 'client';
        emailVerified: boolean;
        isBlocked: boolean;
        isDeleted: boolean;
        status: 'approved' | 'pending' | 'rejected';
        height: number;
        goal: string;
        loginAttempts: number;
        passwordResetOtpAttempts: number;
        weightHistory: any[];
        lastLogin: any;
        createdAt: string;
        updatedAt: any;
        __v: number;
      }
      
      export interface Pagination {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        hasNext: boolean;
        hasPrev: boolean;
      }
      
      export interface GetClientsResponse {
        success: boolean;
        data: {
          users: Client[];
          pagination: Pagination;
        };
      
}
