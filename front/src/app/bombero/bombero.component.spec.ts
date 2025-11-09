
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BomberoComponent } from './bombero.component';
import { FormsModule } from '@angular/forms';

describe('BomberoComponent', () => {
  let component: BomberoComponent;
  let fixture: ComponentFixture<BomberoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BomberoComponent, HttpClientTestingModule, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BomberoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch bomberos on init', () => {
    const mockBomberos = [
      { ID_Bombero: 1, Rut: '12345678-9', NombreCompleto: 'Juan Pérez' },
      { ID_Bombero: 2, Rut: '98765432-1', NombreCompleto: 'María Gómez' }
    ];

    const req = httpMock.expectOne('/api/v1/bomberos');
    expect(req.request.method).toBe('GET');
    req.flush(mockBomberos);

    expect(component.bomberos.length).toBe(2);
    expect(component.bomberos[0].NombreCompleto).toBe('Juan Pérez');
    expect(component.loading).toBeFalse();
  });

  it('should handle error when fetching bomberos', () => {
    const req = httpMock.expectOne('/api/v1/bomberos');
    expect(req.request.method).toBe('GET');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(component.errorMsg).toBeTruthy();
    expect(component.loading).toBeFalse();
  });

  it('should validate RUT format', () => {
    expect(component['validarRut']('12345678-9')).toBeTrue();
    expect(component['validarRut']('12.345.678-9')).toBeTrue(); // Con puntos
    expect(component['validarRut']('123')).toBeFalse(); // Muy corto
    expect(component['validarRut']('')).toBeFalse(); // Vacío
  });
});
