import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyCard } from '../../../../models/study-card.model';
import { CardLanguage } from '../../../../models/enums.model';
import { TtsService } from '../../../../services/tts.service'; 
import { SpeedControlComponent } from '../../../../shared/components/speed-control/speed-control.component'; 

@Component({
  selector: 'app-voice-multiple-choice',
  standalone: true,
  imports: [CommonModule, SpeedControlComponent],
  templateUrl: './voice-multiple-choice.component.html',
  styleUrl: './voice-multiple-choice.component.scss'
})
export class VoiceMultipleChoiceComponent implements OnChanges {
  @Input({ required: true }) card!: StudyCard;
  @Output() answerGiven = new EventEmitter<boolean>();

  selectedOption: string | null = null;
  isAnswerProcessed = false; 

  eLanguage = CardLanguage;

  constructor(private ttsService: TtsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['card'] && this.card) {
      setTimeout(() => this.playAudio(), 300);
    }
  }

  playAudio(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const lang = this.card.language;
    
    this.ttsService.speak(this.card.frontText, lang);
  }

  onOptionClick(option: string) {
    if (this.isAnswerProcessed) return; 

    this.selectedOption = option;
    this.isAnswerProcessed = true;

    const targetAnswer = this.card.checkFrontText ? this.card.backText : this.card.frontText;
    const isCorrect = option === targetAnswer;

    setTimeout(() => {
      this.answerGiven.emit(isCorrect);
      this.selectedOption = null;
      this.isAnswerProcessed = false;
    }, 1000); 
  }

  isCorrectOption(option: string): boolean {
    const targetAnswer = this.card.checkFrontText ? this.card.backText : this.card.frontText;
    return option === targetAnswer;
  }
}