import { Component, EventEmitter, Input, Optional, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyCard } from '../../../../models/study-card.model';

@Component({
  selector: 'app-true-false',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './true-false.component.html',
  styleUrl: './true-false.component.scss'
})
export class TrueFalseComponent {
  @Input({ required: true }) card!: StudyCard;
  @Output() answerGiven = new EventEmitter<boolean>();

  isAnswerProcessed = false;
  userChoice: boolean | null = null; 
  wasLastAnswerCorrect = false;

  get questionText(): string {
    return this.card.checkFrontText ? this.card.frontText : this.card.backText;
  }

  onChoice(userSaidTrue: boolean) {
    if (this.isAnswerProcessed) return;

    this.isAnswerProcessed = true;
    this.userChoice = userSaidTrue;

    const realAnswer = this.card.checkFrontText ? this.card.backText : this.card.frontText;

    const isPropositionCorrect = this.card.displayedBackText === realAnswer;

    const isUserCorrect = (userSaidTrue === isPropositionCorrect);

    this.wasLastAnswerCorrect = isUserCorrect;

    setTimeout(() => {
      this.answerGiven.emit(isUserCorrect);
      this.resetState();
    }, 1000);
  }

  resetState() {
    this.isAnswerProcessed = false;
    this.userChoice = null;
  }
}