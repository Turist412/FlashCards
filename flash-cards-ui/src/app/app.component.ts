import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeckListComponent } from './components/deck-list/deck-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    DeckListComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'flash-cards-ui';
}
