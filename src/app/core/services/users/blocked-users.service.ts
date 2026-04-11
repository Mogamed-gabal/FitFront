import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface BlockedUser {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'doctor' | 'supervisor';
  isBlocked: boolean;
  blockedAt: string;
  blockedBy: string;
  blockReason: string;
}

export interface GetBlockedUsersResponse {
  success: boolean;
  data: {
    blockedUsers: BlockedUser[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalBlockedUsers: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface GetBlockedUsersParams {
  page?: number;
  limit?: number;
  role?: 'client' | 'doctor' | 'supervisor';
}

@Injectable({
  providedIn: 'root'
})
export class BlockedUsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://fit-proo.vercel.app';

  getBlockedUsers(params: GetBlockedUsersParams = {}): Observable<GetBlockedUsersResponse> {
    let httpParams = new HttpParams();
    
    if (params.page != null) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params.limit != null) {
      httpParams = httpParams.set('limit', String(params.limit));
    }
    if (params.role != null && params.role.trim() !== '') {
      httpParams = httpParams.set('role', params.role.trim());
    }

    return this.http.get<GetBlockedUsersResponse>(`${this.baseUrl}/api/admin/blocked-users`, {
      params: httpParams,
    });
  }
}
