import { CardLanguage, GrammaticalGender } from './enums.model';

export interface Card {
  id: string;
  deckId: string;
  frontText: string;
  backText: string;
  createdAt: Date | string; 
  nextReviewDate: Date | string; 
  reviewCount: number;
  language: CardLanguage; 
  gender?: GrammaticalGender;       
  plural?: string;       
  pronunciation?: string;
}

export interface CreateCardDto {
  deckId: string;
  frontText: string;
  backText: string;
  language: CardLanguage;
  gender?: GrammaticalGender;
  plural?: string;
  pronunciation?: string;
}