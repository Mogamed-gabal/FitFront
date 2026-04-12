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
}
