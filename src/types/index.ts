export interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  image_uris?: {
    normal: string;
    large: string;
  };
  prices: {
    usd: string | null;
  };
  legalities: Record<string, string>;
  oracle_id: string;
  type_line: string;
  // Add support for double-faced cards
  card_faces?: {
    name: string;
    mana_cost: string;
    type_line: string;
    oracle_text: string;
    artist?: string;
    image_uris?: {
      normal: string;
      large: string;
    };
  }[];
  oracle_text?: string;
  rarity: string;
  collector_number: string;
  artist?: string;
  mana_cost?: string;
}

export interface DeckCard extends ScryfallCard {
  quantity: number;
  isOwned: boolean;
}

export interface Deck {
  id: string;
  name: string;
  cards: DeckCard[];
}