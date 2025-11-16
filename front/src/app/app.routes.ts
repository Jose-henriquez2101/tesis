import { Route } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login-capacitador/login-capacitador')
        .then(m => m.LoginCapacitadorComponent),
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },

  {
    path: 'escenarios',
    loadComponent: () =>
      import('./escenario/escenario.component')
        .then(m => m.EscenarioComponent),
    canActivate: [authGuard],
  },

  {
    path: 'sesiones',
    loadComponent: () =>
      import('./sesiones/sesiones.component')
        .then(m => m.SesionesComponent),
    canActivate: [authGuard],
  },

  {
    path: 'bomberos',
    loadComponent: () =>
      import('./bombero/bombero.component')
        .then(m => m.BomberoComponent),
    canActivate: [authGuard],
  },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
