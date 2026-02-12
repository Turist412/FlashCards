import { Injectable } from '@angular/core';
import { CardLanguage } from '../models/enums.model';

@Injectable({ providedIn: 'root' })
export class TtsService {
  private synthesis = window.speechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
  }

  speak(text: string, language: CardLanguage) {
    this.synthesis.cancel();

    if (this.voices.length === 0) {
        this.voices = this.synthesis.getVoices();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    switch (language) {
      case CardLanguage.German:
        utterance.lang = 'de-DE';
        utterance.rate = 1.0;
        break;
      case CardLanguage.Japanese:
        utterance.lang = 'ja-JP';
        utterance.rate = 1.0;
        break;
      case CardLanguage.Russian:
        utterance.lang = 'ru-RU';
        utterance.rate = 1.0;
        const dmitryVoice = this.voices.find(v => v.name.includes('Microsoft Dmitry Online (Natural)'));
        
        if (dmitryVoice) {
            utterance.voice = dmitryVoice;
        } else {
            console.warn('Голос Dmitry не найден! Используется стандартный.');
            const googleVoice = this.voices.find(v => v.name.includes('Google русский'));
            if (googleVoice) utterance.voice = googleVoice;
        }
        break;    }
    this.synthesis.speak(utterance);
  }
}