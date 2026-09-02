import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CardService } from '../../../core/cards/card.service';
import { CardDto } from '../../../models/card-dto';
import { CardLanguage } from '../../../models/card-language';
import { CreateCardDto } from '../../../models/create-card-dto';
import { GrammaticalGender } from '../../../models/grammatical-gender';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="min-h-screen bg-stone-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div class="mx-auto max-w-2xl">
        <header class="mb-7 flex items-start justify-between gap-4">
          <div>
            <a routerLink="/decks" class="text-sm font-semibold text-teal-700 hover:text-teal-900">К колодам</a>
            <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">Карточки</h1>
            <p class="mt-2 text-base text-slate-600">Нажмите на карточку, чтобы увидеть перевод.</p>
          </div>
          <button class="shrink-0 rounded-lg bg-teal-700 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200" type="button" (click)="openCreateModal()">
            Добавить
          </button>
        </header>

        @if (errorMessage()) {
          <p class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">{{ errorMessage() }}</p>
        }

        @if (isLoading()) {
          <p class="py-12 text-center text-base text-slate-500">Загружаем карточки...</p>
        } @else if (cards().length) {
          <section class="grid gap-4 sm:grid-cols-2" aria-label="Карточки колоды">
            @for (card of cards(); track card.id) {
              <article class="min-h-56 cursor-pointer rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md" [class.bg-sky-50]="card.gender === genders.Masculine" [class.bg-rose-50]="card.gender === genders.Feminine" [class.bg-emerald-50]="card.gender === genders.Neuter" (click)="toggleFlip(card.id)">
                @if (flippedCards().has(card.id)) {
                  <div class="flex min-h-44 flex-col justify-between">
                    <p class="text-sm font-semibold uppercase tracking-widest text-slate-500">Перевод</p>
                    <h2 class="break-words text-2xl font-bold text-slate-950">{{ card.backText }}</h2>
                    <div class="flex justify-end gap-2">
                      <button class="rounded-lg p-3 text-slate-700 hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-teal-100" type="button" [attr.aria-label]="'Озвучить перевод ' + card.backText" (click)="speak($event, card.backText, languages.Russian)">Озвучить</button>
                      <button class="rounded-lg p-3 text-teal-800 hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-teal-100" type="button" [attr.aria-label]="'Редактировать ' + card.frontText" (click)="openEditModal(card, $event)">Изменить</button>
                      <button class="rounded-lg p-3 text-red-700 hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:text-red-300" type="button" [disabled]="deletingId() === card.id" [attr.aria-label]="'Удалить ' + card.frontText" (click)="deleteCard(card, $event)">Удалить</button>
                    </div>
                  </div>
                } @else {
                  <div class="flex min-h-44 flex-col justify-between">
                    <div>
                      <p class="text-sm font-semibold uppercase tracking-widest text-slate-500">{{ languageName(card.language) }}</p>
                      <h2 class="mt-3 break-words text-2xl font-bold text-slate-950">{{ card.frontText }}</h2>
                      @if (card.plural) { <p class="mt-2 text-base text-slate-600">мн. ч.: {{ card.plural }}</p> }
                      @if (card.pronunciation) { <p class="mt-2 text-base text-slate-600">{{ card.pronunciation }}</p> }
                    </div>
                    <div class="flex justify-end gap-2">
                      <button class="rounded-lg p-3 text-slate-700 hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-teal-100" type="button" [attr.aria-label]="'Озвучить ' + card.frontText" (click)="speak($event, card.frontText, card.language ?? languages.German)">Озвучить</button>
                      <button class="rounded-lg p-3 text-teal-800 hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-teal-100" type="button" [attr.aria-label]="'Редактировать ' + card.frontText" (click)="openEditModal(card, $event)">Изменить</button>
                      <button class="rounded-lg p-3 text-red-700 hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:text-red-300" type="button" [disabled]="deletingId() === card.id" [attr.aria-label]="'Удалить ' + card.frontText" (click)="deleteCard(card, $event)">Удалить</button>
                    </div>
                  </div>
                }
              </article>
            }
          </section>
        } @else {
          <section class="rounded-lg border-2 border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h2 class="text-xl font-bold text-slate-900">В колоде пока нет карточек</h2>
            <p class="mt-2 text-base leading-6 text-slate-600">Добавьте первое слово, чтобы начать учиться.</p>
          </section>
        }
      </div>
    </main>

    @if (isModalOpen()) {
      <div class="fixed inset-0 z-10 flex items-end bg-slate-950/40 sm:items-center sm:justify-center sm:p-6" (click)="closeModal()">
        <section class="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-lg sm:p-7" role="dialog" aria-modal="true" aria-labelledby="card-form-title" (click)="$event.stopPropagation()">
          <div class="mb-6 flex items-center justify-between gap-4">
            <h2 id="card-form-title" class="text-2xl font-bold text-slate-950">{{ editingCardId() ? 'Редактирование карточки' : 'Новая карточка' }}</h2>
            <button class="rounded-lg p-2 text-2xl leading-none text-slate-600 hover:bg-slate-100" type="button" aria-label="Закрыть" (click)="closeModal()">x</button>
          </div>
          <form class="space-y-5" (submit)="saveCard($event)">
            <label class="block text-base font-semibold text-slate-800">Язык
              <select class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base" [ngModel]="draft().language" (ngModelChange)="updateDraft('language', $event)" name="language">
                <option [ngValue]="languages.German">Немецкий</option>
                <option [ngValue]="languages.Japanese">Японский</option>
              </select>
            </label>
            <label class="block text-base font-semibold text-slate-800">Слово или фраза
              <input class="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base" [ngModel]="draft().frontText" (ngModelChange)="updateDraft('frontText', $event)" name="frontText" required />
            </label>
            <label class="block text-base font-semibold text-slate-800">Перевод
              <input class="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base" [ngModel]="draft().backText" (ngModelChange)="updateDraft('backText', $event)" name="backText" required />
            </label>
            @if (draft().language === languages.German) {
              <label class="block text-base font-semibold text-slate-800">Грамматический род
                <select class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base" [ngModel]="draft().gender" (ngModelChange)="updateDraft('gender', $event)" name="gender">
                  <option [ngValue]="genders.None">Не указан</option><option [ngValue]="genders.Masculine">Мужской (der)</option><option [ngValue]="genders.Feminine">Женский (die)</option><option [ngValue]="genders.Neuter">Средний (das)</option>
                </select>
              </label>
              <label class="block text-base font-semibold text-slate-800">Множественное число
                <input class="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base" [ngModel]="draft().plural" (ngModelChange)="updateDraft('plural', $event)" name="plural" />
              </label>
            } @else {
              <label class="block text-base font-semibold text-slate-800">Чтение
                <input class="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base" [ngModel]="draft().pronunciation" (ngModelChange)="updateDraft('pronunciation', $event)" name="pronunciation" />
              </label>
            }
            <div class="flex gap-3 pt-2">
              <button class="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50" type="button" (click)="closeModal()">Отмена</button>
              <button class="flex-1 rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:bg-teal-400" type="submit" [disabled]="isSaving()">{{ isSaving() ? 'Сохраняем...' : 'Сохранить' }}</button>
            </div>
          </form>
        </section>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardListComponent {
  private readonly cardService = inject(CardService);
  private readonly route = inject(ActivatedRoute);
  private readonly deckId = this.route.snapshot.paramMap.get('deckId') ?? '';

  readonly languages = CardLanguage;
  readonly genders = GrammaticalGender;
  readonly cards = signal<CardDto[]>([]);
  readonly flippedCards = signal<Set<string>>(new Set());
  readonly isLoading = signal(true);
  readonly isModalOpen = signal(false);
  readonly isSaving = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly editingCardId = signal<string | null>(null);
  readonly errorMessage = signal('');
  readonly draft = signal<CreateCardDto>(this.emptyDraft());

  constructor() {
    this.loadCards();
  }

  toggleFlip(cardId: string): void {
    this.flippedCards.update((flipped) => {
      const next = new Set(flipped);
      next.has(cardId) ? next.delete(cardId) : next.add(cardId);
      return next;
    });
  }

  openCreateModal(): void {
    this.editingCardId.set(null);
    this.draft.set(this.emptyDraft());
    this.isModalOpen.set(true);
  }

  openEditModal(card: CardDto, event: Event): void {
    event.stopPropagation();
    this.editingCardId.set(card.id);
    this.draft.set({ deckId: this.deckId, frontText: card.frontText, backText: card.backText, language: card.language ?? CardLanguage.German, gender: card.gender ?? GrammaticalGender.None, plural: card.plural, pronunciation: card.pronunciation });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isSaving.set(false);
  }

  updateDraft(field: keyof CreateCardDto, value: string | CardLanguage | GrammaticalGender): void {
    this.draft.update((draft) => ({ ...draft, [field]: value } as CreateCardDto));
  }

  saveCard(event: SubmitEvent): void {
    event.preventDefault();
    const card = this.draft();
    if (!card.frontText.trim() || !card.backText.trim() || this.isSaving()) return;
    this.isSaving.set(true);
    this.errorMessage.set('');
    const request = this.editingCardId() ? this.cardService.update(this.editingCardId()!, card) : this.cardService.create(card);
    request.subscribe({ next: (saved) => { this.cards.update((cards) => this.editingCardId() ? cards.map((card) => card.id === saved.id ? saved : card) : [...cards, saved]); this.closeModal(); }, error: () => { this.errorMessage.set('Не удалось сохранить карточку. Повторите попытку.'); this.isSaving.set(false); } });
  }

  deleteCard(card: CardDto, event: Event): void {
    event.stopPropagation();
    if (this.deletingId() || !confirm(`Удалить карточку «${card.frontText}»?`)) return;
    this.deletingId.set(card.id);
    this.cardService.delete(card.id).subscribe({ next: () => { this.cards.update((cards) => cards.filter(({ id }) => id !== card.id)); this.deletingId.set(null); }, error: () => { this.errorMessage.set('Не удалось удалить карточку. Повторите попытку.'); this.deletingId.set(null); } });
  }

  speak(event: Event, text: string, language: CardLanguage): void {
    event.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === CardLanguage.German ? 'de-DE' : language === CardLanguage.Japanese ? 'ja-JP' : 'ru-RU';
    window.speechSynthesis.speak(utterance);
  }

  languageName(language: CardLanguage | null | undefined): string { return language === CardLanguage.Japanese ? 'Японский' : 'Немецкий'; }

  private loadCards(): void {
    if (!this.deckId) { this.errorMessage.set('Не указана колода.'); this.isLoading.set(false); return; }
    this.cardService.getAll(this.deckId).subscribe({ next: (cards) => { this.cards.set(cards); this.isLoading.set(false); }, error: () => { this.errorMessage.set('Не удалось загрузить карточки. Повторите попытку.'); this.isLoading.set(false); } });
  }

  private emptyDraft(): CreateCardDto { return { deckId: this.deckId, frontText: '', backText: '', language: CardLanguage.German, gender: GrammaticalGender.None }; }
}