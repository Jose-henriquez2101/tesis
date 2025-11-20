import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-restablecer-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './restablecer-contrasena.component.html',
  styleUrls: ['./restablecer-contrasena.component.scss']
})
export class RestablecerContrasenaComponent implements OnInit {
  token: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  mensaje: string = '';
  mensajeTipo: 'success' | 'error' | '' = '';
  procesando: boolean = false;
  mostrarContrasena: boolean = false;
  mostrarConfirmacion: boolean = false;
  tokenValido: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtener el token de los query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.mostrarMensaje('Token inválido o faltante', 'error');
      } else {
        this.tokenValido = true;
      }
    });
  }

  onSubmit() {
    // Validaciones
    if (!this.nuevaContrasena || !this.confirmarContrasena) {
      this.mostrarMensaje('Por favor completa todos los campos', 'error');
      return;
    }

    if (this.nuevaContrasena.length < 6) {
      this.mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.mostrarMensaje('Las contraseñas no coinciden', 'error');
      return;
    }

    this.procesando = true;
    this.mensaje = '';

    this.http.post('http://localhost:3000/api/v1/capacitadores/restablecer-contrasena', {
      token: this.token,
      nuevaContrasena: this.nuevaContrasena
    }).subscribe({
      next: (response: any) => {
        this.mostrarMensaje(
          'Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...',
          'success'
        );
        this.nuevaContrasena = '';
        this.confirmarContrasena = '';
        this.procesando = false;

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        console.error('Error al restablecer contraseña:', error);
        const mensajeError = error.error?.message || 
          'Hubo un error al restablecer tu contraseña. El token puede estar expirado o ser inválido.';
        this.mostrarMensaje(mensajeError, 'error');
        this.procesando = false;
      }
    });
  }

  toggleMostrarContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  toggleMostrarConfirmacion() {
    this.mostrarConfirmacion = !this.mostrarConfirmacion;
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = texto;
    this.mensajeTipo = tipo;
  }

  getStrengthClass(): string {
    if (this.nuevaContrasena.length === 0) return '';
    if (this.nuevaContrasena.length < 6) return 'weak';
    if (this.nuevaContrasena.length < 10) return 'medium';
    return 'strong';
  }

  getStrengthText(): string {
    if (this.nuevaContrasena.length === 0) return '';
    if (this.nuevaContrasena.length < 6) return 'Débil';
    if (this.nuevaContrasena.length < 10) return 'Media';
    return 'Fuerte';
  }
}
