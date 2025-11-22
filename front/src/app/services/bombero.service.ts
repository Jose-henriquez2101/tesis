import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Definición de la interfaz del modelo
export interface Bombero {
  ID_Bombero: number;
  Rut: string;
  NombreCompleto: string;
  // Propiedades actualizadas para aceptar 'null' o 'undefined'
  Foto?: string | null; 
  FechaNacimiento?: string | null; // Acepta string, undefined (opcional), o null
  FechaDeIncorporacion?: string | null; // Acepta string, undefined (opcional), o null
}

@Injectable({
  providedIn: 'root'
})
export class BomberoService {
  // Cambia esta URL según donde corra tu backend
  private apiUrl = 'http://localhost:3000/api/v1/bomberos'; 

  constructor(private http: HttpClient) {}

  /**
   * Manejador de errores centralizado para peticiones HTTP.
   * Transforma el error HTTP en un objeto Error simple para el componente.
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Error desconocido en el servicio.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El backend retornó un código de respuesta fallido (ej. 404, 500)
      errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
    }
    console.error('Error en BomberoService:', error);
    // Devuelve un error que será capturado por el componente
    return throwError(() => new Error(errorMessage));
  }

  // [R] Obtener todos los bomberos
  getBomberos(): Observable<Bombero[]> {
    return this.http.get<Bombero[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  // [C] Crear un nuevo bombero
  createBombero(data: Partial<Bombero>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  // [U] Actualizar un bombero
  updateBombero(id: number, data: Partial<Bombero>): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  // [D] Eliminar un bombero
  deleteBombero(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  // [U] Subir foto
  uploadFoto(bomberoId: number, formData: FormData): Observable<any> {
    // La ruta debe coincidir con la que definiste en Node.js: /api/v1/bomberos/:bomberoId/foto
    const url = `${this.apiUrl}/${bomberoId}/foto`;
    
    // Es CRUCIAL añadir el catchError aquí también
    return this.http.put(url, formData)
      .pipe(
        catchError(this.handleError)
      );
  }
}