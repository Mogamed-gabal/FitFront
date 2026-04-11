import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, of, catchError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export const roleGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getMe().pipe(
    map((user) => (authService.isAllowedRole(user) ? true : router.createUrlTree(['/login']))),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
