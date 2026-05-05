import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';

export interface Supervisor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetSupervisorsResponse {
  success: boolean;
  data: {
    users: Supervisor[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface DeleteSupervisorResponse {
  success: boolean;
  message: string;
  data: Supervisor;
}

export interface Permission {
  name: string;
  description: string;
  category: string;
  action: string;
  resource: string;
  level: number;
}

export interface UserPermission {
  _id: string;
  name: string;
  userId: string;
  assignedBy: string;
  assignedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  reason?: string;
  assignedByUser?: {
    _id: string;
    name: string;
  };
}

export interface AvailablePermission {
  name: string;
  description: string;
  category: string;
  action: string;
  resource: string;
  level: 'SYSTEM' | 'LIMITED' | 'PERSONAL';
  isActive: boolean;
  isAssignable: boolean;
  endpoints?: string[];
}

export interface GrantPermissionRequest {
  userId: string;
  permissionName: string;
  expiresAt?: string;
  reason?: string;
}

export interface GrantPermissionResponse {
  success: boolean;
  data: {
    permission: UserPermission;
    user: Supervisor;
  };
}

export interface RevokePermissionRequest {
  userId: string;
  permissionName: string;
  reason?: string;
}

export interface RevokePermissionResponse {
  success: boolean;
  data: {
    message: string;
    revokedAt: string;
    revokedBy?: {
      _id: string;
      name: string;
    };
  };
}

export interface GetUserPermissionsResponse {
  success: boolean;
  data: {
    user: Supervisor;
    permissions: UserPermission[];
    totalPermissions: number;
    activePermissions: number;
    expiredPermissions: number;
  };
}

export interface GetAllPermissionsResponse {
  success: boolean;
  data: {
    permissions: AvailablePermission[];
    count: number;
    filters: {
      includeInactive: boolean;
    };
  };
}

export interface CheckPermissionResponse {
  success: boolean;
  data: {
    userId: string;
    permissionName: string;
    hasPermission: boolean;
    permissionDetails?: {
      _id: string;
      grantedAt: string;
      grantedBy: string;
      expiresAt: string | null;
      isActive: boolean;
      reason?: string;
    };
  };
}

export interface PermissionHistory {
  _id: string;
  permissionName: string;
  action: 'GRANTED' | 'REVOKED';
  performedBy: {
    _id: string;
    name: string;
  };
  performedAt: string;
  reason?: string;
}

export interface GetPermissionHistoryResponse {
  success: boolean;
  data: {
    user: Supervisor;
    history: PermissionHistory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    summary: {
      totalActions: number;
      grantedCount: number;
      revokedCount: number;
    };
  };
}

export interface GetUsersWithPermissionResponse {
  success: boolean;
  data: {
    permission: string;
    users: {
      _id: string;
      name: string;
      email: string;
      role: string;
      grantedAt: string;
      grantedBy: string;
      expiresAt: string | null;
      isActive: boolean;
    }[];
    totalUsers: number;
    activeUsers: number;
  };
}

export interface PermissionActionResponse {
  success: boolean;
  message: string;
}

export interface AuditLog {
  _id: string;
  supervisorId: string;
  action: string;
  module: string;
  outcome: {
    status: string;
  };
  timestamp: string;
  target: {
    entityType: string;
    previousState?: any;
    newState?: any;
  };
  context: {
    description: string;
    reason: string;
  };
  technical: {
    endpoint: string;
    method: string;
    ipAddress: string;
    duration: number;
  };
}

export interface GetAuditLogsResponse {
  success: boolean;
  data: {
    logs: AuditLog[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      limit: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class SupervisorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getSupervisors(page: number = 1, limit: number = 10): Observable<GetSupervisorsResponse> {
    return this.http.get<GetSupervisorsResponse>(`${this.baseUrl}${environment.supervisorEndpoint}?page=${page}&limit=${limit}`);
  }

  getSupervisor(id: string): Observable<{ success: boolean; data: Supervisor }> {
    return this.http.get<{ success: boolean; data: Supervisor }>(`${this.baseUrl}${environment.supervisorEndpoint}/${id}`);
  }

  deleteSupervisor(id: string): Observable<DeleteSupervisorResponse> {
    return this.http.delete<DeleteSupervisorResponse>(`${this.baseUrl}${environment.supervisorEndpoint}/${id}`);
  }

  createSupervisor(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${environment.supervisorEndpoint}`, data);
  }

  getAuditLogs(params: {
    page?: number;
    limit?: number;
    supervisorId?: string;
    action?: string;
    module?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<GetAuditLogsResponse> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.supervisorId) httpParams = httpParams.set('supervisorId', params.supervisorId);
    if (params.action) httpParams = httpParams.set('action', params.action);
    if (params.module) httpParams = httpParams.set('module', params.module);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);

    return this.http.get<GetAuditLogsResponse>(`${this.baseUrl}/api/supervisor-audit/logs`, { params: httpParams });
  }

  // Permission Management Methods - Updated API
  getAllPermissions(): Observable<GetAllPermissionsResponse> {
    return this.http.get<GetAllPermissionsResponse>(`${this.baseUrl}/api/permissions/all`);
  }

  grantPermission(request: GrantPermissionRequest): Observable<GrantPermissionResponse> {
    return this.http.post<GrantPermissionResponse>(`${this.baseUrl}/api/permissions/grant`, request);
  }

  revokePermission(request: RevokePermissionRequest): Observable<RevokePermissionResponse> {
    return this.http.post<RevokePermissionResponse>(`${this.baseUrl}/api/permissions/revoke`, request);
  }

  getUserPermissions(userId: string): Observable<GetUserPermissionsResponse> {
    return this.http.get<GetUserPermissionsResponse>(`${this.baseUrl}/api/permissions/user/${userId}`);
  }

  checkUserPermission(userId: string, permissionName: string): Observable<CheckPermissionResponse> {
    return this.http.get<CheckPermissionResponse>(`${this.baseUrl}/api/permissions/check/${userId}/${permissionName}`);
  }

  getPermissionHistory(userId: string, page: number = 1, limit: number = 20): Observable<GetPermissionHistoryResponse> {
    const httpParams = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<GetPermissionHistoryResponse>(`${this.baseUrl}/api/permissions/history/${userId}`, { params: httpParams });
  }

  getUsersWithPermission(permissionName: string): Observable<GetUsersWithPermissionResponse> {
    return this.http.get<GetUsersWithPermissionResponse>(`${this.baseUrl}/api/permissions/users/${permissionName}`);
  }
}
