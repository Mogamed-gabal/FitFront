import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../config/environment';
import { 
  DeletedUser, 
  GetDeletedUsersParams, 
  GetDeletedUsersResponse, 
  RestoreUserResponse, 
  PermanentDeleteResponse 
} from '../../models/user/deleted-user.model';

@Injectable({
  providedIn: 'root'
})
export class DeletedUsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getDeletedUsers(params: GetDeletedUsersParams): Observable<GetDeletedUsersResponse> {
    const httpParams = new HttpParams({ fromObject: params as any });
    return this.http.get<GetDeletedUsersResponse>(`${this.baseUrl}/api/users/deleted`, { params: httpParams });
  }

  restoreUser(userId: string, reason?: string): Observable<RestoreUserResponse> {
    return this.http.post<RestoreUserResponse>(`${this.baseUrl}/api/users/${userId}/restore`, { reason });
  }

  permanentDelete(userId: string, reason?: string): Observable<PermanentDeleteResponse> {
    return this.http.delete<PermanentDeleteResponse>(`${this.baseUrl}/api/users/${userId}/permanent`, {
      body: { reason }
    });
  }
}
