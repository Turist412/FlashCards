import { CardLanguage } from './card-language';
import { GrammaticalGender } from './grammatical-gender';
import { QuestionType } from './question-type';

export interface StudyCardDto {
  id: string;
  deckId: string;
  frontText: string;
  backText: string;
  displayedBackText: string;
  language?: CardLanguage | null;
  gender?: GrammaticalGender | null;
  plural?: string | null;
  pronunciation?: string | null;
  questionType: QuestionType;
  checkFrontText: boolean;
  possibleAnswers: string[];
}
