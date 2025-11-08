import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  private capacitadorSubject = new BehaviorSubject<any>(null);
  
  loggedIn$ = this.loggedInSubject.asObservable();
  capacitador$ = this.capacitadorSubject.asObservable();

  constructor(private router: Router) {
    // Verificar si hay datos guardados al iniciar
    const savedCapacitador = localStorage.getItem('capacitador');
    if (savedCapacitador) {
      this.capacitadorSubject.next(JSON.parse(savedCapacitador));
      this.loggedInSubject.next(true);
    }
  }

  setLoggedInCapacitador(capacitador: any) {
    // Guardar en localStorage y actualizar estado
    localStorage.setItem('capacitador', JSON.stringify(capacitador));
    this.capacitadorSubject.next(capacitador);
    this.loggedInSubject.next(true);
    this.router.navigate(['/dashboard']);
  }

  logout() {
    // Limpiar localStorage y estado
    localStorage.removeItem('capacitador');
    this.capacitadorSubject.next(null);
    this.loggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  getCapacitador() {
    return this.capacitadorSubject.value;
  }
}