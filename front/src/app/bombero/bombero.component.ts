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
    NombreCompleto: ''
  };

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
      NombreCompleto: ''
    };
    this.showForm = true;
    this.clearMessages();
  }

  editarBombero(bombero: Bombero): void {
    this.editingBombero = bombero;
    this.bomberoModel = {
      Rut: bombero.Rut,
      NombreCompleto: bombero.NombreCompleto
    };
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

    const bomberoData = {
      Rut: rutLimpio,
      NombreCompleto: this.bomberoModel.NombreCompleto.trim()
    };

    console.log('Enviando datos:', bomberoData);

    let request;
    if (this.editingBombero) {
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
        console.error('Error en operación:', error);
        this.errorMsg = error.message || (this.editingBombero ? 'Error al actualizar bombero' : 'Error al crear bombero');
        this.loading = false;
      }
    });

    this.subscriptions.add(sub);
  }

  eliminarBombero(id: number): void {
    if (!confirm('¿Está seguro de que desea eliminar este bombero?')) {
      return;
    }

    this.loading = true;
    this.clearMessages();

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

  cancelarEdicion(): void {
    this.showForm = false;
    this.editingBombero = null;
    this.bomberoModel = {
      Rut: '',
      NombreCompleto: ''
    };
    this.loading = false;
    this.clearMessages();
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

  // Para debug - método temporal para probar con datos de ejemplo
  cargarDatosEjemplo(): void {
    this.bomberos = [
      { ID_Bombero: 1, Rut: '123456789', NombreCompleto: 'Juan Pérez González' },
      { ID_Bombero: 2, Rut: '987654321', NombreCompleto: 'María Gómez López' }
    ];
    this.successMsg = 'Datos de ejemplo cargados (modo prueba)';
  }
}
