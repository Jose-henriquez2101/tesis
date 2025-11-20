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
    path: 'recuperar-contrasena',
    loadComponent: () =>
      import('./recuperar-contrasena-component/recuperar-contrasena.component')
        .then(m => m.RecuperarContrasenaComponent),
  },

  {
    path: 'restablecer-contrasena',
    loadComponent: () =>
      import('./restablecer-contrasena-component/restablecer-contrasena.component')
        .then(m => m.RestablecerContrasenaComponent),
  },

  {
    path: 'Inicio',
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

  { path: '', redirectTo: '/Inicio', pathMatch: 'full' },
  { path: '**', redirectTo: '/Inicio' },

];
