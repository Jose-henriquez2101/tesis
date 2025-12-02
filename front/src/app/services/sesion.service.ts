import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Interfaces Necesarias ---
export interface Escenario {
  id_Escenario: number;
  NombreEscenario: string;
  DescripcionEscenario?: string;
}

export interface PrepararSimulacionPayload {
  idBombero: number;
  idCapacitador: number;
  idEscenario: number;
  nombreEscenario: string;
  idInstanciaUnity: string;
}

@Injectable({
  // 'root' hace que esté disponible en toda la aplicación (singleton)
  providedIn: 'root' 
})
export class SesionService {
  private apiUrl = 'http://pacheco.chillan.ubiobio.cl:8020/api/v1'; // Base de la API

  constructor(private http: HttpClient) { }

  /**
   * 1. Obtiene la lista de escenarios disponibles (GET /api/v1/escenarios)
   */
  getEscenarios(): Observable<Escenario[]> {
    return this.http.get<Escenario[]>(`${this.apiUrl}/escenarios`);
  }

  /**
   * 2. Envía la configuración de la sesión al backend para que inicie la simulación en Unity.
   * (POST /api/v1/sesiones/preparar-simulacion)
   */
  prepararSimulacion(payload: PrepararSimulacionPayload): Observable<any> {
    // Usamos el endpoint que configuramos en el backend:
    return this.http.post(`${this.apiUrl}/sesiones/preparar-simulacion`, payload);
  }

  /**
   * 3. Obtener todas las sesiones registradas (GET /api/v1/sesiones)
   */
  getSesiones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sesiones`);
  }

  /**
   * 4. Obtener sesiones de un bombero específico (GET /api/v1/sesiones/bomberos/:id)
   */
  getSesionesPorBombero(idBombero: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sesiones/bomberos/${idBombero}`);
  }

  // Eliminados métodos de audio del front; Unity gestionará subida y reproducción.
}