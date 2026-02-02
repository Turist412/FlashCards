import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router'; 
import { CardService } from '../../services/card.service';
import { Card, CreateCardDto } from '../../models/card.model';
import { CardLanguage, GrammaticalGender } from '../../models/enums.model';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.scss'
})
export class CardListComponent implements OnInit {
  cards: Card[] = [];
  deckId: string = '';

  editingCardId: string | null = null;

  flippedCards = new Set<string>();

  isModalOpen = false;

  eLanguage = CardLanguage;
  eGender = GrammaticalGender;

  currentCard: CreateCardDto = {
    deckId: '',
    frontText: '',
    backText: '',
    language: CardLanguage.German //default value
  };

  constructor(private cardService: CardService,
              private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.deckId = this.route.snapshot.paramMap.get('id') || '';

    this.currentCard.deckId = this.deckId;
    if(this.deckId){
      this.loadAllCards(this.deckId);
    }
  }

  loadAllCards(deckId: string) {
    this.cardService.getAll(deckId).subscribe(data => {
      this.cards = data;
    });
  }

  toggleFlip(cardId: string) {
    if (this.flippedCards.has(cardId)) {
      this.flippedCards.delete(cardId);
    } else {
      this.flippedCards.add(cardId);
    }
  }

  isFlipped(cardId: string): boolean {
    return this.flippedCards.has(cardId);
  }

  getGenderClass(card: Card): string {
    if (card.language !== CardLanguage.German) return 'default-card';
    
    switch (card.gender) {
      case GrammaticalGender.Masculine: return 'male-card';     // Blue
      case GrammaticalGender.Feminine: return 'female-card'; // Red
      case GrammaticalGender.Neuter: return 'neuter-card'; // Green
      default: return 'default-card';
    }
  }


  saveCard() {
    if (!this.currentCard.frontText.trim() || !this.currentCard.backText.trim()) return;

    if (this.editingCardId) {
      this.cardService.update(this.editingCardId, this.currentCard).subscribe(updatedCard => {
        const index = this.cards.findIndex(c => c.id === this.editingCardId);
        if (index !== -1) this.cards[index] = updatedCard;
        this.closeModal(); 
      });
    } else {
      this.cardService.create(this.currentCard).subscribe(createdCard => {
        this.cards.push(createdCard);
        this.closeModal(); 
      });
    }
  }


  openCreateModal() {
    this.resetForm(); 
    this.isModalOpen = true;
  }


  startEdit(card: Card, event: Event) {
    event.stopPropagation();
    
    this.editingCardId = card.id;

    this.currentCard = {
      deckId: card.deckId,
      frontText: card.frontText,
      backText: card.backText,
      language: card.language,
      gender: card.gender,
      plural: card.plural,
      pronunciation: card.pronunciation,       
    };

    this.isModalOpen = true;
  }
  
  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }


  deleteCard(cardId: string, event: Event) {
    event.stopPropagation();
    if(confirm('Confirm delete?')) {
        this.cardService.delete(cardId).subscribe(() => {
          this.cards = this.cards.filter(c => c.id !== cardId);
          if (this.editingCardId === cardId) {
            this.resetForm(); 
          }
        }); 
    }
  }

  resetForm() {
    this.editingCardId = null;
    this.currentCard = {
      deckId: this.deckId, 
      frontText: '',
      backText: '',
      language: this.currentCard.language 
    };
  }
}
