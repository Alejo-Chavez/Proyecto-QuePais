import { Component, EventEmitter, Output, inject } from '@angular/core';
import { OnInit } from '@angular/core';
import { ChatService } from '../../core/services/chat.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-global-chat',
  imports: [DatePipe],
  templateUrl: './global-chat.html',
})
export class GlobalChat implements OnInit {
  private chatService = inject(ChatService);

  @Output() close = new EventEmitter<void>();

  messages = this.chatService.messages;

  ngOnInit(): void {
    this.chatService.getMessages();
    this.chatService.listenMessagesInRealTime();
  }

  async send(input: HTMLInputElement) { 
    const value = input.value.trim();
    if (!value) return;

    await this.chatService.sendMessages(value);
    input.value = '';
  }
}
