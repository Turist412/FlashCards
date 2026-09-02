import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'decks',
  },
  {
    path: 'decks',
    loadComponent: () =>
      import('./features/decks/deck-list/deck-list.component').then(
        (m) => m.DeckListComponent,
      ),
  },
  {
    path: 'decks/:deckId',
    loadComponent: () =>
      import('./features/cards/card-list/card-list.component').then(
        (m) => m.CardListComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
];
