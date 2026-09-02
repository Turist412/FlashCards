import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CreateDeckDto } from '../../models/create-deck-dto';
import { DeckDto } from '../../models/deck-dto';

@Injectable({ providedIn: 'root' })
export class DeckService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/decks`;

  getAll(): Observable<DeckDto[]> {
    return this.http.get<DeckDto[]>(`${this.apiUrl}/`);
  }

  create(deck: CreateDeckDto): Observable<DeckDto> {
    return this.http.post<DeckDto>(`${this.apiUrl}/`, deck);
  }

  delete(deckId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${deckId}`);
  }
}