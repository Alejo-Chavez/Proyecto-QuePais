import { Component, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sound } from '../../../core/services/sounds.service';
import { ResultadosService } from '../../../core/services/resultados.service';

/*
  ── Tabla game_results (crear en Supabase SQL Editor) ──
  CREATE TABLE game_results (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profile(id),
    game_name TEXT NOT NULL,
    score INT NOT NULL,
    details JSONB,
    played_at TIMESTAMPTZ DEFAULT now()
  );
*/

@Component({
  selector: 'ahorcado',
  imports: [CommonModule],
  templateUrl: './ahorcado.html',
})

export class Ahorcado implements OnDestroy {

  sound = inject(Sound);
  private resultados = inject(ResultadosService);

  //estado del juego
  isPlaying = signal(false);
  lives = signal(5);

  //signals
  score = signal(0);

  bestScore = signal(
    Number(localStorage.getItem('best-score')) || 0
  );

  usedLetters: string[] = [];
  currentWord!: Word;
  availableWords: Word[] = [];
  showHint = signal(false);
  startTime: number = 0;

  toggleHint() {
    this.showHint.update(v => !v);
    this.sound.playSfx('hint');
  }

  openHint() {
    this.showHint.set(true);
    this.sound.playSfx('hint');
  }

  closeHint() {
    this.showHint.set(false);
    this.sound.playSfx('close-hint');
  }
  keyDelays: any; 
  //array de palabras y pistas disponibles
  words: Word[] = [

    { word: 'ANGULAR', hint: 'Frontend framework' },
    { word: 'TYPESCRIPT', hint: 'Language used by Angular' },
    { word: 'SUPABASE', hint: 'Backend as a service' },
    { word: 'JAVASCRIPT', hint: 'Programming language' },
    { word: 'COMPONENT', hint: 'Angular building block' },
    { word: 'DIRECTIVE', hint: 'Angular feature' },
    { word: 'SIGNALS', hint: 'Angular reactivity system' },
    { word: 'OBSERVABLE', hint: 'RxJS structure' },
    { word: 'SERVICE', hint: 'Injectable class' },

    { word: 'ROUTER', hint: 'Angular navigation system' }
  ];
  // agregar esto al ts

  keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  

  //inicio del juego
  startGame() {

    this.isPlaying.set(true);
    this.lives.set(6);

    this.sound.playSfx('startUI');
    this.sound.playMusic('bg-ahorcado');

    //resetear signal
    this.score.set(0);

    this.usedLetters = [];

    this.keyDelays = {};
    for (const row of this.keyboardRows) {
      for (const letter of row) {
        this.keyDelays[letter] = Math.random() * 400;
      }
    }

    // copy array
    this.availableWords = [...this.words];

    this.startTime = Date.now();

    this.setRandomWord();

  }

  //elegir un indice random
  setRandomWord() {

    //si por algun casual me quedo sin palabra, la reseteamos
    if (this.availableWords.length === 0) {
      this.availableWords = [...this.words];
    }

    const randomIndex = Math.floor(
      Math.random() * this.availableWords.length
    );

    this.currentWord = this.availableWords[randomIndex];

    //se remueve del array la palabra
    this.availableWords.splice(randomIndex, 1);

    this.usedLetters = [];

  }

  //seleccionar palabra
  selectLetter(letter: string) {

    if (!this.isPlaying() || this.lives() <= 0) return;

    letter = letter.toUpperCase();

    //si la letra ya habia salido, return. No se deben repetir
    if (this.usedLetters.includes(letter)) return;

    this.usedLetters.push(letter);

    this.sound.playSfx('pressKey');

    //si le erra le sacamos una vida
    if (!this.currentWord.word.includes(letter)) {

      this.sound.playSfx('error');
      this.lives.update(v => v - 1);

      if (this.lives() <= 0) {

        this.sound.playSfx('gameOver');

        setTimeout(() => {
          this.gameOver();
        }, 2000);

      }

      return;
    }

    //suma por cada acierto
    this.score.update(current => current + 50);

    //checar si completó la palabra
    if (this.isWordCompleted()) {

      //bonus por adivinar
      this.score.update(current => current + 100);
      this.sound.playSfx('completed');

      this.setRandomWord(); //volvemos a elegir una palabra

    }

  }

  //verificar si completó la palabra
  isWordCompleted(): boolean {

    return this.currentWord.word
      .split('') // divide la palabra de "CASA" -> "C A S A"
      .every(letter =>
        this.usedLetters.includes(letter)
      );

  }

  //mostrar las acertadas

  get maskedWord(): string[] {

    return this.currentWord.word
      .split('')
      .map(letter => //recorre cada letra

        //usedLetters(A - N - * - * - L - A *).includes('A')
        this.usedLetters.includes(letter)
          ? letter //si sí, muestra la letra
          : '_'    //si no "_"

      );

  }

  ngOnDestroy() {
    this.sound.stopMusic();
  }

  //finalizar el juego
  async gameOver() {

    this.isPlaying.set(false);

    //guardamos el mejor score
    if (this.score() > this.bestScore()) {
      this.bestScore.set(this.score());

      localStorage.setItem(
        'best-score',
        this.bestScore().toString()
      );

    }

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    await this.resultados.guardar('ahorcado', this.score(), {
      letras_seleccionadas: this.usedLetters.length,
      tiempo_segundos: elapsed
    });

  }

}