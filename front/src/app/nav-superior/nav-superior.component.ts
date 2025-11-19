import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-superior',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './nav-superior.component.html',
  styleUrls: ['./nav-superior.component.scss']
})
export class NavSuperiorComponent implements OnInit, OnDestroy {
  // ESTAS SON LAS VARIABLES QUE TE FALTAN:
  nombreUsuario: string = '';
  rolUsuario: string = '';
  nombreSistema: string = 'Sistema Capacitación VR Bomberos';
  
  private userSubscription: Subscription | undefined;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.capacitador$.subscribe(capacitador => {
      if (capacitador) {
        this.nombreUsuario = capacitador.NombreCompleto || 
                             capacitador.Nombre || 
                             capacitador.Correo || 
                             'Usuario';
        
        this.rolUsuario = capacitador.Rol || 
                          capacitador.role || 
                          'Capacitador';
      } else {
        this.nombreUsuario = '';
        this.rolUsuario = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}