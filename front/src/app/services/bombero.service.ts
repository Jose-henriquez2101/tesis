import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Bombero {
  ID_Bombero: number;
  Rut: string;
  NombreCompleto: string;
}

@Injectable({
  providedIn: 'root'
})
export class BomberoService {
  // Cambia esta URL según donde corra tu backend
  private apiUrl = 'http://localhost:3000/api/v1/bomberos';

  constructor(private http: HttpClient) {}

  getBomberos(): Observable<Bombero[]> {
    return this.http.get<Bombero[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  createBombero(bombero: Partial<Bombero>): Observable<any> {
    return this.http.post<any>(this.apiUrl, bombero).pipe(
      catchError(this.handleError)
    );
  }

  updateBombero(id: number, bombero: Partial<Bombero>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, bombero).pipe(
      catchError(this.handleError)
    );
  }

  deleteBombero(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en BomberoService:', error);
    
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}