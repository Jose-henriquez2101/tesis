import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService, BomberoListoEvent } from '../core/socket.service';
import { SesionService, Escenario, PrepararSimulacionPayload } from '../services/sesion.service'; 
import { AuthService } from '../services/auth.service'; // Servicio de autenticación
import { Capacitador } from '../capacitador';
import { Bombero } from '../bombero';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sesiones.component.html',
  styleUrl: './sesiones.component.scss'
})
export class SesionesComponent implements OnInit, OnDestroy {
  // Datos clave del flujo
  capacitador!: Capacitador;
  bomberoEnEspera: Bombero | null = null;
  escenarios: Escenario[] = [];
  escenarioSeleccionadoId: number | null = null;
  
  // ID Único de Unity: Debería obtenerse de la URL/Input para saber a dónde enviar el comando
  // Por ahora, lo dejamos fijo para la prueba, pero debe ser dinámico.
  unityInstanceId: string = 'VR_STATION_001'; 
  
  private bomberoSub!: Subscription;

  constructor(
    private socketService: SocketService,
    private sesionService: SesionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1. Obtener datos del Capacitador
    this.capacitador = this.authService.getCapacitador(); // Asume que retorna el objeto Capacitador
    
    // 2. Obtener lista de escenarios (HTTP REST)
    this.cargarEscenarios();
    
    // 3. Suscribirse al evento WebSocket
    this.bomberoSub = this.socketService.onBomberoListo().subscribe(data => {
      this.bomberoEnEspera = {
        idBombero: data.idBombero,
        nombre: data.nombre,
        rut: data.rut
      };
      // Al recibir un bombero, se selecciona el primer escenario por defecto
      if (this.escenarios.length > 0) {
        this.escenarioSeleccionadoId = this.escenarios[0].id_Escenario;
      }
    });
  }
  // Método actualizado para usar SesionService
  cargarEscenarios(): void {
    this.sesionService.getEscenarios().subscribe( // <--- CAMBIO AQUÍ
      (data: Escenario[]) => {
        this.escenarios = data;
        // ... (selección por defecto)
      },
      error => console.error('Error al cargar escenarios:', error)
    );
  }

  /**
   * Envía los datos de configuración al Backend para que este se lo reenvíe a Unity.
   */
  iniciarSimulacion(): void {
    if (!this.bomberoEnEspera || !this.escenarioSeleccionadoId) {
      alert('Debe haber un bombero y un escenario seleccionado.');
      return;
    }

    const escenarioElegido = this.escenarios.find(e => e.id_Escenario === this.escenarioSeleccionadoId);
    if (!escenarioElegido) return;

    // Petición POST al endpoint '/api/v1/sesiones/preparar-simulacion'
    const payload = {
      idBombero: this.bomberoEnEspera.idBombero,
      // Usamos el ID del Capacitador confirmado
      idCapacitador: this.capacitador.ID_Capacitador, 
      idEscenario: this.escenarioSeleccionadoId,
      nombreEscenario: escenarioElegido.NombreEscenario,
      idInstanciaUnity: this.unityInstanceId // ID de la instancia de Unity
    };

    this.sesionService.prepararSimulacion(payload).subscribe({
      next: (response) => {
        console.log('✅ Preparación enviada al backend:', response);
        alert(`Simulación de ${escenarioElegido.NombreEscenario} enviada a Unity.`);
        // Limpiar para la próxima sesión
        this.bomberoEnEspera = null;
        this.escenarioSeleccionadoId = null;
      },
      error: (err) => {
        console.error('❌ Error al iniciar simulación:', err);
        alert('Error al enviar la configuración de la simulación.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.bomberoSub) {
      this.bomberoSub.unsubscribe();
    }
  }
}
