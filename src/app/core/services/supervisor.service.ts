import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class SupervisorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://fit-proo.vercel.app';

  getSupervisors(page: number = 1, limit: number = 10): Observable<GetSupervisorsResponse> {
    return this.http.get<GetSupervisorsResponse>(`${this.baseUrl}/api/admin/supervisors?page=${page}&limit=${limit}`);
  }

  deleteSupervisor(id: string): Observable<DeleteSupervisorResponse> {
    return this.http.delete<DeleteSupervisorResponse>(`${this.baseUrl}/api/admin/supervisors/${id}`);
  }

  createSupervisor(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/admin/supervisors`, data);
  }

  getAllPermissions(): Observable<GetAllPermissionsResponse> {
    return this.http.get<GetAllPermissionsResponse>(`${this.baseUrl}/api/permissions/all`);
  }

  getUserPermissions(userId: string): Observable<GetUserPermissionsResponse> {
    return this.http.get<GetUserPermissionsResponse>(`${this.baseUrl}/api/permissions/user/${userId}`);
  }

  grantPermission(userId: string, permissionName: string): Observable<PermissionActionResponse> {
    return this.http.post<PermissionActionResponse>(`${this.baseUrl}/api/permissions/grant`, {
      userId,
      permissionName
    });
  }

  revokePermission(userId: string, permissionName: string): Observable<PermissionActionResponse> {
    return this.http.post<PermissionActionResponse>(`${this.baseUrl}/api/permissions/revoke`, {
      userId,
      permissionName
    });
  }
}
