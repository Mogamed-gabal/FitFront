import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

let refreshInProgress = false;
const refreshedToken$ = new BehaviorSubject<string | null>(null);

function addAuthHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function shouldSkipAuth(req: HttpRequest<unknown>): boolean {
  return req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh');
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const authReq = token && !shouldSkipAuth(req) ? addAuthHeader(req, token) : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || shouldSkipAuth(req)) {
        return throwError(() => error);
      }

      if (!refreshInProgress) {
        refreshInProgress = true;
        refreshedToken$.next(null);

        return authService.refreshToken().pipe(
          switchMap((tokens) => {
            authService.saveToken(tokens);
            refreshInProgress = false;
            refreshedToken$.next(tokens.accessToken);
            return next(addAuthHeader(req, tokens.accessToken));
          }),
          catchError((refreshError) => {
            refreshInProgress = false;
            authService.logout();
            router.navigateByUrl('/login');
            return throwError(() => refreshError);
          }),
        );
      }

      return refreshedToken$.pipe(
        filter((freshToken): freshToken is string => !!freshToken),
        take(1),
        switchMap((freshToken) => next(addAuthHeader(req, freshToken))),
      );
    }),
  );
};
