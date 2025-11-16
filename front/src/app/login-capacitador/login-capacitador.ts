import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-capacitador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-capacitador.html',
  styleUrls: ['./login-capacitador.scss']
})
export class LoginCapacitadorComponent {

  loginForm: FormGroup;
  errorMessage: string = "";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      Correo: ['', [Validators.required, Validators.email]],
      Contrasena: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = "Completa todos los campos correctamente.";
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        // El AuthService ya hace navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Credenciales inválidas.";
      }
    });
  }
}
