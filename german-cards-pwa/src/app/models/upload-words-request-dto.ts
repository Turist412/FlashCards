import { CardLanguage } from './card-language';

export interface UploadWordsRequestDto {
  file: File;
  language: CardLanguage;
}
