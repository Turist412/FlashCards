import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Важно для *ngFor
import { DeckService } from '../../services/deck.service';
import { Deck } from '../../models/deck.model';
import { FormsModule } from '@angular/forms'; // Для инпута создания

@Component({
  selector: 'app-deck-list',
  standalone: true,
  imports: [CommonModule, FormsModule], // <--- Импортируем модули сюда
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
      this.decks.push(newDeck); // Добавляем в список сразу, без перезагрузки
      this.newDeckName = ''; // Чистим поле
    });
  }

  deleteDeck(id: string) {
    this.deckService.delete(id).subscribe(() => {
      // Удаляем из списка на экране
      this.decks = this.decks.filter(d => d.id !== id);
    });
  }
}