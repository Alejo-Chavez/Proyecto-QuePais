import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { NgClass } from '@angular/common';
import { Pregunta } from './models/preguntados.model';
import { Preguntas } from './services/preguntas.service';
import { ResultadosService } from '../../../core/services/resultados.service';

@Component({
  selector: 'app-preguntados',
  imports: [NgClass],
  templateUrl: './preguntados.html'
})
export class Preguntados implements OnInit, OnDestroy {
  private questionService = inject(Preguntas);
  private resultados = inject(ResultadosService);

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
    this.clearTimers();
  }

  private clearTimers() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.feedbackTimer) { clearTimeout(this.feedbackTimer); this.feedbackTimer = null; }
  }

  startGame() {
    const data = this.questionService.preguntas();
    if (!data) return;

    this.isPlaying.set(true);
    this.lives.set(3);
    this.score.set(0);
    this.correctAnswers.set(0);
    this.phase.set(1);
    this.isVictory.set(false);

    const flat: Pregunta[] = [];
    for (const cat of data.categorias) {
      for (const q of cat.preguntas) {
        flat.push({ ...q, categoria: cat.nombre });
      }
    }
    this.allQuestions = this.shuffle(flat);
    this.takeNext25();
  }

  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private takeNext25() {
    const taken = this.allQuestions.slice(0, 25);
    this.allQuestions = this.allQuestions.slice(25);
    this.questionsQueue.set(taken);
    this.showNextQuestion();
  }

  showNextQuestion() {
    if (this.questionsQueue().length === 0) {
      if (this.phase() < 5) {
        this.phase.update(p => p + 1);
        this.takeNext25();
        return;
      } else {
        this.score.update(s => s + 1000000);
        this.isVictory.set(true);
        this.isPlaying.set(false);
        this.updateBestScore();
        this.resultados.guardar('preguntados', this.score(), {
          preguntas_acertadas: this.correctAnswers()
        });
        return;
      }
    }

    const q = this.questionsQueue()[0];
    this.questionsQueue.update(queue => queue.slice(1));
    this.currentQuestion.set(q);
    this.shuffledOptions.set(this.shuffle([...q.opciones]));
    this.timeLeft.set(15);
    this.selectedAnswer.set(null);
    this.showFeedback.set(false);
    this.correctAnswerText.set(null);
    this.startTimer();
  }

  private startTimer() {
    this.clearTimers();
    this.timer = setInterval(() => {
      this.timeLeft.update(t => {
        if (t <= 1) {
          this.clearTimers();
          this.handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  private handleTimeout() {
    this.showFeedback.set(true);
    this.correctAnswerText.set(this.currentQuestion()?.respuesta ?? null);
    this.lives.update(l => l - 1);

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
      this.score.update(s => s + Math.round(50 * this.multiplier()));
      this.updateBestScore();
      this.correctAnswers.update(c => c + 1);
    } else {
      this.lives.update(l => l - 1);
    }

    this.feedbackTimer = setTimeout(() => {
      if (this.lives() <= 0) {
        this.gameOver();
      } else {
        this.showNextQuestion();
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
