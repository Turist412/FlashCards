import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { DeckService } from '../../services/deck.service';
import { Deck } from '../../models/deck.model';
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router';

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

  constructor(private deckService: DeckService) {}

  ngOnInit(): void {
    this.loadDecks();
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
}