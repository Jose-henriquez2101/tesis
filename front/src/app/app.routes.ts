import { inject } from '@angular/core';
import { Router, Route, CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';

// Guard para proteger rutas (typed)
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
}

export const routes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./login-capacitador/login-capacitador').then(m => m.LoginCapacitador)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'escenarios',
    loadComponent: () => import('./escenario/escenario.component').then(m => m.EscenarioComponent),
    canActivate: [authGuard]
  },
  {
    path: 'sesiones',
    loadComponent: () => import('./sesiones/sesiones.component').then(m => m.SesionesComponent),
    canActivate: [authGuard]
  },
  // Rutas auxiliares pendientes de implementar como módulos/components
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
