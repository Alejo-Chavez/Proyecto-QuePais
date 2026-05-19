import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Game } from './game-card-info/game-card-info.model';
import { GAMES } from './data/games.data';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
})

export class Home {
  games: Game[] = GAMES
} 
  