import { ScryfallCard, DeckCard } from "@/types";

const SCRYFALL_BASE = "https://api.scryfall.com";
const HEADERS = {
  "User-Agent": "MinimalMTGBuilder/1.0",
  Accept: "application/json",
};

export async function searchCards(query: string): Promise<ScryfallCard[]> {
  if (!query) return [];
  try {
    // Fix: append order:usd so Scryfall prefers printings with price data
    const fullQuery = `${query} order:usd`;
    const res = await fetch(
      `${SCRYFALL_BASE}/cards/search?q=${encodeURIComponent(fullQuery)}`,
      { headers: HEADERS },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    console.error("searchCards failed:", e);
    return [];
  }
}

export async function getTopCards(): Promise<ScryfallCard[]> {
  try {
    const res = await fetch(
      `${SCRYFALL_BASE}/cards/search?q=f:commander&order=edhrec&dir=asc`,
      { headers: HEADERS },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data.slice(0, 50);
  } catch (e) {
    console.error("getTopCards failed:", e);
    return [];
  }
}

export async function getCardPrintings(
  oracleId: string,
): Promise<ScryfallCard[]> {
  try {
    const res = await fetch(
      `${SCRYFALL_BASE}/cards/search?order=released&q=oracleid:${oracleId}&unique=prints`,
      { headers: HEADERS },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    console.error("getCardPrintings failed:", e);
    return [];
  }
}

export async function backfillColorIdentity(cards: DeckCard[]): Promise<DeckCard[]> {
  const missing = cards.filter((c) => c.color_identity === undefined);
  if (missing.length === 0) return cards;

  const chunkSize = 75;
  const fetched = new Map<string, string[]>();

  for (let i = 0; i < missing.length; i += chunkSize) {
    const chunk = missing.slice(i, i + chunkSize);
    const identifiers = chunk.map((c) => ({ id: c.id }));
    try {
      const res = await fetch("https://api.scryfall.com/cards/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiers }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.data) {
        for (const card of data.data) {
          fetched.set(card.id, card.color_identity ?? []);
        }
      }
    } catch (e) {
      console.error("backfillColorIdentity failed:", e);
    }
  }

  return cards.map((c) =>
    c.color_identity === undefined && fetched.has(c.id)
      ? { ...c, color_identity: fetched.get(c.id)! }
      : c,
  );
}

export async function autocompleteCards(query: string): Promise<string[]> {
  if (query.length < 2) return [];
  try {
    const res = await fetch(
      `${SCRYFALL_BASE}/cards/autocomplete?q=${encodeURIComponent(query)}`,
      { headers: HEADERS },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getCardRulings(
  cardId: string,
): Promise<{ source: string; published_at: string; comment: string }[]> {
  try {
    const res = await fetch(`${SCRYFALL_BASE}/cards/${cardId}/rulings`, {
      headers: HEADERS,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    console.error("getCardRulings failed:", e);
    return [];
  }
}
