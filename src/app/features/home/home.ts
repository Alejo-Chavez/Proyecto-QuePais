import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
})

export class Home {
  games = [{
    title: 'Juego 1',
    description: 'Tendrás la suerte necesaria para adivinar si tu siguiente será mayor o menor?',
    route: '/games/ahorcado',
    icon: 'fa-gamepad'
  },
  {
    title: 'Juego 2',
    description: 'Tendrás la suerte necesaria para adivinar si tu siguiente será mayor o menor?',
    route: '/games/mayor-o-menor',
    icon: 'fa-chess'
},
{
    title: 'Juego 3',
    description: 'El mitico juego de ahorcado que todos alguna vez jugamos',
    route: '/mayor-o-menor',
    icon: 'fa-chess'
},
{
    title: 'Juego 4',
    description: 'Descripción del juego 2',
    route: '/mayor-o-menor',
    icon: 'fa-chess'
}]
}
