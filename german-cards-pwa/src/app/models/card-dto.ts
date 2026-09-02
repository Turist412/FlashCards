import { CardLanguage } from './card-language';
import { GrammaticalGender } from './grammatical-gender';

export interface CardDto {
  id: string;
  deckId: string;
  frontText: string;
  backText: string;
  language?: CardLanguage | null;
  createdAt: string;
  reviewCount: number;
  nextReviewDate?: string | null;
  gender?: GrammaticalGender | null;
  plural?: string | null;
  pronunciation?: string | null;
}
