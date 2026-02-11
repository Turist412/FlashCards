import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardLanguage } from '../models/enums.model';

@Injectable({ providedIn: 'root' })
export class ImportWordsService {
  private apiUrl = 'https://localhost:7112/api/importdictionarywords';

  constructor(private http: HttpClient) {}

  uploadWords(file: File, language: CardLanguage) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language.toString());

    return this.http.post(this.apiUrl + '/upload-words', formData);
  }
}