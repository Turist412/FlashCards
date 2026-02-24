import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardLanguage } from '../models/enums.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImportWordsService {
  private apiUrl = `${environment.apiUrl}/importdictionarywords`;

  constructor(private http: HttpClient) {}

  uploadWords(file: File, language: CardLanguage) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language.toString());

    return this.http.post(this.apiUrl + '/upload-words', formData);
  }
}