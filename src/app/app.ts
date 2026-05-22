import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { AuthServices } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Proyecto-QuePais');
  private auth = inject(AuthServices);

  constructor() {
    this.auth.checkSession();
  }
}
