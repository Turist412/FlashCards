import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { StudyCard } from '../../../../models/study-card.model';

@Component({
  selector: 'app-fill-blank',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fill-blank.component.html',
  styleUrl: './fill-blank.component.scss'
})
export class FillBlankComponent {
  @Input({ required: true }) card!: StudyCard;
  @Output() answerGiven = new EventEmitter<boolean>();

  userAnswer: string = '';
  isAnswerProcessed = false;
  isCorrect = false;

  get questionText(): string {
    return this.card.checkFrontText ? this.card.frontText : this.card.backText;
  }

  get correctAnswer(): string {
    return this.card.checkFrontText ? this.card.backText : this.card.frontText;
  }

  submitAnswer() {
    if (this.isAnswerProcessed || !this.userAnswer.trim()) return;

    this.isAnswerProcessed = true;

    const cleanUser = this.normalizeString(this.userAnswer);
    const cleanCorrect = this.normalizeString(this.correctAnswer);

    this.isCorrect = cleanUser === cleanCorrect;

    const delay = this.isCorrect ? 1500 : 3000; 

    setTimeout(() => {
      this.answerGiven.emit(this.isCorrect);
      this.resetState();
    }, delay);
  }

  private normalizeString(str: string): string {
    return str
      .trim()
      .toLowerCase()
      .normalize('NFKC'); 
  }

  private resetState() {
    this.userAnswer = '';
    this.isAnswerProcessed = false;
    this.isCorrect = false;
  }
}