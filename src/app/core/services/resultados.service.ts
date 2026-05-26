import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthServices } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ResultadosService {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthServices);

  async guardar(juego: string, puntaje_total: number, puntajes: Record<string, any>) {
    const user = this.auth.currentUser();
    if (!user) return;
    await this.supabase.getClient().from('resultados').insert({
      user_id: user.id,
      juego,
      puntaje_total,
      puntajes
    });
  }
}
