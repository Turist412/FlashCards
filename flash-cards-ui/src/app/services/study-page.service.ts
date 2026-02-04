import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuestionType } from '../models/enums.model';
import { StudyCard } from '../models/study-card.model';

@Injectable({
  providedIn: 'root'
})
export class StudyPageService {       
  private apiUrl = 'https://localhost:7112/api/study'; 

  constructor(private http: HttpClient) { }

  getCardsForStudySession(deckId: string | null, questionType: QuestionType, isSRS: boolean): Observable<StudyCard[]> {
    let params = new HttpParams()
        .set('questionType', questionType)
        .set('isSRS', isSRS.toString());
    
    if (deckId) {
        params = params.set('deckId', deckId);
    }
    return this.http.get<StudyCard[]>(this.apiUrl, { params });
  }

  processStudyResult(cardId: string, isCorrect: boolean): Observable<any> {
    const body = { 
        cardId: cardId, 
        isCorrect: isCorrect 
    };
    return this.http.put<any>(this.apiUrl, body); 
  }
}