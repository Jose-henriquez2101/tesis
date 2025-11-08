import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Dashboard</h2>
      <p>Bienvenido al Sistema VR de Entrenamiento para Bomberos</p>
      
      <div class="row mt-4">
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Sesiones</h5>
              <p class="card-text">Gestiona las sesiones de entrenamiento</p>
              <a [routerLink]="['/sesiones']" class="btn btn-primary">Ver Sesiones</a>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Escenarios</h5>
              <p class="card-text">Administra los escenarios disponibles</p>
              <a [routerLink]="['/escenarios']" class="btn btn-primary">Ver Escenarios</a>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Bomberos</h5>
              <p class="card-text">Gestiona el registro de bomberos</p>
              <a [routerLink]="['/bomberos']" class="btn btn-primary">Ver Bomberos</a>
            </div>
          </div>
        </div>
      </div>

     
  `,
  styles: [`
    .card {
      transition: transform 0.2s;
      border: 1px solid #e9ecef;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .card-title {
      color: #2c3e50;
      margin-bottom: 0.75rem;
    }
    .card-text {
      color: #6c757d;
      margin-bottom: 1rem;
    }
    .btn {
      border-radius: 6px;
      font-weight: 500;
    }
  `]
})
export class DashboardComponent {}