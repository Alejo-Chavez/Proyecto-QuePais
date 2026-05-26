import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../models/preguntados.model';

@Injectable({
  providedIn: 'root'
})
export class Preguntas {

  private http = inject(HttpClient);
  private apiUrl = 'https://preguntados-api-tby3.onrender.com/preguntas';
  preguntas = signal<ApiResponse | null>(null);


  // estado reactivo
  loading = signal(false);
  error = signal<string | null>(null);

  loadPreguntas(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse>(this.apiUrl).subscribe({
      next: (data) => {
        this.preguntas.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las preguntas');
        this.loading.set(false);
      }
    });
  }
}