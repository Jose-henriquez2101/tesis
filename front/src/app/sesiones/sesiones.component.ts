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
  // Opción para grabar audio cuando se inicie la simulación
  grabarAudio: boolean = false;
  // Listado de sesiones pasadas
  sesiones: any[] = [];
  selectedSesion: any = null;
  // URL creado para reproducir el blob audio
  audioUrl: string | null = null;
  // Archivo audio seleccionado para subir (testing desde la UI)
  audioFileToUpload: File | null = null;

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
    this.cargarSesiones();
    
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

  cargarSesiones(): void {
    this.loading = true;
    this.sesionService.getSesiones().subscribe({
      next: (data: any[]) => {
        this.sesiones = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cargar sesiones:', err);
      }
    });
  }

  getAudioUrl(relativePath?: string | null): string {
    if (!relativePath) return '';
    // Ajusta la base según tu backend
    const API_BASE = 'http://pacheco.chillan.ubiobio.cl:8020';
    // Si la ruta ya comienza con '/', no añadir otra
    return `${API_BASE}/${relativePath.replace(/^\//, '')}`;
  }

  onAudioFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      this.audioFileToUpload = files.item(0);
    }
  }

  uploadAudioForSelectedSesion(): void {
    if (!this.selectedSesion) {
      this.errorMsg = 'Selecciona una sesión primero.';
      return;
    }
    if (!this.audioFileToUpload) {
      this.errorMsg = 'Selecciona un archivo de audio para subir.';
      return;
    }

    const formData = new FormData();
    formData.append('audio', this.audioFileToUpload, this.audioFileToUpload.name);

    this.loading = true;
    const sub = this.sesionService.uploadAudio(this.selectedSesion.ID_Sesion || this.selectedSesion.id, formData).subscribe({
      next: (resp: any) => {
        this.loading = false;
        this.successMsg = resp?.message || 'Audio subido con éxito.';
        // Actualizar la sesión en la UI
        if (resp?.sesion) {
          // Reemplazar objeto en array
          const idx = this.sesiones.findIndex(s => (s.ID_Sesion || s.id) === (resp.sesion.ID_Sesion || resp.sesion.id));
          if (idx >= 0) this.sesiones[idx] = resp.sesion;
          this.selectedSesion = resp.sesion;
            // si backend devolvió sesion actualizada, limpiamos cached audioUrl
            if (this.audioUrl) {
              URL.revokeObjectURL(this.audioUrl);
              this.audioUrl = null;
            }
        }
        this.audioFileToUpload = null;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error subiendo audio:', err);
        this.errorMsg = err.error?.message || err.message || 'Error al subir el audio.';
      }
    });

    this.subscriptions.add(sub);
  }

  /** Cargar y reproducir audio de la sesión desde el backend (blob) */
  loadAndPlayAudio(sesion: any) {
    const id = sesion.ID_Sesion || sesion.id;
    if (!id) return;

    this.loading = true;
    const sub = this.sesionService.getAudio(id).subscribe({
      next: (blob: Blob) => {
        this.loading = false;
        if (this.audioUrl) {
          URL.revokeObjectURL(this.audioUrl);
          this.audioUrl = null;
        }
        this.audioUrl = URL.createObjectURL(blob);
        // Assign the audio src by selecting the audio element in DOM if needed
        setTimeout(() => {
          const audioEl: HTMLAudioElement | null = document.querySelector('audio#audioPlayer');
          if (audioEl) {
            audioEl.src = this.audioUrl as string;
            audioEl.load();
            audioEl.play().catch(()=>{});
          }
        }, 50);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error obteniendo audio:', err);
        this.errorMsg = err.error?.message || 'Error al obtener audio.';
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

    // Enviar la preparación al backend vía HTTP: el backend guardará la sesión y reenviará el evento a Unity
    const payload = {
      idBombero: bomberoElegido.ID_Bombero,
      idCapacitador: this.capacitadorId,
      idEscenario: this.escenarioSeleccionadoId,
      nombreEscenario: escenarioElegido.NombreEscenario,
      idInstanciaUnity: this.pendingStationId,
      grabar: !!this.grabarAudio
    } as any; // backend acepta el flag 'grabar'

    const sub = this.sesionService.prepararSimulacion(payload).subscribe({
      next: (resp: any) => {
        this.loading = false;
        this.successMsg = resp?.message || `Comando enviado a ${this.pendingStationId}: Iniciar ${escenarioElegido.NombreEscenario} con ${bomberoElegido.NombreCompleto}.`;
        // Si el backend creó la sesión, la podemos añadir localmente al listado
        if (resp?.sesion) {
          this.sesiones.unshift(resp.sesion);
        }

        // Limpiar estado de espera para la próxima sesión
        this.pendingStationId = null;
        this.bomberoSeleccionadoId = null;
        this.escenarioSeleccionadoId = this.escenarios.length > 0 ? this.escenarios[0].id_Escenario : null;
      },
      error: (err) => {
        console.error('Error preparando simulación:', err);
        this.loading = false;
        this.errorMsg = err.error?.message || err.message || 'Error al preparar la simulación.';
      }
    });

    this.subscriptions.add(sub);
  }
}