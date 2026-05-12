import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../config/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminPassService {
  constructor(private http: HttpClient) {}

  /**
   * Change admin own password
   * PUT /api/admin/change-password
   */
  changeOwnPassword(body: { currentPassword: string; newPassword: string; confirmPassword: string }): Observable<{ success: boolean; message: string; data?: { adminId: string; changedAt: string } }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem(environment.accessTokenKey)}`
    });

    return this.http.put<{ success: boolean; message: string; data?: { adminId: string; changedAt: string } }>(
      `${environment.apiBaseUrl}/api/admin/change-password`,
      body,
      { headers }
    ).pipe(
      map(response => response),
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.error || 'Something went wrong';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
