import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Client, GetClientsResponse } from '../../models/user/client';
import { environment } from '../../config/environment';

export interface GetClientsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetClientByIdResponse {
  success: boolean;
  data: Client;
}

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getClients(params: GetClientsParams = {}): Observable<GetClientsResponse> {
    let httpParams = new HttpParams();
    if (params.page != null) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params.limit != null) {
      httpParams = httpParams.set('limit', String(params.limit));
    }
    if (params.search != null && params.search.trim() !== '') {
      httpParams = httpParams.set('search', params.search.trim());
    }

    return this.http.get<GetClientsResponse>(`${this.baseUrl}/api/users`, {
      params: httpParams,
    });
  }

  getClientById(id: string): Observable<Client> {
    return this.http.get<GetClientByIdResponse>(`${this.baseUrl}/api/users/${id}`).pipe(
      map((response: GetClientByIdResponse) => response.data)
    );
  }

  blockClient(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.baseUrl}/api/users/${id}/block`, {});
  }

  unblockClient(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.baseUrl}/api/admin/users/${id}/unblock`, {});
  }

  deleteClient(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/api/users/${id}`);
  }
}
