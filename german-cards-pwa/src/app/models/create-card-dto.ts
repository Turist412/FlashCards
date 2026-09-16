import { CardLanguage } from './card-language';
import { GrammaticalGender } from './grammatical-gender';

export interface CreateCardDto {
  id?: string;
  frontText: string;
  backText: string;
  deckId: string;
  language: CardLanguage;
  gender: GrammaticalGender;
  plural?: string | null;
  pronunciation?: string | null;
}
