import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CardDto } from '../../models/card-dto';
import { CreateCardDto } from '../../models/create-card-dto';

@Injectable({ providedIn: 'root' })
export class CardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/cards`;

  getAll(deckId: string): Observable<CardDto[]> {
    return this.http.get<CardDto[]>(this.apiUrl, {
      params: new HttpParams().set('deckId', deckId),
    });
  }

  create(card: CreateCardDto): Observable<CardDto> {
    return this.http.post<CardDto>(this.apiUrl, card);
  }

  update(cardId: string, card: CreateCardDto): Observable<CardDto> {
    return this.http.put<CardDto>(`${this.apiUrl}/${cardId}`, card);
  }

  delete(cardId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cardId}`);
  }
}