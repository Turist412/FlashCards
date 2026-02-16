import { CardLanguage, GrammaticalGender, QuestionType } from "./enums.model";

export interface StudyCard {
  id: string;
  deckId: string;  
  frontText: string;
  backText: string;
  displayedBackText?: string;   
  language: CardLanguage;
  gender?: GrammaticalGender;
  plural?: string;           
  pronunciation?: string;  
  questionType: QuestionType;
  checkFrontText: boolean;   // true =  Front  
  possibleAnswers: string[];
}