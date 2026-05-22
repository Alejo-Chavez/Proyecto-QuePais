import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Sound {
    private music = new Audio();

    playMusic(name: string) {
        this.music.src = `/assets/sounds/${name}.mp3`;
        this.music.loop = true;
        this.music.volume = 0.07;
        this.music.play();
    }

    stopMusic() {
        this.music.pause();
        this.music.currentTime = 0;

    }
    
    playSfx(name: string, volume = 0.3): HTMLAudioElement {
        const audio = new Audio(`/assets/sounds/${name}.mp3`);
        audio.volume = volume;
        audio.play();
        return audio;
    }
    
}