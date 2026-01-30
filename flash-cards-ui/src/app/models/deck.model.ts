export interface Deck {
  id: string;
  name: string;
  createdAt: string;
  cardCount: number;
}

export interface CreateDeckDto {
  name: string;
}