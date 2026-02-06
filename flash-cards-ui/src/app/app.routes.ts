import { Routes } from '@angular/router';
import { DeckListComponent } from './components/deck-list/deck-list.component';
import { CardListComponent } from './components/card-list/card-list.component';
import { StudyPageComponent } from './features/study-session/study-page/study-page.component';

export const routes: Routes = [
    { path: '', component: DeckListComponent }, 
    { path: 'decks/:id', component: CardListComponent },
    { path: 'study', component: StudyPageComponent },     
    { path: 'study/:id', component: StudyPageComponent },

];
