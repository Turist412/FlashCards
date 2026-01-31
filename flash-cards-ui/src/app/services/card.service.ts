import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card, CreateCardDto } from '../models/card.model';
@Injectable({
  providedIn: 'root'
})
export class CardService {

  private apiUrl = 'https://localhost:7112/api/cards'; 

  constructor(private http: HttpClient) { }

  getAll(deckId: string): Observable<Card[]> {
    let params = new HttpParams().set('deckId', deckId);
    return this.http.get<Card[]>(this.apiUrl, { params });
  }

  getById(cardId: string): Observable<Card> {
    return this.http.get<Card>(`${this.apiUrl}/${cardId}`);
  }

  create(card: CreateCardDto): Observable<Card> {
    return this.http.post<Card>(this.apiUrl, card);
  }

  update(cardId: string, card: CreateCardDto): Observable<Card> {
    return this.http.put<Card>(`${this.apiUrl}/${cardId}`, card);
  }

  delete(cardId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cardId}`);
  }
}