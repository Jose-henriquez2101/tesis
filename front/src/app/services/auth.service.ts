import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedInSubject = new BehaviorSubject<boolean>(false);
  private capacitadorSubject = new BehaviorSubject<any>(null);
  private sessionCheckPromise: Promise<boolean>;

  loggedIn$ = this.loggedInSubject.asObservable();
  capacitador$ = this.capacitadorSubject.asObservable();

  private apiUrl = '/api/v1/capacitadores';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Iniciar validación de sesión al arrancar la app
    this.sessionCheckPromise = this.checkSession();
  }

  checkSession() {
    return this.http
      .get(`${this.apiUrl}/me`, { withCredentials: true })
      .toPromise()
      .then((cap: any) => {
        this.capacitadorSubject.next(cap);
        this.loggedInSubject.next(true);
        return true;
      })
      .catch(() => {
        // No hay sesión válida (cookie expirada o no existe)
        this.capacitadorSubject.next(null);
        this.loggedInSubject.next(false);
        return false;
      });
  }

  // Método para que el guard espere a que se valide la sesión
  async isSessionValidated(): Promise<boolean> {
    return this.sessionCheckPromise;
  }

  login(data: { Correo: string; Contrasena: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, data, {
      withCredentials: true
    }).pipe(
      tap((res) => {
        // Guardar en memoria (BehaviorSubject) únicamente.
        // La cookie HttpOnly se maneja automáticamente por el navegador.
        this.capacitadorSubject.next(res.capacitador);
        this.loggedInSubject.next(true);
        // Actualizar el promise de validación de sesión para que el guard sea consciente
        this.sessionCheckPromise = Promise.resolve(true);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe(() => {
        // Limpiar estado en memoria.
        // La cookie se borra en el servidor (clearCookie).
        this.capacitadorSubject.next(null);
        this.loggedInSubject.next(false);
        // Resetear el promise para que el guard sepa que no hay sesión
        this.sessionCheckPromise = Promise.resolve(false);
        this.router.navigate(['/login']);
      });
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  getCapacitador() {
    return this.capacitadorSubject.value;
  }
}
