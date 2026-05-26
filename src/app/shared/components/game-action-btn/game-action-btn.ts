import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-btn',
  template: `
    <button (click)="onClick()"
      class="bg-[#acc7ff] hover:brightness-110 text-[#002f68] font-bold uppercase tracking-widest transition-all active:scale-95 rounded-[1.25rem]"
      [class.px-16]="size === 'lg'"
      [class.py-5]="size === 'lg'"
      [class.text-2xl]="size === 'lg'"
      [class.shadow-2xl]="size === 'lg'"
      [class.shadow-[#acc7ff]/20]="size === 'lg'"
      [class.px-10]="size === 'sm'"
      [class.py-4]="size === 'sm'"
      [class.text-lg]="size === 'sm'">
      <ng-content></ng-content>
    </button>
  `
})
export class GameActionBtn {
  @Input() size: 'lg' | 'sm' = 'lg';
  @Input() navigateHome = false;
  @Output() action = new EventEmitter<void>();
  private router = inject(Router);

  onClick() {
    if (this.navigateHome) {
      this.router.navigate(['/home']);
    } else {
      this.action.emit();
    }
  }
}
