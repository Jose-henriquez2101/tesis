import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  // URL de tu servidor Node.js (donde está corriendo Socket.io)
  private readonly URL = 'http://localhost:3000'; 

  constructor() {
    // Conexión al servidor al inicializar el servicio
    this.socket = io(this.URL);
    
    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor de WebSockets.');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Desconectado del servidor de WebSockets.');
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WS:', error.message);
    });
  }

  /**
   * Método genérico para escuchar cualquier evento del servidor.
   * Usado en SesionesComponent para escuchar 'select-bombero'.
   * @param eventName Nombre del evento (ej: 'select-bombero')
   * @returns Un Observable con los datos del evento.
   */
  public on(eventName: string): Observable<any> {
    return new Observable(observer => {
      // Manejador de eventos
      const listener = (data: any) => {
        observer.next(data);
      };
      
      this.socket.on(eventName, listener);

      // Limpieza al desuscribirse
      return () => {
        this.socket.off(eventName, listener);
      };
    });
  }

  /**
   * Método genérico para enviar (emitir) cualquier evento al servidor.
   * Usado en SesionesComponent para enviar 'start-vr-session'.
   * @param eventName Nombre del evento (ej: 'start-vr-session')
   * @param data Datos a enviar
   */
  public emit(eventName: string, data: any): void {
    console.log(`📡 Emitiendo evento '${eventName}' con datos:`, data);
    this.socket.emit(eventName, data);
  }
}