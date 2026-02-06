import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyCard } from '../../../../models/study-card.model';

@Component({
  selector: 'app-multiple-choice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiple-choice.component.html',
  styleUrl: './multiple-choice.component.scss'
})
export class MultipleChoiceComponent {
  @Input({ required: true }) card!: StudyCard;
  
  @Output() answerGiven = new EventEmitter<boolean>();

  selectedOption: string | null = null;
  isAnswerProcessed = false; 

  get questionText(): string {
    return this.card.checkFrontText ? this.card.frontText : this.card.backText;
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