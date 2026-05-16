import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
})

export class Home {
  games = [{
    title: 'Ahorcado',
    description: 'El clasico y divertido juego de ahorcado',
    route: '/games/ahorcado',
    icon: 'fa-gamepad'
  },
  {
    title: 'Mayor o Menor?',
    description: 'Tendrás la suerte necesaria para adivinar si tu siguiente será mayor o menor?',
    route: '/games/mayor-o-menor',
    icon: 'fa-chess'
},
{
    title: 'Juego 3',
    description: 'Descripción del juego',
    route: '/mayor-o-menor',
    icon: 'fa-chess'
},
{
    title: 'Juego 4',
    description: 'Descripción del juego',
    route: '/mayor-o-menor',
    icon: 'fa-chess'
}]
}
