import { PLATFORM_ID, Injectable, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  ApiEnvelope,
  AuthTokens,
  CurrentUser,
  LoginRequest,
} from '../../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly apiBase = 'https://fit-proo.vercel.app/api/auth';
  private readonly accessTokenKey = 'auth.accessToken';
  private readonly refreshTokenKey = 'auth.refreshToken';
  private readonly allowedRoles = new Set(['admin', 'supervisor']);

  login(payload: LoginRequest): Observable<AuthTokens> {
    return this.http
      .post<ApiEnvelope<AuthTokens> | AuthTokens>(`${this.apiBase}/login`, payload)
      .pipe(
        map((response) => this.extractTokens(response)),
        catchError((error) => this.handleHttpError(error)),
      );
  }

  getMe(): Observable<CurrentUser> {
    return this.http
      .get<ApiEnvelope<CurrentUser> | CurrentUser>(`${this.apiBase}/me`)
      .pipe(
        map((response) => this.normalizeCurrentUser(this.extractPayload(response))),
        catchError((error) => this.handleHttpError(error)),
      );
  }

  refreshToken(): Observable<AuthTokens> {
    return this.http
      .post<ApiEnvelope<AuthTokens> | AuthTokens>(
        `${this.apiBase}/refresh`,
        { refreshToken: this.getRefreshToken() },
      )
      .pipe(
        map((response) => this.extractTokens(response)),
        catchError((error) => this.handleHttpError(error)),
      );
  }

  saveToken(tokens: AuthTokens): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(this.accessTokenKey, tokens.accessToken);
    localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem(this.refreshTokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(user: unknown): string {
    if (!user || typeof user !== 'object') {
      return '';
    }

    const source = user as Record<string, unknown>;
    const nestedUser =
      source['user'] && typeof source['user'] === 'object'
        ? (source['user'] as Record<string, unknown>)
        : null;

    const directRole = source['role'];
    const nestedRole = nestedUser?.['role'];
    const candidate = directRole ?? nestedRole;

    if (typeof candidate === 'string') {
      return candidate.toLowerCase();
    }

    if (candidate && typeof candidate === 'object' && 'name' in candidate) {
      const roleName = (candidate as Record<string, unknown>)['name'];
      if (typeof roleName === 'string') {
        return roleName.toLowerCase();
      }
    }

    const rolesValue = source['roles'] ?? nestedUser?.['roles'];
    if (Array.isArray(rolesValue) && rolesValue.length > 0) {
      const firstRole = rolesValue[0];
      if (typeof firstRole === 'string') {
        return firstRole.toLowerCase();
      }
      if (firstRole && typeof firstRole === 'object' && 'name' in firstRole) {
        const roleName = (firstRole as Record<string, unknown>)['name'];
        if (typeof roleName === 'string') {
          return roleName.toLowerCase();
        }
      }
    }

    return '';
  }

  isAllowedRole(user: unknown): boolean {
    return this.allowedRoles.has(this.getUserRole(user));
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  private extractTokens(response: ApiEnvelope<AuthTokens> | AuthTokens): AuthTokens {
    const payload = this.extractPayload(response);
    if (!payload?.accessToken || !payload?.refreshToken) {
      throw new Error('Authentication response is missing tokens.');
    }

    return payload;
  }

  private extractPayload<T>(response: ApiEnvelope<T> | T): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as ApiEnvelope<T>).data as T;
    }

    return response as T;
  }

  private normalizeCurrentUser(user: unknown): CurrentUser {
    if (!user || typeof user !== 'object') {
      return { id: '', email: '', role: '' };
    }

    const source = user as Record<string, unknown>;
    const nestedUser =
      source['user'] && typeof source['user'] === 'object'
        ? (source['user'] as Record<string, unknown>)
        : null;

    return {
      ...(nestedUser ?? source),
      id: (nestedUser?.['id'] ?? source['id'] ?? '') as string | number,
      email: (nestedUser?.['email'] ?? source['email'] ?? '') as string,
      role: this.getUserRole(user),
    };
  }

  private handleHttpError(error: unknown) {
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() => new Error('Unexpected error occurred. Please try again.'));
    }

    const backendMessage =
      (error.error?.message as string | undefined) ??
      (error.error?.error as string | undefined) ??
      '';
    const msg = backendMessage.toLowerCase();

    if (error.status === 429 || msg.includes('rate limit')) {
      return throwError(
        () => new Error('Too many attempts. Please wait a moment and try again.'),
      );
    }

    if (
      error.status === 423 ||
      msg.includes('temporarily blocked') ||
      msg.includes('temporary block')
    ) {
      return throwError(
        () => new Error('Your account is temporarily blocked. Please try again later.'),
      );
    }

    if (error.status === 401) {
      return throwError(() => new Error('Invalid email or password.'));
    }

    if (backendMessage) {
      return throwError(() => new Error(backendMessage));
    }

    return throwError(() => new Error('Request failed. Please try again.'));
  }
}
