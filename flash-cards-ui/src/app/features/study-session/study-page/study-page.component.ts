import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudyCard } from '../../study-card.model';
import { QuestionType } from '../enums.model';
import { StudyPageService } from '../../services/study-page.service';


import { MultipleChoiceComponent } from './components/multiple-choice/multiple-choice.component';
import { TrueFalseComponent } from './components/true-false/true-false.component';
import { FillBlankComponent } from './components/fill-blank/fill-blank.component'; 

@Component({
  selector: 'app-study-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    MultipleChoiceComponent,
    TrueFalseComponent,
    FillBlankComponent 
  ],
  templateUrl: './study-page.component.html',
  styleUrl: './study-page.component.scss'
})
export class StudyPageComponent implements OnInit {
  
  // Состояние сессии
  cards: StudyCard[] = [];
  currentIndex = 0;
  isLoading = true;
  isFinished = false;

  // Ссылка на Enum для использования в HTML шаблоне
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
    this.isLoading = true;

    // 1. Получаем параметры из URL
    // Например: /study/deck-id-123?mode=srs
    const deckId = this.route.snapshot.paramMap.get('id'); // Если роут /study/:id
    
    // Читаем QueryParams для настроек (если есть)
    // По умолчанию: SRS режим, Тип вопросов - Тест (но бэкенд может смешать, если доработаем)
    const isSRS = this.route.snapshot.queryParamMap.get('isSRS') !== 'false'; 
    
    // Пока запрашиваем MultipleChoice как базу, но если карта придет с другим типом 
    // (логика бэкенда), наш ngSwitch это обработает.
    this.studyService.getCardsForStudySession(deckId, QuestionType.MultipleChoice, isSRS)
      .subscribe({
        next: (data) => {
          this.cards = data;
          this.isLoading = false;
          
          // Если карт нет, сразу показываем финиш или сообщение
          if (this.cards.length === 0) {
            this.isFinished = true;
          }
        },
        error: (err) => {
          console.error('Ошибка загрузки сессии:', err);
          this.isLoading = false;
          alert('Не удалось загрузить карты. Попробуйте позже.');
          this.router.navigate(['/']); // Возврат домой при ошибке
        }
      });
  }

  // Метод, который вызывается, когда "Глупый" компонент сообщает результат
  handleAnswer(isCorrect: boolean) {
    if (this.currentIndex >= this.cards.length) return;

    const currentCard = this.cards[this.currentIndex];

    // 1. Отправляем результат на сервер (Fire and Forget)
    // Нам не обязательно ждать ответа от сервера, чтобы показать следующую карту
    this.studyService.processStudyResult(currentCard.id, isCorrect).subscribe({
        error: e => console.error('Ошибка сохранения прогресса', e)
    });

    // 2. Логика перехода
    if (this.currentIndex < this.cards.length - 1) {
      // Небольшая задержка не нужна здесь, так как задержка уже есть 
      // внутри глупого компонента (перед emit события).
      // Тут мы просто переключаем данные.
      this.currentIndex++;
    } else {
      this.isFinished = true;
    }
  }

  // Геттеры для удобства шаблона
  get currentCard(): StudyCard {
    return this.cards[this.currentIndex];
  }

  get progressPercent(): number {
    if (!this.cards.length) return 0;
    return ((this.currentIndex) / this.cards.length) * 100;
  }
}