import { Component, signal, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';

interface ResultadoRow {
  id: string;
  user_id: string;
  juego: string;
  puntaje_total: number;
  puntajes: Record<string, any>;
  created_at: string;
  user_profile: { nombre: string };
}

interface Columna {
  key: string;
  label: string;
  render?: (v: any) => string;
}

const CONFIG: { nombre: string; key: string; icono: string; columnas: Columna[] }[] = [
  {
    nombre: 'Ahorcado', key: 'ahorcado', icono: 'fa-gamepad',
    columnas: [
      { key: 'letras_seleccionadas', label: 'Letras' },
      { key: 'tiempo_segundos', label: 'Tiempo', render: v => `${v}s` },
    ],
  },
  {
    nombre: 'Mayor o Menor', key: 'mayor-o-menor', icono: 'fa-layer-group',
    columnas: [
      { key: 'cartas_acertadas', label: 'Aciertos' },
      { key: 'rondas', label: 'Rondas' },
    ],
  },
  {
    nombre: 'Preguntados', key: 'preguntados', icono: 'fa-question-circle',
    columnas: [
      { key: 'preguntas_acertadas', label: 'Aciertos' },
    ],
  },
  {
    nombre: 'Sudoku', key: 'sudoku', icono: 'fa-puzzle-piece',
    columnas: [
      { key: 'dificultad', label: 'Dificultad', render: v => v.charAt(0).toUpperCase() + v.slice(1) },
      { key: 'tiempo_segundos', label: 'Tiempo', render: v => `${v}s` },
    ],
  },
];

@Component({
  selector: 'app-resultados',
  imports: [NgClass],
  templateUrl: './resultados.html',
})
export class Resultados {
  private supabase = inject(SupabaseService);

  resultados = signal<ResultadoRow[]>([]);
  activeTab = signal(0);

  juegos = computed(() =>
    CONFIG.map(j => ({
      ...j,
      filas: this.resultados()
        .filter(r => r.juego === j.key)
        .sort((a, b) => b.puntaje_total - a.puntaje_total)
        .slice(0, 5),
    }))
  );

  juegoActual = computed(() => this.juegos()[this.activeTab()]);

  constructor() {
    this.cargarResultados();
  }

  async cargarResultados() {
    const { data } = await this.supabase
      .getClient()
      .from('resultados')
      .select('*, user_profile!inner(*)');
    this.resultados.set(data ?? []);
  }

  getValor(row: ResultadoRow, key: string): any {
    return row.puntajes?.[key] ?? '-';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
}
