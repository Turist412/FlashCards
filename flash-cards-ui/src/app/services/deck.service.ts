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

  create(deck: CreateDeckDto): Observable<Deck> {
    return this.http.post<Deck>(this.apiUrl, deck);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}