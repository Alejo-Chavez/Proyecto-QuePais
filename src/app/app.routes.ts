import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { WhoIam } from './features/who-iam/who-iam';
import { authGuard } from './core/guards/auth.guard.ts';
import { Layout } from './features/games/layout/layout';

export const routes: Routes = [
     { path: '', redirectTo: 'home', pathMatch: 'full' },
     { path: 'home', component: Home },
      { path: 'games', component: Layout, canActivate: [authGuard],children: [
                  { path: 'ahorcado', loadComponent: () =>import('./features/games/ahorcado/ahorcado').then((m) => m.Ahorcado)},
                  { path: 'mayor-o-menor', loadComponent: () => import('./features/games/mayor-o-menor/mayor-o-menor').then((m) => m.MayorOMenor)},
                  {path: 'preguntados', loadComponent: () =>import('./features/games/preguntados/preguntados').then((m) => m.Preguntados)}
               ]},
     { path: 'login', component: Login },
     { path: 'register', component: Register },
     { path: 'who-iam', component: WhoIam }
];
