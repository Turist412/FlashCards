import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Deck, CreateDeckDto } from '../models/deck.model';

@Injectable({
  providedIn: 'root'
})
export class DeckService {

  private apiUrl = 'https://localhost:7112/api/decks'; 

  constructor(private http: HttpClient) { }

  getAll(): Observable<Deck[]> {
    return this.http.get<Deck[]>(this.apiUrl);
  }

  getById(deckId: string): Observable<Deck>{
    return this.http.get<Deck>(`${this.apiUrl}/${deckId}`);
  }

  create(deck: CreateDeckDto): Observable<Deck> {
    return this.http.post<Deck>(this.apiUrl, deck);
  }

  update(deckId: string, deck: CreateDeckDto): Observable<Deck> {
    return this.http.put<Deck>(`${this.apiUrl}/${deckId}`, deck);
  }

  delete(deckId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${deckId}`);
  }
}