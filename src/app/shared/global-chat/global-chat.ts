import { Component, EventEmitter, Output, inject, ViewChild, ElementRef, effect } from '@angular/core';
import { OnInit } from '@angular/core';
import { ChatService } from '../../core/services/chat.service';
import { AuthServices } from '../../core/services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-global-chat',
  imports: [DatePipe],
  templateUrl: './global-chat.html',
})
export class GlobalChat implements OnInit {
  private chatService = inject(ChatService);
  auth = inject(AuthServices);

  @Output() close = new EventEmitter<void>();

  messages = this.chatService.messages;

  @ViewChild('msgContainer') private msgContainer!: ElementRef<HTMLElement>;

  constructor() {
    effect(() => {
      this.messages();
      setTimeout(() => {
        this.msgContainer?.nativeElement.scrollTo({ top: this.msgContainer.nativeElement.scrollHeight, behavior: 'smooth' });
      });
    });
  }

  async ngOnInit(): Promise<void> {
    await this.chatService.getMessages();
    this.chatService.listenMessagesInRealTime();
  }

  async send(input: HTMLInputElement) { 
    const value = input.value.trim();
    if (!value) return;

    await this.chatService.sendMessages(value);
    input.value = '';
  }
}
