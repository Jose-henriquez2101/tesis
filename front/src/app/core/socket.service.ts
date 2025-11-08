import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

// Define las interfaces para los datos que esperamos
export interface BomberoListoEvent {
  idBombero: number;
  nombre: string;
  rut: string;
}

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
      console.log('Conectado al servidor de WebSockets.');
      // Aquí podrías enviar cualquier token de autenticación si lo tuvieras
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor de WebSockets.');
    });
  }

  /**
   * Expone el evento 'bombero-listo' como un Observable para que el componente lo escuche.
   */
  public onBomberoListo(): Observable<BomberoListoEvent> {
    return new Observable(observer => {
      // El backend emite 'bombero-listo'
      this.socket.on('bombero-listo', (message: { evento: string, data: BomberoListoEvent }) => {
        console.log('Evento Bombero Listo recibido:', message.data);
        observer.next(message.data);
      });
      // Limpieza al desuscribirse
      return () => {
        this.socket.off('bombero-listo');
      };
    });
  }
}