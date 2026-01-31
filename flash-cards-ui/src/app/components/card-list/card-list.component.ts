import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'; 
import { CardService } from '../../services/card.service';
import { Card, CreateCardDto } from '../../models/card.model';
import { CardLanguage } from '../../models/enums.model';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.scss'
})
export class CardListComponent {
  cards: Card[] = [];
  deckId: string = '';

  editingCardId: string | null = null;

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

  saveCard() {
    if (!this.currentCard.frontText.trim() || !this.currentCard.backText.trim()) return;

    if (this.editingCardId) {
      this.cardService.update(this.editingCardId, this.currentCard).subscribe(updatedCard => {
        const index = this.cards.findIndex(c => c.id === this.editingCardId);
        if (index !== -1) {
          this.cards[index] = updatedCard;
        }
        this.resetForm();
      });
    } else {
      this.cardService.create(this.currentCard).subscribe(createdCard => {
        this.cards.push(createdCard);
        this.resetForm();
      });
    }
  }

  startEdit(card: Card) {
    this.editingCardId = card.id;

    this.currentCard = {
      deckId: card.deckId,
      frontText: card.frontText,
      backText: card.backText,
      language: card.language,
      gender: card.gender,
      pluralForm: card.pluralForm,
      pronunciation: card.pronunciation,
       
    };
  }

  deleteCard(cardId: string) {
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
