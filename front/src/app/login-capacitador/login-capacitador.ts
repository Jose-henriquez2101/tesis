import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login-capacitador',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './login-capacitador.html',
  styleUrl: './login-capacitador.scss'
})
export class LoginCapacitador {
  loginForm: FormGroup;
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.loginForm = this.fb.group({
      Correo: ['', [Validators.required, Validators.email]],
      Contrasena: ['', [Validators.required]]
    });
  }

  onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';
    if (this.loginForm.invalid) {
      this.errorMsg = 'Por favor, completa todos los campos correctamente.';
      return;
    }
    this.loading = true;
    const loginData = this.loginForm.value;
  // Ajustado para usar la ruta del backend: /api/v1/capacitadores/login
  this.http.post<any>('/api/v1/capacitadores/login', loginData).subscribe({
      next: (res: any) => {
        this.successMsg = 'Login exitoso.';
        this.loading = false;
        // Aquí podrías redirigir o guardar token
      },
      error: (err: any) => {
        this.errorMsg = err.error?.message || 'Error en el login.';
        this.loading = false;
      }
    });
  }
}
