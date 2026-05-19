import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Game } from './game-card-info/game-card-info.model';
import { GAMES } from './data/games.data';
import { Sound } from '../../core/services/sounds.service';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
})

export class Home {
  private router = inject(Router);
  private sound = inject(Sound);
  games: Game[] = GAMES;

  goToGame(route: string) {
    // Espera 1000 milisegundos (1 segundo) antes de redirigir
    setTimeout(() => {
      this.router.navigate([route]);
    }, 540);
  };

  playHover() {
    this.sound.playSfx('select-hover');
  }

  playSelect() { 
    this.sound.playSfx('game-selected', 0.25);
  }
} 
