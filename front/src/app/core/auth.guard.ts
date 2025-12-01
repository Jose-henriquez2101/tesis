import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    // SIEMPRE validar sesión con el backend
    const ok = await authService.checkSession();

    if (ok) {
      return true;
    }
  } catch (error) {
    console.error('Error validando sesión:', error);
  }

  // Si no hay sesión válida, redirigir al login
  return router.parseUrl('/login');
};

