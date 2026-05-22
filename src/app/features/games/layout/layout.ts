import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//import { GlobalChat } from '../../../shared/global-chat/global-chat'; 

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet],
  templateUrl: './layout.html',
})
export class Layout {
  mostrarChat = false;

  toggleChat() {
    this.mostrarChat = !this.mostrarChat;
  }
}