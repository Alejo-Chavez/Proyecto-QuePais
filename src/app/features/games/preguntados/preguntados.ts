import { Component, inject } from '@angular/core';
import { Pregunta } from './models/preguntados.model';
import { Preguntas } from './services/preguntas.service';
@Component({
  selector: 'app-preguntados',
  imports: [],
  templateUrl: './preguntados.html'
})
export class Preguntados {

  private questionService = inject(Preguntas);

  preguntas = this.questionService.preguntas;

  ngOnInit() {
    this.questionService.loadPreguntas();
  }
}