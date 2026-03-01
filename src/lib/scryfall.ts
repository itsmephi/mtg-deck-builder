import { ScryfallCard } from '@/types';

const SCRYFALL_BASE = 'https://api.scryfall.com';
const HEADERS = {
  'User-Agent': 'MinimalMTGBuilder/1.0',
  'Accept': 'application/json',
};

export async function searchCards(query: string): Promise<ScryfallCard[]> {
  if (!query) return [];
  const res = await fetch(`${SCRYFALL_BASE}/cards/search?q=${encodeURIComponent(query)}`, { headers: HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function getTopCards(): Promise<ScryfallCard[]> {
  // Scryfall doesn't have a strict "trending" endpoint, so we use EDHREC rank as a proxy for popularity
  const res = await fetch(`${SCRYFALL_BASE}/cards/search?q=f:commander&order=edhrec&dir=asc`, { headers: HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data.slice(0, 50); // Return top 50
}

export async function getCardPrintings(oracleId: string): Promise<ScryfallCard[]> {
  const res = await fetch(`${SCRYFALL_BASE}/cards/search?order=released&q=oracleid:${oracleId}&unique=prints`, { headers: HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function getCardRulings(cardId: string): Promise<{ source: string; published_at: string; comment: string }[]> {
  const res = await fetch(`${SCRYFALL_BASE}/cards/${cardId}/rulings`, { headers: HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}