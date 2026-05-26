import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { NgClass } from '@angular/common';
import { Pregunta } from './models/preguntados.model';
import { Preguntas } from './services/preguntas.service';
import { ResultadosService } from '../../../core/services/resultados.service';
import { Sound } from '../../../core/services/sounds.service';
import { GameActionBtn } from '../../../shared/components/game-action-btn/game-action-btn';

@Component({
  selector: 'app-preguntados',
  imports: [NgClass, GameActionBtn],
  templateUrl: './preguntados.html'
})
export class Preguntados implements OnInit, OnDestroy {
  private questionService = inject(Preguntas);
  private resultados = inject(ResultadosService);
  private sound = inject(Sound);

  isPlaying = signal(false);
  lives = signal(3);
  score = signal(0);
  bestScore = signal(Number(localStorage.getItem('best-score-preguntados')) || 0);
  correctAnswers = signal(0);
  phase = signal(1);
  questionsQueue = signal<Pregunta[]>([]);
  currentQuestion = signal<Pregunta | null>(null);
  shuffledOptions = signal<string[]>([]);
  selectedAnswer = signal<string | null>(null);
  showFeedback = signal(false);
  correctAnswerText = signal<string | null>(null);
  timeLeft = signal(15);
  multiplier = computed(() => 1 + (this.phase() - 1) * 0.5);
  isVictory = signal(false);

  private timer: ReturnType<typeof setInterval> | null = null;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;
  private allQuestions: Pregunta[] = [];

  ngOnInit() {
    this.questionService.loadPreguntas();
  }

  ngOnDestroy() {
    this.clearTimers(); // si salgo del componente y no lo destruyo el timer sigue (siguen actualizando las signals)
  }

  private clearTimers() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.feedbackTimer) { clearTimeout(this.feedbackTimer); this.feedbackTimer = null; }
  }

  startGame() {
    const data = this.questionService.preguntas();
    if (!data) return; // si no hay preguntas, no se juega

    this.isPlaying.set(true);
    this.lives.set(3);
    this.score.set(0);
    this.correctAnswers.set(0);
    this.phase.set(1);
    this.isVictory.set(false);

    const flat: Pregunta[] = [];
    for (const cat of data.categorias) {
      for (const q of cat.preguntas) {
        flat.push({ ...q, categoria: cat.nombre }); // doble for para convertir las preuguntas en un ARRAY PLANO
      }
    }
    this.allQuestions = this.shuffle(flat); // mezclo todo el array de preguntas
    this.takeNext25(); // agarro 25
  }
  // misma logifa de mezclar que en el juego de mayor o menor
  private shuffle<T>(array: T[]): T[] { // lo hago génerico para no tener que hacer 2 funciones luego
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private takeNext25() {
    const taken = this.allQuestions.slice(0, 25); // saca las primeras 25 preguntas del array y las guarda en taken.
    this.allQuestions = this.allQuestions.slice(25); // reemplaza allQuestions con todas las que quedan (desde la posición 25 en adelante)
    this.questionsQueue.set(taken); // mete las 25 cortadas en la cola de preguntas (questionsQueue)
    this.showNextQuestion();
  }

  showNextQuestion() {
    if (this.questionsQueue().length === 0) { // si no tengo preguntas para mostrar
      if (this.phase() < 5) { 
        this.phase.update(p => p + 1); // cambio de fase
        this.takeNext25(); // retomo 25 más
        return;
      } else { // si de casualidad no existen mas preguntas (se pasó el juego)
        this.score.update(s => s + 1000000); // +1M de puntos
        this.isVictory.set(true);
        this.isPlaying.set(false);
        this.updateBestScore();
        this.resultados.guardar('preguntados', this.score(), {
          preguntas_acertadas: this.correctAnswers()
        });
        return;
      }
    }

    const q = this.questionsQueue()[0]; // primer pregunta
    this.questionsQueue.update(queue => queue.slice(1)); // la quita del array (asi no se repite)
    this.currentQuestion.set(q); // pregunta actual
    this.shuffledOptions.set(this.shuffle([...q.opciones])); // en este caso llamo a shuffle() para mezclar las OPCIONES de lugar (por defecto en el json la primera siempre es la correcta)
    this.timeLeft.set(15); // seteo el contador
    this.selectedAnswer.set(null); // - - -
    this.showFeedback.set(false); //  - - -
    this.correctAnswerText.set(null); // - - - todo esto limpia el estado de la respusta anterior
    this.startTimer();
  }

  private startTimer() {
    this.clearTimers(); // limpia x las dudas cualquier timer anterior
    this.timer = setInterval(() => { // intervalo que se ejecuta cada 1s
      this.timeLeft.update(t => { 
        if (t <= 1) { // si llega a 1 o menos detiene el invervalo
          this.clearTimers();
          this.handleTimeout(); // ejecuta la logica de tiempo acabado
          return 0; // contador en 0
        }
        return t - 1; // si no termina, baja en 1 al contador (15, 14, 13 ...)
      });
    }, 1000);
  }

  private handleTimeout() {
    this.showFeedback.set(true); // muestra los colores
    this.correctAnswerText.set(this.currentQuestion()?.respuesta ?? null); // guarda la correcta para pintarla de verde
    this.sound.playSfx('error2');
    this.lives.update(l => l - 1); // como la llaman si se acaba el tiempo resta una vida

    this.feedbackTimer = setTimeout(() => { 
      if (this.lives() <= 0) {
        this.gameOver();
      } else {
        this.showNextQuestion();
      }
    }, 1300);
  }

  selectAnswer(opcion: string) {
    if (this.showFeedback() || !this.isPlaying()) return;

    this.clearTimers();
    this.showFeedback.set(true);
    this.selectedAnswer.set(opcion);
    const correct = this.currentQuestion()?.respuesta ?? null;
    this.correctAnswerText.set(correct);

    if (opcion === correct) {
      this.sound.playSfx('correct2');
      this.score.update(s => s + Math.round(50 * this.multiplier()));
      this.updateBestScore();
      this.correctAnswers.update(c => c + 1);
    } else {
      this.sound.playSfx('error2');
      this.lives.update(l => l - 1);
    }

    this.feedbackTimer = setTimeout(() => { // espera 1.3s y luego decide
      if (this.lives() <= 0) {
        this.gameOver(); // si lives = 0 termina el juego
      } else {
        this.showNextQuestion(); // sino, sigue el juego
      }
    }, 1300);
  }

  private async gameOver() {
    this.isPlaying.set(false);
    this.clearTimers();
    this.updateBestScore();
    await this.resultados.guardar('preguntados', this.score(), {
      preguntas_acertadas: this.correctAnswers()
    });
  }

  private updateBestScore() {
    if (this.score() > this.bestScore()) {
      this.bestScore.set(this.score());
      localStorage.setItem('best-score-preguntados', this.score().toString());
    }
  }
}
