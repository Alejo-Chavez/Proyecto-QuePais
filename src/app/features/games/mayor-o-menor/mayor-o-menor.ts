import { Component, signal, inject } from '@angular/core';
import { Card } from './models/cards.model';
import { Sound } from '../../../core/services/sounds.service';

@Component({
  selector: 'app-mayor-o-menor',
  imports: [],
  templateUrl: './mayor-o-menor.html',
})

export class MayorOMenor {
  sound = inject(Sound);

  private pointsMap = {
    mayor: 50,
    menor: 50,
    igual: 150
  }

  playing = signal(false);
  score = signal(0);
  bestScore = signal(0);
  lives = signal(5);
  cardsDeck = signal<Card[]>([]);
  currentCard = signal<Card | null>(null);
  nextCard = signal<Card | null>(null);
  rightRevealed = signal(false);
  evaluating = signal(false);
  suits = ["spades", "hearts", "clubs", "diamonds"]

  startGame() {
    this.playing.set(true);
    this.sound.playMusic('bg-lowerorhigher')
    this.score.set(0);
    this.lives.set(5);
    this.generateDeck();
    this.shuffleDeck();
    this.currentCard.set(this.drawCard());
    this.nextCard.set(this.drawCard());
    this.rightRevealed.set(false);
    this.evaluating.set(false);
  }

  generateDeck() {
    const deck = []; //crea el futuro mazo vacio
    for (const suit of this.suits) {
      for (let i = 1; i < 14; i++) { //por cada palo iteramos 13 veces y le asignamos los values
        deck.push({ value: i, suit: suit, image: `/assets/cards/${suit[0].toUpperCase()}-${i}.png` })
      }
    }
    this.cardsDeck.set(deck) //seteamos el mazo lleno
  }

  shuffleDeck() {
    this.cardsDeck.update((deck) => { //el mazo actual llamado "deck"
      const shuffled = [...deck]; //shuffled va a ser una copia de deck
      for (let i = shuffled.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1)); //randomIndex va a ser un valor entre 0 y 1 redondeado para abajo sumado i + 1
        [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]]; //agarramos la ultima carta del mazo y la intercambiamos por la del randomIndex
      }
      return shuffled; //retornamos el mazo mesclado
    });
  }

  drawCard() {
    const deck = this.cardsDeck(); //asigno el mazo a la variable deck
    if (deck.length === 0) return null;
    const card = deck[deck.length - 1]; //saco la ultima carta del mazo
    this.cardsDeck.set(deck.slice(0, -1)); //hago una copia del mazo sin la carta que saqué
    return card; //la retorno
  }

  playerSelect(option: 'mayor' | 'menor' | 'igual') {
    if (this.evaluating()) return;

    const current = this.currentCard();
    const next = this.nextCard();
    if (!current || !next) return;

    this.rightRevealed.set(true);
    this.evaluating.set(true);
    this.sound.playSfx('taking-card');

    const isCorrect =
      (option === 'mayor' && current.value > next.value) ||
      (option === 'menor' && current.value < next.value) ||
      (option === 'igual' && current.value === next.value);

    if (isCorrect) {
      this.score.update(s => s + this.pointsMap[option]);
      if (this.score() > this.bestScore()) this.bestScore.set(this.score());
      this.sound.playSfx('correct');
    } else {
      this.lives.update(l => l - 1);
      this.sound.playSfx('wrong');
    }

    if (this.lives() <= 0) {
      setTimeout(() => {
        this.sound.stopMusic();
        this.playing.set(false);
        this.currentCard.set(null);
        this.nextCard.set(null);
        this.rightRevealed.set(false);
        this.evaluating.set(false);
      }, 1500);
      return;
    }

    setTimeout(() => {
      this.currentCard.set(next);
      this.nextCard.set(this.drawCard());
      this.rightRevealed.set(false);
      this.evaluating.set(false);
    }, 700);
  }
  
  ngOnDestroy() {
  this.sound.stopMusic();
}
}
