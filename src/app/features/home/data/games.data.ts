import { Game } from "../game-card-info/game-card-info.model";
export const GAMES: Game[] = [
  {
    title: 'Ahorcado',
    description: 'El mítico juego de ahorcado que todos alguna vez jugamos',
    route: '/games/ahorcado',
    icon: '/assets/games-pp/ahorcado.png'
  },
  {
    title: 'Mayor o Menor',
    description: 'Tendrás la suerte necesaria para adivinar si tu siguiente será mayor o menor?',
    route: '/games/mayor-o-menor',
    icon: '/assets/games-pp/mayor-o-menor.png'
  },
  {
    title: 'Preguntados',
    description: 'Pone a prueba tu conocimiento general',
    route: '/games/preguntados',
    icon: '/assets/games-pp/preguntados.png'
  },
  {
    title: 'Sudoku',
    description: 'Clásico Sudoku con 4 niveles de dificultad',
    route: '/games/sudoku',
    icon: '/assets/games-pp/sudoku.png'
  },
  {
    title: 'Qué país',
    description: 'Adivina el país por sus características',
    route: '/home',
    icon: '/assets/games-pp/sudoku.png'
  }
];