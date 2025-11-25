import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BomberoService, Bombero } from '../services/bombero.service';

@Component({
  selector: 'app-bombero',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  providers: [BomberoService],
  templateUrl: './bombero.component.html',
  styleUrl: './bombero.component.scss'
})
export class BomberoComponent implements OnInit, OnDestroy {
  bomberos: Bombero[] = [];
  loading = false;
  errorMsg = '';
  successMsg = '';
  showForm = false;
  editingBombero: Bombero | null = null;
  
  private subscriptions: Subscription = new Subscription();
  
  // Modelo para el formulario
  bomberoModel = {
    Rut: '',
    NombreCompleto: '',
    FechaNacimiento: '', 
    FechaDeIncorporacion: ''
  };
  // Variables para el modal de confirmación
  showConfirmModal = false;
  bomberoAEliminarId: number | null = null;
  bomberoAEliminarNombre: string = ''; // Para mostrar el nombre en el modal

  // URL base para acceder a la API de Node.js (Asegúrate que coincida)
  private readonly API_BASE_URL = 'http://pacheco.chillan.ubiobio.cl:8020'; 
  fileToUpload: File | null = null; // Para la foto

  constructor(private bomberoService: BomberoService) {}

  ngOnInit(): void {
    this.loadBomberos();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadBomberos(): void {
    this.loading = true;
    this.errorMsg = '';
    
    const sub = this.bomberoService.getBomberos().subscribe({
      next: (data) => {
        console.log('Bomberos cargados:', data);
        this.bomberos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando bomberos:', error);
        this.errorMsg = error.message || 'Error al cargar los bomberos';
        this.loading = false;
      }
    });
    
    this.subscriptions.add(sub);
  }

  crearBombero(): void {
    this.editingBombero = null;
    this.bomberoModel = {
      Rut: '',
      NombreCompleto: '',
      FechaNacimiento: '', 
      FechaDeIncorporacion: ''
    };
    this.fileToUpload = null;
    this.showForm = true;
    this.clearMessages();
  }

  editarBombero(bombero: Bombero): void {
    this.editingBombero = bombero;
    // Usar los campos de fecha del objeto 'bombero' si existen
    this.bomberoModel = {
      Rut: bombero.Rut,
      NombreCompleto: bombero.NombreCompleto,
      // Los inputs de tipo 'date' en HTML esperan 'YYYY-MM-DD'
      FechaNacimiento: bombero.FechaNacimiento || '', 
      FechaDeIncorporacion: bombero.FechaDeIncorporacion || ''
    };
    this.fileToUpload = null;
    this.showForm = true;
    this.clearMessages();
  }

  guardarBombero(): void {
    // Validaciones básicas
    if (!this.bomberoModel.Rut || !this.bomberoModel.NombreCompleto) {
      this.errorMsg = 'RUT y Nombre Completo son obligatorios';
      return;
    }

    const rutLimpio = this.limpiarRut(this.bomberoModel.Rut);
    if (!this.validarRut(rutLimpio)) {
      this.errorMsg = 'El RUT debe tener entre 8 y 10 caracteres';
      return;
    }

    this.loading = true;
    this.clearMessages();

    // Incluir los nuevos campos de fecha en el payload
    const bomberoData = {
      Rut: rutLimpio,
      NombreCompleto: this.bomberoModel.NombreCompleto.trim(),
      FechaNacimiento: this.bomberoModel.FechaNacimiento || null, // Envía null si está vacío
      FechaDeIncorporacion: this.bomberoModel.FechaDeIncorporacion || null
    };

    console.log('Enviando datos:', bomberoData);

    let request;
    if (this.editingBombero) {
      // El ID debe existir para actualizar
      request = this.bomberoService.updateBombero(this.editingBombero.ID_Bombero, bomberoData);
    } else {
      request = this.bomberoService.createBombero(bomberoData);
    }

    const sub = request.subscribe({
      next: (response) => {
        console.log('Operación exitosa:', response);
        this.successMsg = response?.message || (this.editingBombero ? 'Bombero actualizado con éxito' : 'Bombero creado con éxito');
        this.loadBomberos();
        this.cancelarEdicion();
      },
      error: (error) => {
        // Mostrar el error HTTP específico
        console.error('Error en operación:', error);
        const errorMessage = error.error?.message || error.message || 'Error desconocido';
        this.errorMsg = this.editingBombero ? `Error al actualizar bombero: ${errorMessage}` : `Error al crear bombero: ${errorMessage}`;
        this.loading = false;
      }
    });

    this.subscriptions.add(sub);
  }

  /**
   * Muestra el modal de confirmación antes de eliminar.
   */
  eliminarBombero(bombero: Bombero): void {
    this.bomberoAEliminarId = bombero.ID_Bombero;
    this.bomberoAEliminarNombre = bombero.NombreCompleto;
    this.showConfirmModal = true;
    this.clearMessages();
  }
  
  /**
   * Ejecuta la eliminación real después de la confirmación del usuario.
   */
  confirmarEliminar(): void {
    if (this.bomberoAEliminarId === null) {
      this.errorMsg = 'Error interno: No se ha seleccionado un bombero para eliminar.';
      this.showConfirmModal = false;
      return;
    }

    this.loading = true;
    this.showConfirmModal = false; // Oculta el modal

    const id = this.bomberoAEliminarId;
    this.bomberoAEliminarId = null; // Resetea el ID

    const sub = this.bomberoService.deleteBombero(id).subscribe({
      next: () => {
        this.successMsg = 'Bombero eliminado con éxito';
        this.loadBomberos();
      },
      error: (error) => {
        console.error('Error eliminando bombero:', error);
        this.errorMsg = error.message || 'Error al eliminar bombero';
        this.loading = false;
      }
    });

    this.subscriptions.add(sub);
  }

  cancelarConfirmacion(): void {
    this.showConfirmModal = false;
    this.bomberoAEliminarId = null;
    this.bomberoAEliminarNombre = '';
  }
  
  cancelarEdicion(): void {
    this.showForm = false;
    this.editingBombero = null;
    this.bomberoModel = {
      Rut: '',
      NombreCompleto: '',
      FechaNacimiento: '',
      FechaDeIncorporacion: ''
    };
    this.fileToUpload = null;
    this.loading = false;
    this.clearMessages();
  }
  
  // --- MÉTODOS DE FOTO ---

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      const file = files.item(0);
      if (file && file.size > 5 * 1024 * 1024) { // Límite de 5MB
        this.errorMsg = 'El archivo es demasiado grande. Máximo 5MB.';
        this.fileToUpload = null;
        (event.target as HTMLInputElement).value = ''; // Limpia el input file
        return;
      }
      this.fileToUpload = file;
      this.clearMessages();
    }
  }

  subirFoto(): void {
    if (!this.fileToUpload || !this.editingBombero) {
      this.errorMsg = 'Selecciona una foto y asegúrate de estar editando un bombero.';
      return;
    }

    this.loading = true;
    this.clearMessages();

    const formData = new FormData();
    formData.append('foto', this.fileToUpload, this.fileToUpload.name);

    const sub = this.bomberoService.uploadFoto(this.editingBombero.ID_Bombero, formData).subscribe({
      next: (response) => {
        console.log('Foto subida con éxito:', response);
        this.successMsg = 'Foto de perfil actualizada con éxito.';
        this.fileToUpload = null; // Limpiar el archivo
        this.loadBomberos(); // Recargar la lista para mostrar la nueva foto
      },
      error: (error) => {
        console.error('Error subiendo foto:', error);
        this.errorMsg = error.error?.message || 'Error al subir la foto.';
        this.loading = false;
      }
    });

    this.subscriptions.add(sub);
  }

  /**
   * Obtiene la URL completa de la foto.
   * Acepta string, null, o undefined (ya que la interfaz lo permite).
   */
  getFotoUrl(relativePath?: string | null): string {
    if (relativePath) { // Chequea si es string, ignorando null y undefined
      return `${this.API_BASE_URL}/${relativePath}`;
    }
    // Ruta temporal de placeholder 
    return 'https://placehold.co/60x60/3498db/ffffff?text=F'; 
  }


  private clearMessages(): void {
    this.errorMsg = '';
    this.successMsg = '';
  }

  private limpiarRut(rut: string): string {
    return rut.replace(/[\.\-\s]/g, '').toUpperCase();
  }

  private validarRut(rut: string): boolean {
    return rut.length >= 8 && rut.length <= 10;
  }
}