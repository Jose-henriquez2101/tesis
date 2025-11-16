import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esperar a que se valide la sesión con el backend
  const isValid = await authService.isSessionValidated();

  if (isValid) {
    return true;
  }

  return router.parseUrl('/login');
};
