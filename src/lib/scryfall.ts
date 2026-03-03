import { ScryfallCard } from "@/types";

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
