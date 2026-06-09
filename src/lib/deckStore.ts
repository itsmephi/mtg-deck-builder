// Deck persistence layer.
//
// `DeckProvider` keeps the local-only flow it always had (the whole `decks`
// array is mirrored to localStorage on change). This module adds the *cloud*
// half: a per-deck Supabase store plus the shared migration/mapping helpers.
// When signed out, only the local helpers are used; when signed in, the
// provider diffs deck changes and upserts/removes them through `SupabaseDeckStore`.
//
// Cards/sideboard/commanderIds are stored as JSONB blobs that mirror the
// in-app `Deck` shape almost 1:1 (see the spec for why we don't normalize).

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Deck, DeckCard } from "@/types";

export const LOCAL_STORAGE_KEY = "mtg_builder_decks";

/**
 * Normalize stored/loaded decks to the current shape. Handles legacy saves:
 * commanderId → commanderIds, boolean isOwned → ownedQty, backfill isOwned.
 * Safe to run on both local and cloud data.
 */
export function migrateDecks(rawDecks: unknown[]): Deck[] {
  return rawDecks.map((raw): Deck => {
    const deck = raw as Record<string, unknown> & {
      commanderId?: string;
      commanderIds?: string[];
      format?: Deck["format"];
      cards?: unknown[];
    };
    const commanderIds: string[] | undefined =
      deck.commanderIds ?? (deck.commanderId ? [deck.commanderId] : undefined);
    return {
      ...(deck as unknown as Deck),
      format: deck.format ?? "freeform",
      commanderIds,
      cards: (deck.cards ?? []).map((raw): DeckCard => {
        const card = raw as Record<string, unknown> & {
          ownedQty?: number;
          isOwned?: boolean;
          quantity?: number;
        };
        const ownedQty =
          card.ownedQty !== undefined
            ? card.ownedQty
            : card.isOwned
              ? (card.quantity ?? 0)
              : 0;
        const isOwned =
          typeof card.isOwned === "boolean" ? card.isOwned : ownedQty > 0;
        return { ...(card as unknown as DeckCard), ownedQty, isOwned };
      }),
    };
  });
}

/** Read + migrate the local deck cache. Returns [] when absent or corrupt. */
export function loadLocalDecks(): Deck[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    return migrateDecks(parsed);
  } catch {
    return [];
  }
}

// ─── Cloud row mapping ───────────────────────────────────────────────────────

// Row shape in the `decks` table. `sideboard` and `commander_ids` are nullable:
// SQL null preserves the meaningful "no sideboard enabled" / "no commander"
// distinction (vs. an empty array, which means enabled-but-empty).
interface DeckRow {
  id: string;
  user_id: string;
  name: string;
  format: string;
  commander_ids: string[] | null;
  cards: Deck["cards"];
  sideboard: Deck["cards"] | null;
  updated_at: string;
}

function deckToRow(deck: Deck, userId: string): DeckRow {
  return {
    id: deck.id,
    user_id: userId,
    name: deck.name ?? "",
    format: deck.format ?? "freeform",
    commander_ids: deck.commanderIds ?? null,
    cards: deck.cards ?? [],
    sideboard: deck.sideboard ?? null,
    updated_at: new Date().toISOString(),
  };
}

function rowToDeck(row: DeckRow): Deck {
  return {
    id: row.id,
    name: row.name,
    format: (row.format as Deck["format"]) ?? "freeform",
    commanderIds: row.commander_ids ?? undefined,
    cards: row.cards ?? [],
    // null/undefined → no sideboard; an array (incl. []) → sideboard enabled.
    sideboard: row.sideboard ?? undefined,
  };
}

// ─── Stores ──────────────────────────────────────────────────────────────────

export interface DeckStore {
  loadAll(): Promise<Deck[]>;
  upsert(deck: Deck): Promise<void>;
  remove(deckId: string): Promise<void>;
}

export class SupabaseDeckStore implements DeckStore {
  constructor(
    private client: SupabaseClient,
    private userId: string,
  ) {}

  async loadAll(): Promise<Deck[]> {
    const { data, error } = await this.client
      .from("decks")
      .select("*")
      .eq("user_id", this.userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return migrateDecks((data ?? []).map((row) => rowToDeck(row as DeckRow)));
  }

  async upsert(deck: Deck): Promise<void> {
    const { error } = await this.client
      .from("decks")
      .upsert(deckToRow(deck, this.userId), { onConflict: "id" });
    if (error) throw error;
  }

  async remove(deckId: string): Promise<void> {
    const { error } = await this.client
      .from("decks")
      .delete()
      .eq("id", deckId)
      .eq("user_id", this.userId);
    if (error) throw error;
  }
}
