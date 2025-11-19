import { Component, OnInit } from '@angular/core'; // Se eliminó OnDestroy ya que no se usa
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
// 1. Importamos el modelo como solicitaste
import { Capacitador } from '../capacitador';

@Component({
  selector: 'app-nav-superior',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './nav-superior.component.html',
  styleUrls: ['./nav-superior.component.scss']
})
export class NavSuperiorComponent implements OnInit {
  nombreUsuario: string = '';
  rolUsuario: string = '';
  nombreSistema: string = 'Sistema Capacitación VR Bomberos';
  
  // 2. Variable para almacenar el objeto del modelo
  capacitador: Capacitador | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.capacitador$.subscribe(cap => {
      this.capacitador = cap;

      if (cap) {
        const c: any = cap;
        this.nombreUsuario = c.Nombre || c.nombre || 'Usuario';
        this.rolUsuario = c.Rol || 'Capacitador';
      } else {
        this.nombreUsuario = '';
        this.rolUsuario = '';
      }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}