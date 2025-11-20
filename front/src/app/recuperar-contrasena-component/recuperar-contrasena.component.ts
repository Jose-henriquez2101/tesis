import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar-contrasena.component.html',
  styleUrls: ['./recuperar-contrasena.component.scss']
})
export class RecuperarContrasenaComponent {
  correo: string = '';
  mensaje: string = '';
  mensajeTipo: 'success' | 'error' | '' = '';
  enviando: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.correo || !this.validarEmail(this.correo)) {
      this.mostrarMensaje('Por favor ingresa un correo electrónico válido', 'error');
      return;
    }

    this.enviando = true;
    this.mensaje = '';

    this.http.post('http://localhost:3000/api/v1/capacitadores/recuperar-contrasena', {
      Correo: this.correo
    }).subscribe({
      next: (response: any) => {
        this.mostrarMensaje(
          'Si el correo está registrado, recibirás un enlace de recuperación en tu bandeja de entrada.',
          'success'
        );
        this.correo = '';
        this.enviando = false;

        // Redirigir al login después de 5 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
      },
      error: (error) => {
        console.error('Error al solicitar recuperación:', error);
        this.mostrarMensaje(
          'Hubo un error al procesar tu solicitud. Por favor intenta nuevamente.',
          'error'
        );
        this.enviando = false;
      }
    });
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = texto;
    this.mensajeTipo = tipo;
  }
}
