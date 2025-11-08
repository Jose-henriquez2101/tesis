import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Escenario {
  id_Escenario: number;
  NombreEscenario: string;
  DescripcionEscenario?: string;
}

@Component({
  selector: 'app-escenario',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './escenario.component.html',
  styleUrl: './escenario.component.scss'
})
export class EscenarioComponent implements OnInit {
  escenarios: Escenario[] = [];
  loading = false;
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchEscenarios();
  }

  fetchEscenarios() {
    this.loading = true;
    this.errorMsg = '';

    this.http.get<Escenario[]>('/api/v1/escenarios').subscribe({
      next: data => {
        this.escenarios = data || [];
        this.loading = false;
      },
      error: err => {
        console.error('Error al obtener escenarios', err);
        this.errorMsg = err?.error?.message || err?.message || 'Error al obtener escenarios';
        this.loading = false;
      }
    });
  }
}
