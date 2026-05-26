import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SudokuService {
  board = signal<number[][]>([]);
  initialBoard: number[][] = [];
  lives = signal(3);
  score = signal(0);
  gameFinished = signal(false);
  hasWon = signal(false);
  conflicts = signal<[number, number][]>([]);

  private generateSolution(): number[][] {
    const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0)); // array 9x9 lleno de ceros
    const fill = (): boolean => {
      for (let r = 0; r < 9; r++) { // recorre cada celda del tablero. Si encuentra una celda vacía (0) ->
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === 0) {
            const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]); // crea un array [1..9] mezclado al azar (para no poner siempre los números en el mismo orden)
            for (const n of nums) {
              if (this.isSafe(board, r, c, n)) {
                board[r][c] = n; // prueba cada número mezclado, si es válido (no se repite en fila, columna ni bloque 3×3) lo coloca
                if (fill()) return true; // llama a fill() de nuevo (recursión) para llenar la siguiente celda vacía
                board[r][c] = 0;  // si la llamada retorna true -> todo el resto se llenó, si retorna false -> se equivocó, deshace (board[r][c] = 0) y prueba el siguiente número.
              }
            }
            return false; // si ningún número funciona en la celda entonces retorna false para que el nivel anterior pruebe otro número
          }
        }
      }
      return true;
    };
    fill();
    return board; // arranca la recursión y devuelve el tablero completo
  }

  private isSafe(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false; // recorre toda la fila y toda la columna, si el número ya está en alguna celda de esa fila o columna -> no es seguro (false)
    }
    const br = Math.floor(row / 3) * 3; // fila donde empieza el bloque 3x3
    const bc = Math.floor(col / 3) * 3; // columna donde empieza el bloque 3x3
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        if (board[r][c] === num) return false; // recorre las 9 celdas de ese bloque 3x3, si el número ya está en alguna -> no es seguro (false)
      }
    }
    return true; // si pasó todas las verificaciones (no está en fila, columna ni bloque) -> es seguro colocarlo ahí
  }

  private shuffle<T>(array: T[]): T[] { // misma logica usada tanto en mayor o menor como en preguntados
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private applyDifficulty(solution: number[][], emptyCells: number): number[][] { 
    const result = solution.map(row => [...row]); // crea una copia del tablero solución para no modificar el original
    let removed = 0;
    while (removed < emptyCells) {
      const r = Math.floor(Math.random() * 9); // fila aleatoria (0-8)
      const c = Math.floor(Math.random() * 9); // columna aleatoria (0-8)
      if (result[r][c] !== 0) { // // si esa celda no está vacía aún
        result[r][c] = 0; // la vacía (la oculta)
        removed++; // suma 1 al contador
      } // elige celdas al azar y las pone en 0 (vacías) hasta alcanzar la cantidad que pide la dificultad (30 para fácil, 40 para medio, etc). Si ya está vacía, busca otra
    }
    return result; // devuelve el tablero con los huecos -> que es el puzzle que ve el jugador
  } 

  startGame(emptyCells: number) {
    const solution = this.generateSolution();
    this.initialBoard = this.applyDifficulty(solution, emptyCells);
    this.board.set(this.initialBoard.map(row => [...row]));
    this.lives.set(3);
    this.score.set(0);
    this.gameFinished.set(false);
    this.hasWon.set(false);
    this.conflicts.set([]);
  }

  setValue(row: number, col: number, num: number) {
    if (this.gameFinished() || this.isFixedCell(row, col) || num < 0 || num > 9) return; // si el juego ya terminó, la celda es fija (la puso la dificultad), o el número no es válido -> no hace nada

    this.board.update(board => {
      board[row][col] = num; // pone el número en la celda del tablero, el [...board] crea un nuevo array para que Angular detecte el cambio
      return [...board];
    });

    if (num === 0) {
      this.conflicts.set([]); // si borraste el número (num = 0), limpia los conflictos rojos y termina
      return;
    }

    if (!this.isValidMove(row, col, num)) { // verifica si el número que se acaba de poner NO es válido (hay otro igual en la misma fila, columna o bloque 3x3)
      this.lives.update(l => l - 1);
      this.detectConflicts(row, col, num); // si hay conflicto: pierdes una vida y detecta qué celdas están en conflicto para pintarlas rojo desp
      if (this.lives() <= 0) { // sin vidas = GameOver
        this.gameFinished.set(true);
        this.hasWon.set(false);
      }
    } else {
      this.conflicts.set([]); // si el movimiento es válido (sin conflictos) -> limpia los rojos
    }
  }

  clearCell(row: number, col: number) {
    if (this.gameFinished() || this.isFixedCell(row, col)) return;
    this.board.update(board => {
      board[row][col] = 0;
      return [...board]; // pone la celda en 0 (vacía), el [...board] crea un nuevo array pa que Angular detecte el cambio en el signal
    });
    this.conflicts.set([]); // limpia todos los conflictos (en rojo)
  }

  isFixedCell(row: number, col: number): boolean {
    return this.initialBoard[row]?.[col] !== 0; // si en esa posición hay un número distinto de 0 -> es fija, el jugador no puede tocarla
  }

  isConflictCell(row: number, col: number): boolean { // recorre el array conflicts (que es [fila, columna][]), si encuentra coincidencia con la celda que le pasas -> devuelve true (esa celda se pinta roja) si no está en la lista -> false (normal)
    return this.conflicts().some(([r, c]) => r === row && c === col);
  }

  private isValidMove(row: number, col: number, num: number): boolean {
    if (num === 0) return true;
    const board = this.board(); // estado actual del tablero
    for (let i = 0; i < 9; i++) { // recorre toda la fila y columna de la celda, si encuentra el mismo número en otra celda de esa fila o columna -> inválido
      if (i !== col && board[row][i] === num) return false;
      if (i !== row && board[i][col] === num) return false; //  el i !== col / i !== row saltea la celda actual para no compararse consigo misma
    } 
    const br = Math.floor(row / 3) * 3; // fila donde arranca el bloque 3x3
    const bc = Math.floor(col / 3) * 3; // col donde arranca el bloque 3x3
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        if ((r !== row || c !== col) && board[r][c] === num) return false;
      } // recorre las 9 celdas del bloque 3x3, si encuentra el mismo número en otra celda del bloque -> invalido
    }
    return true; // si pasó todas las verificaciones sin encontrar duplicados -> el movimiento es válido
  }

  private detectConflicts(row: number, col: number, num: number) {
    const conflicting: [number, number][] = [[row, col]]; // lista de celdas en conflicto y agrega la celda donde acabás de poner el número (ella también se marca roja)
    const board = this.board();
    for (let i = 0; i < 9; i++) { // busca en toda la fila y columna, si encuentra el mismo número en otra celda, la agrega a la lista de conflictos
      if (i !== col && board[row][i] === num) conflicting.push([row, i]);
      if (i !== row && board[i][col] === num) conflicting.push([i, col]);
    }
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++) { //  lo mismo pero en el bloque 3x3, agrega todas las celdas del bloque que tengan el mismo número
      for (let c = bc; c < bc + 3; c++) {
        if ((r !== row || c !== col) && board[r][c] === num) {
          conflicting.push([r, c]);
        }
      }
    }
    this.conflicts.set(conflicting); // guarda la lista de conflictos en la singal pa luego pintarlas de roja
  }

  remainingCounts(): Record<number, number> {
    const counts: Record<number, number> = {}; // crea un objeto {1: 9, 2: 9, 3: 9, ..., 9: 9}. Cada número empieza con 9 pq en Sudoku cada numero del 1 al 9 aparece exactamente 9 veces en el tablero completo
    for (let n = 1; n <= 9; n++) counts[n] = 9;
    for (const row of this.board()) {
      for (const val of row) {
        if (val !== 0) counts[val]--; // recorre todas las celdas del tablero, por cada numero que ya está colocado (distinto de 0), le resta 1 a su contador
      }
    }
    return counts; //  si ya pusiste cinco 3 veces en el tablero, counts[3] será 4 (faltan 4 más), ese numero se muestra debajo de cada tecla en el teclado numérico, y cuando llega a 0 el botón se deshabilita porque ya no caben más de ese numero
  }

  isBoardComplete(): boolean {
    return !this.board().flat().includes(0);
  }

  verifySolution(): boolean {
    const board = this.board();
    for (let r = 0; r < 9; r++) { // recorre todas las celdas, si encuentra alguna vacía (0) -> el tablero no está completo entonces es false
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) return false;
      }
    }
    for (let r = 0; r < 9; r++) { // recorre todas las celdas otra vez y verifica que cada número no tenga conflictos en su fila, columna ni bloque 3x3
      for (let c = 0; c < 9; c++) {
        if (!this.isValidMove(r, c, board[r][c])) return false;
      }
    }
    return true;
  }

  finishGame(won: boolean) {
    this.gameFinished.set(true);
    this.hasWon.set(won);
  }
}
