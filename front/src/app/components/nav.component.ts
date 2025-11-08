import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <nav class="navbar navbar-expand navbar-dark bg-primary" *ngIf="authService.isLoggedIn()">
      <a class="navbar-brand" href="#">
        <span class="ms-2">Sistema VR Bomberos</span>
      </a>
    </nav>

    <nav class="navbar navbar-expand-sm bg-light" *ngIf="authService.isLoggedIn()">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a [routerLink]="['/dashboard']" class="nav-link" routerLinkActive="active">Dashboard</a>
        </li>
        <li class="nav-item">
          <a [routerLink]="['/sesiones']" class="nav-link" routerLinkActive="active">Sesiones</a>
        </li>
        <li class="nav-item">
          <a [routerLink]="['/escenarios']" class="nav-link" routerLinkActive="active">Escenarios</a>
        </li>
        <li class="nav-item">
          <a [routerLink]="['/bomberos']" class="nav-link" routerLinkActive="active">Bomberos</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" (click)="authService.logout()" style="cursor: pointer;">Cerrar Sesión</a>
        </li>
      </ul>
    </nav>
  `,
  styles: [`
    .navbar-dark .navbar-brand {
      color: white;
    }
    .active {
      font-weight: bold;
    }
    .nav-link:hover {
      color: #0056b3;
    }
  `]
})
export class NavComponent {
  constructor(public authService: AuthService) {}
}