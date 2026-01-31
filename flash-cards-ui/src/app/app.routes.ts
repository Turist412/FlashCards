import { Routes } from '@angular/router';
import { DeckListComponent } from './components/deck-list/deck-list.component';
import { CardListComponent } from './components/card-list/card-list.component';

export const routes: Routes = [
    { path: '', component: DeckListComponent }, 
    { path: 'decks/:id', component: CardListComponent } 
];
