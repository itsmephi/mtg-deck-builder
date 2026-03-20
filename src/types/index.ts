export interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  set_name: string;
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
  card_faces?: {
    name: string;
    mana_cost: string;
    type_line: string;
    oracle_text: string;
    flavor_text?: string;
    artist?: string;
    image_uris?: {
      normal: string;
      large: string;
    };
  }[];
  oracle_text?: string;
  flavor_text?: string;
  rarity: string;
  collector_number: string;
  artist?: string;
  mana_cost?: string;
  cmc?: number;
  color_identity?: string[];
  released_at?: string;
}

export interface DeckCard extends ScryfallCard {
  quantity: number;
  ownedQty: number;
}

export interface Deck {
  id: string;
  name: string;
  cards: DeckCard[];
  sideboard?: DeckCard[];
  format: "freeform" | "standard" | "commander";
  commanderId?: string;
}
