import { CardLanguage } from './card-language';
import { GrammaticalGender } from './grammatical-gender';

export interface CreateCardDto {
  frontText: string;
  backText: string;
  deckId: string;
  language: CardLanguage;
  gender: GrammaticalGender;
  plural?: string | null;
  pronunciation?: string | null;
}
