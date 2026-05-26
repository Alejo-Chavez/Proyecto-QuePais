import { Component, signal, computed, inject, HostListener } from '@angular/core';
import { SudokuService } from './services/sudoku.service';
import { ResultadosService } from '../../../core/services/resultados.service';
import { Sound } from '../../../core/services/sounds.service';
import { GameActionBtn } from '../../../shared/components/game-action-btn/game-action-btn';

interface DifficultyConfig {
  label: string;
  key: string;
  basePoints: number;
  timeLimit: number;
  emptyCells: number;
}

const DIFFICULTIES: DifficultyConfig[] = [
  { label: 'Fácil', key: 'easy', basePoints: 10, timeLimit: 600, emptyCells: 30 },
  { label: 'Medio', key: 'medium', basePoints: 20, timeLimit: 900, emptyCells: 40 },
  { label: 'Difícil', key: 'hard', basePoints: 30, timeLimit: 1200, emptyCells: 50 },
  { label: 'Experto', key: 'expert', basePoints: 40, timeLimit: 1800, emptyCells: 55 },
];

type Screen = 'menu' | 'difficulty' | 'playing' | 'victory' | 'gameover';

@Component({
  selector: 'app-sudoku',
  imports: [GameActionBtn],
  templateUrl: './sudoku.html',
})
export class Sudoku {
  service = inject(SudokuService);
  private resultados = inject(ResultadosService);
  private sound = inject(Sound);
  difficultyConfigs = DIFFICULTIES;
  readonly numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  screen = signal<Screen>('menu');
  selectedCell = signal<[number, number] | null>(null);
  selectedDifficultyIndex = signal(-1);
  elapsedTime = signal(0);
  bestScores = signal<number[]>(
    JSON.parse(localStorage.getItem('best-scores-sudoku') || '[0,0,0,0]')
  );

  private timer: ReturnType<typeof setInterval> | null = null;

  difficulty = computed(() => DIFFICULTIES[this.selectedDifficultyIndex()]);

  formattedTime = computed(() => {
    const m = Math.floor(this.elapsedTime() / 60);
    const s = this.elapsedTime() % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (this.screen() !== 'playing') return;
    const num = parseInt(event.key);
    if (num >= 1 && num <= 9) {
      this.enterNumber(num);
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      this.eraseNumber();
    }
  }

  goToDifficulty() {
    this.screen.set('difficulty');
  }

  selectDifficulty(index: number) {
    this.selectedDifficultyIndex.set(index);
    this.elapsedTime.set(0);
    this.selectedCell.set(null);

    const config = DIFFICULTIES[index];
    this.service.startGame(config.emptyCells);

    this.screen.set('playing');
    this.startTimer();
  }

  private startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.elapsedTime.update(t => t + 1);
    }, 1000);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  selectCell(row: number, col: number) {
    if (this.screen() !== 'playing') return;
    this.selectedCell.set([row, col]);
  }

  enterNumber(n: number) {
    const sel = this.selectedCell();
    if (!sel) return;
    this.sound.playSfx('pressKey');
    const [row, col] = sel;
    const prevLives = this.service.lives();
    this.service.setValue(row, col, n);

    if (this.service.lives() < prevLives) {
      this.sound.playSfx('error2');
    }

    if (this.service.lives() <= 0 && this.service.gameFinished()) {
      this.stopTimer();
      setTimeout(() => this.gameOver(), 600);
    }
  }

  eraseNumber() {
    const sel = this.selectedCell();
    if (!sel) return;
    this.service.clearCell(sel[0], sel[1]);
  }

  remainingCount(n: number): number {
    return this.service.remainingCounts()[n] ?? 9;
  }

  isSelected(row: number, col: number): boolean {
    const sel = this.selectedCell();
    return sel !== null && sel[0] === row && sel[1] === col; // para pintar desp la celda clickeada
  }

  isHighlighted(row: number, col: number): boolean {
    const sel = this.selectedCell();
    if (!sel || this.isSelected(row, col)) return false;
    const sameRow = row === sel[0];
    const sameCol = col === sel[1];
    const sameBlock =
      Math.floor(row / 3) === Math.floor(sel[0] / 3) &&
      Math.floor(col / 3) === Math.floor(sel[1] / 3);
    return sameRow || sameCol || sameBlock;
  }

  hasValue(row: number, col: number): boolean {
    return this.service.board()[row]?.[col] !== 0;
  }

  async verifySolution() {
    const won = this.service.verifySolution();
    this.service.finishGame(won);
    this.stopTimer();

    if (won) {
      this.sound.playSfx('sudoku-gamepass');
      const diff = this.difficulty();
      const bonoTiempo = Math.max(0, (diff.timeLimit - this.elapsedTime()) / diff.timeLimit);
      const multVidas = 1 + this.service.lives() * 0.5;
      const total = Math.round(diff.basePoints * (1 + bonoTiempo) * multVidas);
      this.service.score.set(total);

      const scores = this.bestScores();
      if (total > scores[this.selectedDifficultyIndex()]) {
        scores[this.selectedDifficultyIndex()] = total;
        this.bestScores.set([...scores]);
        localStorage.setItem('best-scores-sudoku', JSON.stringify(scores));
      }

      await this.resultados.guardar('sudoku', total, {
        dificultad: this.difficulty().key,
        tiempo_segundos: this.elapsedTime()
      });

      this.screen.set('victory');
    } else {
      this.sound.playSfx('sudoku-gameover');
      this.screen.set('gameover');
    }
  }

  private async gameOver() {
    this.sound.playSfx('sudoku-gameover');
    this.stopTimer();
    this.selectedCell.set(null);
    this.screen.set('gameover');
    await this.resultados.guardar('sudoku', 0, {
      dificultad: this.difficulty().key,
      tiempo_segundos: this.elapsedTime()
    });
  }

  goHome() {
    this.stopTimer();
    this.screen.set('menu');
    this.selectedCell.set(null);
  }
}
