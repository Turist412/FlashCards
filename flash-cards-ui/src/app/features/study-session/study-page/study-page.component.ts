import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudyPageService } from '../../../services/study-page.service';
import { StudyCard} from '../../../models/study-card.model';
import { QuestionType } from '../../../models/enums.model';
import { MultipleChoiceComponent } from '../components/multiple-choice/multiple-choice.component';
import { TrueFalseComponent } from '../components/true-false/true-false.component';
import { FillBlankComponent } from '../components/fill-blank/fill-blank.component'; 
import { MultipleGrammarComponent } from '../components/multiple-grammar/multiple-grammar.component';
import { VoiceMultipleChoiceComponent } from '../components/voice-multiple-choice/voice-multiple-choice.component';

@Component({
  selector: 'app-study-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    MultipleChoiceComponent,
    TrueFalseComponent,
    FillBlankComponent,
    MultipleGrammarComponent,
    VoiceMultipleChoiceComponent 
  ],
  templateUrl: './study-page.component.html',
  styleUrl: './study-page.component.scss'
})
export class StudyPageComponent implements OnInit {
  
  cards: StudyCard[] = [];
  currentIndex = 0;
  isLoading = true;
  isFinished = false;

  isSRS = false;
  eQuestionType = QuestionType;

  answerHistory: (boolean | undefined)[] = [];

  constructor(
    private studyPageService: StudyPageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get correctAnswersCount(): number {
    return this.answerHistory.filter(result => result === true).length;
  }

  get incorrectAnswersCount(): number {
    return this.answerHistory.filter(result => result === false).length;
  }

  ngOnInit(): void {
    this.startSession();
  }

  startSession() {
    this.currentIndex = 0;
    this.isFinished = false; 
    this.cards = [];       
    this.isLoading = true;

    const queryParams = this.route.snapshot.queryParamMap;
    const mode = queryParams.get('mode');

    if (mode === 'numbers') {
        this.isSRS = false; 

        const min = Number(queryParams.get('min')) || 1;
        const max = Number(queryParams.get('max')) || 1000;
        const count = Number(queryParams.get('count')) || 20;
        const lang = Number(queryParams.get('lang')); 
        const isAudioMode = queryParams.get('audio') === 'true';

        console.log(`Запуск тренажера чисел: Min=${min}, Max=${max}, Count=${count}, Lang=${lang}, Audio=${isAudioMode}`);

        this.studyPageService.getNumbersStudySession(min, max, count, lang, isAudioMode)
          .subscribe({
            next: (data) => this.handleDataSuccess(data),
            error: (err) => this.handleDataError(err)
          });
    } 
    else {
        const deckId = this.route.snapshot.paramMap.get('id'); 
        this.isSRS = queryParams.get('isSRS') === 'true'; 
        
        const typeParam = queryParams.get('type');
        const questionType = typeParam ? Number(typeParam) : QuestionType.MultipleChoice;

        console.log(`Запуск сессии: Deck=${deckId}, Type=${questionType}, SRS=${this.isSRS}`);

        this.studyPageService.getCardsForStudySession(deckId, questionType, this.isSRS)
          .subscribe({
            next: (data) => this.handleDataSuccess(data),
            error: (err) => this.handleDataError(err)
          });
    }
  }

  private handleDataSuccess(data: StudyCard[]) {
      this.cards = data;
      this.answerHistory = new Array(this.cards.length).fill(undefined);
      this.isLoading = false;
      if (this.cards.length === 0) this.isFinished = true;
  }

  private handleDataError(err: any) {
      console.error('Ошибка загрузки карточек:', err);
      this.isLoading = false;
  }

  handleAnswer(isCorrect: boolean) {
    if (this.currentIndex >= this.cards.length) return;

    this.answerHistory[this.currentIndex] = isCorrect;

    if (this.isSRS) {
        const currentCard = this.cards[this.currentIndex];
        this.studyPageService.processStudyResult(currentCard.id, isCorrect).subscribe({
            error: e => console.error('Ошибка сохранения прогресса', e)
        });
    }

    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
    } else {
      this.isFinished = true;
    }
}

  private shuffleArray(array: string[]): string[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

retryIncorrect() {
    const incorrectCards = this.cards.filter((_, index) => this.answerHistory[index] === false);
    
    if (incorrectCards.length > 0) {
      this.isSRS = false; 

      this.cards = incorrectCards.map(card => {
        const clonedCard = { ...card };
        
        if (clonedCard.possibleAnswers && clonedCard.possibleAnswers.length > 0) {
           clonedCard.possibleAnswers = this.shuffleArray(clonedCard.possibleAnswers);
        }
        
        // Опционально: можно инвертировать вопрос (спрашивать перевод вместо оригинала)
        // clonedCard.checkFrontText = !clonedCard.checkFrontText;

        return clonedCard;
      });
      
      this.answerHistory = new Array(this.cards.length).fill(undefined);
      this.currentIndex = 0;
      this.isFinished = false;
    }
  }

  get currentCard(): StudyCard {
    return this.cards[this.currentIndex];
  }
}