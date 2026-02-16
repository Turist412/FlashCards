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

  constructor(
    private studyPageService: StudyPageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.startSession();
  }

  startSession() {
    this.currentIndex = 0;
    this.isFinished = false; 
    this.cards = [];       
    this.isLoading = true;

    const deckId = this.route.snapshot.paramMap.get('id'); 
    
    const params = this.route.snapshot.queryParamMap;
    
    this.isSRS = params.get('isSRS') === 'true'; 
    
    const typeParam = params.get('type');
    const questionType = typeParam ? Number(typeParam) : QuestionType.MultipleChoice;

    console.log(`Запуск сессии: Deck=${deckId}, Type=${questionType}, SRS=${this.isSRS}`);

    this.studyPageService.getCardsForStudySession(deckId, questionType, this.isSRS)
      .subscribe({
        next: (data) => {
          this.cards = data;
          this.isLoading = false;
          if (this.cards.length === 0) this.isFinished = true;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
}

  handleAnswer(isCorrect: boolean) {
    if (this.currentIndex >= this.cards.length) return;

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

  get currentCard(): StudyCard {
    return this.cards[this.currentIndex];
  }

  get progressPercent(): number {
    if (!this.cards.length) return 0;
    return ((this.currentIndex) / this.cards.length) * 100;
  }
}