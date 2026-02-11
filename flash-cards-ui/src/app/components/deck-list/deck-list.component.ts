import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DeckService } from '../../services/deck.service';
import { Deck } from '../../models/deck.model';
import { FormsModule } from '@angular/forms'; 
import { RouterModule, Router } from '@angular/router';
import { CardLanguage, QuestionType } from '../../models/enums.model';
import { ImportWordsService } from '../../services/import-words.service';

@Component({
  selector: 'app-deck-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './deck-list.component.html',
  styleUrls: ['./deck-list.component.scss']
})
export class DeckListComponent implements OnInit {
  decks: Deck[] = [];
  newDeckName = '';
  totalOverdueCards = 0; 

  isImportModalOpen = false;
  selectedFile: File | null = null;
  selectedLanguage: CardLanguage = CardLanguage.German;
  importMessage = '';
  isUploading = false;

  eLanguage = CardLanguage;
  
  constructor(private deckService: DeckService, private router: Router, private importWordsService: ImportWordsService) {}

  ngOnInit(): void {
    this.loadDecks();
  }

  startGlobalReview() {
  this.router.navigate(['/study'], { 
    queryParams: { 
      isSRS: true, 
      type: QuestionType.MultipleChoice 
    } 
  });
}

  loadDecks() {
    this.deckService.getAll().subscribe(data => {
      this.decks = data;
    });
  }

  createDeck() {
    if (!this.newDeckName.trim()) return;

    this.deckService.create({ name: this.newDeckName }).subscribe(newDeck => {
      this.decks.push(newDeck); 
      this.newDeckName = ''; 
    });
  }

  deleteDeck(deckId: string) {
    this.deckService.delete(deckId).subscribe(() => {
      this.decks = this.decks.filter(d => d.id !== deckId);
    });
  }


  openImportModal() {
    this.isImportModalOpen = true;
    this.importMessage = '';
    this.selectedFile = null;
  }

  closeImportModal() {
    this.isImportModalOpen = false;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      const name = file.name.toLowerCase();
      if (name.includes('.de.') || name.includes('german')) {
        this.selectedLanguage = CardLanguage.German;
      } else if (name.includes('.jp.') || name.includes('japanese')) {
        this.selectedLanguage = CardLanguage.Japanese;
      } else if (name.includes('.ru.') || name.includes('russian')) {
        this.selectedLanguage = CardLanguage.Russian;
      }
    }
  }

  uploadDictionary() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.importMessage = 'Загрузка...';

    this.importWordsService.uploadWords(this.selectedFile, this.selectedLanguage)
      .subscribe({
        next: (res: any) => {
          this.isUploading = false;
          this.importMessage = res.message || 'Успех! Слова добавлены.';          
          setTimeout(() => this.closeImportModal(), 2000);
        },
        error: (err) => {
          console.error(err);
          this.isUploading = false;
          
          if (typeof err.error === 'string') {
              this.importMessage = `Ошибка: ${err.error}`;
          } else {
              this.importMessage = 'Ошибка при загрузке. Проверьте консоль.';
          }
        }
      });
  }
}