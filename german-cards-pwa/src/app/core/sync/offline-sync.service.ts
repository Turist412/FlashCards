import { Injectable, inject } from '@angular/core';
import { Observable, catchError, concatMap, defer, from, lastValueFrom, map, of } from 'rxjs';

import { CardDto } from '../../models/card-dto';
import { CreateCardDto } from '../../models/create-card-dto';
import { CreateDeckDto } from '../../models/create-deck-dto';
import { DeckDto } from '../../models/deck-dto';
import { CardService } from '../cards/card.service';
import { DeckService } from '../decks/deck.service';

type PendingOperation = PendingDeckOperation | PendingCardOperation;

interface PendingOperationBase {
  id: string;
  status: 'pending';
  createdAt: number;
}

interface PendingDeckOperation extends PendingOperationBase {
  type: 'deck';
  payload: CreateDeckDto;
}

interface PendingCardOperation extends PendingOperationBase {
  type: 'card';
  payload: CreateCardDto;
}

@Injectable({ providedIn: 'root' })
export class OfflineSyncService {
  private readonly cardService = inject(CardService);
  private readonly deckService = inject(DeckService);
  private syncInProgress = false;

  initialize(): void {
    window.addEventListener('online', () => void this.syncPending());
    if (navigator.onLine) {
      void this.syncPending();
    }
  }

  createDeck(deck: CreateDeckDto): Observable<DeckDto> {
    const payload = { ...deck, id: deck.id ?? crypto.randomUUID() };
    if (!navigator.onLine) {
      return this.queueOperation({ type: 'deck', payload }).pipe(map(() => this.toLocalDeck(payload)));
    }

    return this.deckService.create(payload).pipe(
      catchError((error) => error.status === 0
        ? this.queueOperation({ type: 'deck', payload }).pipe(map(() => this.toLocalDeck(payload)))
        : defer(() => { throw error; })),
    );
  }

  createCard(card: CreateCardDto): Observable<CardDto> {
    const payload = { ...card, id: card.id ?? crypto.randomUUID() };
    if (!navigator.onLine) {
      return this.queueOperation({ type: 'card', payload }).pipe(map(() => this.toLocalCard(payload)));
    }

    return this.cardService.create(payload).pipe(
      catchError((error) => error.status === 0
        ? this.queueOperation({ type: 'card', payload }).pipe(map(() => this.toLocalCard(payload)))
        : defer(() => { throw error; })),
    );
  }

  async syncPending(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;
    try {
      const operations = await this.getPendingOperations();
      const ordered = [...operations.filter(({ type }) => type === 'deck'), ...operations.filter(({ type }) => type === 'card')];
      for (const operation of ordered) {
        try {
          if (operation.type === 'deck') {
            await lastValueFrom(this.deckService.create(operation.payload));
          } else {
            await lastValueFrom(this.cardService.create(operation.payload));
          }
          await this.deleteOperation(operation.id);
        } catch {
          break;
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private queueOperation(operation: Omit<PendingOperation, 'id' | 'status' | 'createdAt'>): Observable<void> {
    const record: PendingOperation = {
      ...operation,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: Date.now(),
    } as PendingOperation;
    return from(this.withStore('readwrite', (store) => store.add(record))).pipe(map(() => undefined));
  }

  private getPendingOperations(): Promise<PendingOperation[]> {
    return this.withStore('readonly', (store) => store.getAll()).then((operations) =>
      (operations as PendingOperation[])
        .filter(({ status }) => status === 'pending')
        .sort((first, second) => first.createdAt - second.createdAt),
    );
  }

  private deleteOperation(id: string): Promise<void> {
    return this.withStore('readwrite', (store) => store.delete(id)).then(() => undefined);
  }

  private withStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('flashcards-offline', 1);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => request.result.createObjectStore('pending-operations', { keyPath: 'id' });
      request.onsuccess = () => {
        const transaction = request.result.transaction('pending-operations', mode);
        const operation = action(transaction.objectStore('pending-operations'));
        operation.onerror = () => reject(operation.error);
        operation.onsuccess = () => resolve(operation.result);
      };
    });
  }

  private toLocalDeck(deck: CreateDeckDto): DeckDto {
    return { id: deck.id!, name: deck.name, createdAt: new Date().toISOString(), cardCount: 0 };
  }

  private toLocalCard(card: CreateCardDto): CardDto {
    return { ...card, id: card.id!, createdAt: new Date().toISOString(), reviewCount: 0, nextReviewDate: null };
  }
}