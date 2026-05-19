import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Sound {

    playSfx(name: string, volume = 0.3): HTMLAudioElement {
        const audio = new Audio(`/assets/sounds/${name}.mp3`);
        audio.volume = volume;
        audio.play();
        return audio;
    }
    
}