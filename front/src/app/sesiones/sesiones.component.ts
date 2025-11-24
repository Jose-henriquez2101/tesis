import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '../core/socket.service';
import { SesionService, Escenario, PrepararSimulacionPayload } from '../services/sesion.service'; 
import { AuthService } from '../services/auth.service'; // Servicio de autenticación
import { BomberoService, Bombero } from '../services/bombero.service'; // Importar servicio de Bombero
import { Capacitador } from '../capacitador';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';

// Interfaz para la data recibida de Unity
interface UnityReadyPayload {
  stationId: string; // El ID de la estación VR que está pidiendo la sesión
}

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sesiones.component.html',
  styleUrls: ['./sesiones.component.scss'], // Corregido: usa styleUrls
})
export class SesionesComponent implements OnInit, OnDestroy {
  
  // --- ESTADO DE LA SESIÓN ---
  capacitador!: Capacitador;
  
  // ID de la estación Unity que está esperando que se le asigne un escenario
  pendingStationId: string | null = null; 
  // ID del bombero seleccionado por el capacitador (desde la lista)
  bomberoSeleccionadoId: number | null = null;
  
  // --- DATOS DE REFERENCIA ---
  bomberosDisponibles: Bombero[] = [];
  escenarios: Escenario[] = [];
  escenarioSeleccionadoId: number | null = null;

  // Mensajes de estado (Opcional)
  loading = false;
  errorMsg = '';
  successMsg = '';
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private socketService: SocketService,
    private sesionService: SesionService,
    private authService: AuthService,
    private bomberoService: BomberoService // Inyectar el servicio de Bombero
  ) {}

  // Normalizadores para mostrar campos del capacitador
  get capacitadorNombre(): string {
    return this.capacitador?.Nombre || this.capacitador?.nombre || 'Desconocido';
  }

  get capacitadorId(): number | null {
    return this.capacitador?.ID_Capacitador || this.capacitador?.id || this.capacitador?.ID || null;
  }

  ngOnInit(): void {
    // 1. Obtener datos del Capacitador (Asume que está logueado)
    this.capacitador = this.authService.getCapacitador(); 
    
    // 2. Obtener lista de escenarios y bomberos (HTTP REST)
    this.cargarEscenarios();
    this.cargarBomberos();
    
    // 3. Suscribirse al nuevo evento WebSocket: 'select-bombero'
    this.listenForUnityReady();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  // --- MÉTODOS DE CARGA DE DATOS ---

  cargarBomberos(): void {
    this.bomberoService.getBomberos().subscribe({
      next: (data: Bombero[]) => {
        this.bomberosDisponibles = data;
      },
      error: (err) => {
        this.errorMsg = 'Error al cargar la lista de bomberos.';
        console.error('Error al cargar bomberos:', err);
      }
    });
  }

  cargarEscenarios(): void {
    this.loading = true;
    const sub = this.sesionService.getEscenarios().subscribe({
      next: (data: Escenario[]) => {
        this.escenarios = data;
        this.loading = false;
        // Selecciona el primer escenario por defecto
        if (this.escenarios.length > 0) {
          this.escenarioSeleccionadoId = this.escenarios[0].id_Escenario;
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = 'Error al cargar los escenarios.';
        console.error('Error al cargar escenarios:', err);
      }
    });
    this.subscriptions.add(sub);
  }
  
  // --- LÓGICA DE WEBSOCKETS ---

  listenForUnityReady(): void {
    const sub = this.socketService.on('select-bombero').subscribe({
      next: (data: UnityReadyPayload) => {
        // La estación Unity ha enviado 'unity-ready'.
        this.pendingStationId = data.stationId;
        this.bomberoSeleccionadoId = null; // Reiniciar selección de bombero
        this.successMsg = `Estación VR ${data.stationId} lista para asignar sesión.`;
        console.log('Petición de sesión recibida de:', data.stationId);
      },
      error: (err:any) => {
        this.errorMsg = 'Error en la conexión WebSocket.';
        console.error('Error WS:', err);
      }
    });
    this.subscriptions.add(sub);
  }

  /**
   * Envía los datos de configuración al Backend, y este se lo reenvía a Unity.
   */
  iniciarSimulacion(): void {
    if (!this.pendingStationId) {
      alert('Error: No hay una estación VR en espera.');
      return;
    }
    if (!this.bomberoSeleccionadoId || !this.escenarioSeleccionadoId) {
      alert('Debe seleccionar un Bombero y un Escenario.');
      return;
    }
    if (!this.capacitadorId) {
      alert('Error: No se pudo obtener el ID del Capacitador logueado.');
      return;
    }
    
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const escenarioElegido = this.escenarios.find(e => e.id_Escenario === this.escenarioSeleccionadoId);
    const bomberoElegido = this.bomberosDisponibles.find(b => b.ID_Bombero === this.bomberoSeleccionadoId);
    if (!escenarioElegido || !bomberoElegido) {
        this.loading = false;
        this.errorMsg = 'Error: Selección de Bombero o Escenario inválida.';
        return;
    }

    // El payload que enviamos a Node.js (por SOCKETS)
    const payload = {
      idBombero: bomberoElegido.ID_Bombero,
      idCapacitador: this.capacitadorId,
      idEscenario: this.escenarioSeleccionadoId,
      nombreEscenario: escenarioElegido.NombreEscenario,
      stationId: this.pendingStationId 
    };

    // Enviar el evento 'start-vr-session' al backend para que este lo reenvíe a Unity
    this.socketService.emit('start-vr-session', payload);

    this.loading = false;
    this.successMsg = `Comando enviado a ${this.pendingStationId}: Iniciar ${escenarioElegido.NombreEscenario} con ${bomberoElegido.NombreCompleto}.`;

    // Limpiar estado de espera para la próxima sesión
    this.pendingStationId = null;
    this.bomberoSeleccionadoId = null;
    this.escenarioSeleccionadoId = this.escenarios.length > 0 ? this.escenarios[0].id_Escenario : null;
  }
}