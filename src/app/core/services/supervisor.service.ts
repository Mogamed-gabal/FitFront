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
  name: string;
  assignedAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

export interface GetAllPermissionsResponse {
  success: boolean;
  data: {
    permissions: Permission[];
  };
}

export interface GetUserPermissionsResponse {
  success: boolean;
  data: {
    permissions: UserPermission[];
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

  deleteSupervisor(id: string): Observable<DeleteSupervisorResponse> {
    return this.http.delete<DeleteSupervisorResponse>(`${this.baseUrl}${environment.supervisorEndpoint}/${id}`);
  }

  createSupervisor(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${environment.supervisorEndpoint}`, data);
  }

  getAllPermissions(): Observable<GetAllPermissionsResponse> {
    return this.http.get<GetAllPermissionsResponse>(`${this.baseUrl}${environment.permissionsEndpoint}/all`);
  }

  getUserPermissions(userId: string): Observable<GetUserPermissionsResponse> {
    return this.http.get<GetUserPermissionsResponse>(`${this.baseUrl}${environment.permissionsEndpoint}/user/${userId}`);
  }

  grantPermission(userId: string, permissionName: string): Observable<PermissionActionResponse> {
    return this.http.post<PermissionActionResponse>(`${this.baseUrl}${environment.permissionsEndpoint}/grant`, {
      userId,
      permissionName
    });
  }

  revokePermission(userId: string, permissionName: string): Observable<PermissionActionResponse> {
    return this.http.post<PermissionActionResponse>(`${this.baseUrl}${environment.permissionsEndpoint}/revoke`, {
      userId,
      permissionName
    });
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
}
