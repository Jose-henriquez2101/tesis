import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // SIEMPRE validar sesión con el backend
  const ok = await authService.checkSession();

  if (ok) return true;

  return router.parseUrl('/login');
};

