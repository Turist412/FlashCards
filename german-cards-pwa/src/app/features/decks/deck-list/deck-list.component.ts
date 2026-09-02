import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DeckDto } from '../../../models/deck-dto';
import { DeckService } from '../../../core/decks/deck.service';

@Component({
  selector: 'app-deck-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="min-h-screen bg-stone-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div class="mx-auto max-w-2xl">
        <header class="mb-8">
          <p class="mb-2 text-sm font-semibold uppercase tracking-widest text-teal-700">German Cards</p>
          <h1 class="text-4xl font-bold tracking-tight text-slate-950">Мои колоды</h1>
          <p class="mt-3 text-lg leading-7 text-slate-600">Выберите колоду, чтобы продолжить обучение.</p>
        </header>

        <form class="mb-8 flex gap-3" (submit)="createDeck($event)">
          <label class="sr-only" for="deck-name">Название новой колоды</label>
          <input
            #deckName
            id="deck-name"
            class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-4 text-base shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            type="text"
            placeholder="Новая колода"
            [disabled]="isCreating()"
          />
          <button
            class="shrink-0 rounded-lg bg-teal-700 px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-teal-400"
            type="submit"
            [disabled]="isCreating()"
          >
            {{ isCreating() ? 'Создаём...' : 'Создать' }}
          </button>
        </form>

        @if (errorMessage()) {
          <p class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
            {{ errorMessage() }}
          </p>
        }

        @if (isLoading()) {
          <p class="py-12 text-center text-base text-slate-500">Загружаем колоды...</p>
        } @else if (decks().length) {
          <section class="space-y-3" aria-label="Список колод">
            @for (deck of decks(); track deck.id) {
              <article class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md">
                <a class="min-w-0 flex-1" [routerLink]="['/decks', deck.id]">
                  <h2 class="truncate text-xl font-bold text-slate-950">{{ deck.name }}</h2>
                  <p class="mt-2 text-base text-slate-600">{{ deck.cardCount }} {{ cardLabel(deck.cardCount) }}</p>
                </a>
                <button
                  class="shrink-0 rounded-lg p-3 text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:text-red-300"
                  type="button"
                  [attr.aria-label]="'Удалить колоду ' + deck.name"
                  title="Удалить колоду"
                  [disabled]="deletingId() === deck.id"
                  (click)="deleteDeck(deck)"
                >
                  <span aria-hidden="true" class="text-xl leading-none">×</span>
                </button>
              </article>
            }
          </section>
        } @else {
          <section class="rounded-lg border-2 border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h2 class="text-xl font-bold text-slate-900">Колоды пока нет</h2>
            <p class="mt-2 text-base leading-6 text-slate-600">Создайте первую колоду, чтобы начать добавлять карточки.</p>
          </section>
        }
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckListComponent {
  private readonly deckService = inject(DeckService);

  readonly decks = signal<DeckDto[]>([]);
  readonly isLoading = signal(true);
  readonly isCreating = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly errorMessage = signal('');

  constructor() {
    this.loadDecks();
  }

  createDeck(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const name = new FormData(form).get('deck-name')?.toString().trim();

    if (!name || this.isCreating()) {
      return;
    }

    this.isCreating.set(true);
    this.errorMessage.set('');
    this.deckService.create({ name }).subscribe({
      next: (deck) => {
        this.decks.update((decks) => [...decks, deck]);
        form.reset();
        this.isCreating.set(false);
      },
      error: () => {
        this.errorMessage.set('Не удалось создать колоду. Повторите попытку.');
        this.isCreating.set(false);
      },
    });
  }

  deleteDeck(deck: DeckDto): void {
    if (this.deletingId() || !confirm(`Удалить колоду «${deck.name}»?`)) {
      return;
    }

    this.deletingId.set(deck.id);
    this.errorMessage.set('');
    this.deckService.delete(deck.id).subscribe({
      next: () => {
        this.decks.update((decks) => decks.filter(({ id }) => id !== deck.id));
        this.deletingId.set(null);
      },
      error: () => {
        this.errorMessage.set('Не удалось удалить колоду. Повторите попытку.');
        this.deletingId.set(null);
      },
    });
  }

  cardLabel(count: number): string {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastDigit === 1 && lastTwoDigits !== 11) {
      return 'карточка';
    }

    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
      return 'карточки';
    }

    return 'карточек';
  }

  private loadDecks(): void {
    this.errorMessage.set('');
    this.deckService.getAll().subscribe({
      next: (decks) => {
        this.decks.set(decks);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Не удалось загрузить колоды. Повторите попытку.');
        this.isLoading.set(false);
      },
    });
  }
}