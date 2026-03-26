"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { Deck, DeckCard } from "@/types";
import { DeckFormat } from "@/lib/formatRules";

const STORAGE_KEY = "mtg_builder_decks";
const SORT_PREF_KEY = "mtg-sort-preference";
const ACTIVE_DECK_KEY = "mtg-active-deck";
const DECK_VIEW_MODE_KEY = "mtg-deck-view-mode";
const THUMBNAIL_KEY = "mtg-show-thumbnail";

export type SortBy = "original" | "name" | "color" | "mv";
export type SortDir = "asc" | "desc";

interface DeckContextType {
  decks: Deck[];
  activeDeck: Deck | undefined;
  setActiveDeckId: (id: string | null) => void;
  updateActiveDeck: (updater: (deck: Deck) => Deck) => void;
  updateOwnedQty: (cardId: string, qty: number) => void;
  createNewDeck: (format?: DeckFormat) => void;
  deleteDeck: (id: string) => void;
  enableSideboard: (deckId: string) => void;
  deleteSideboard: (deckId: string) => void;
  setDeckFormat: (deckId: string, format: DeckFormat) => void;
  setCommanderId: (cardId: string | undefined) => void;
  mergeSideboardIntoDeck: (deckId: string) => void;
  deleteSideboardForFormat: (deckId: string) => void;
  activeSideboardCards: DeckCard[];
  deckViewMode: "main" | "sideboard";
  setDeckViewMode: (v: "main" | "sideboard") => void;
  isMounted: boolean;
  showThumbnail: boolean;
  setShowThumbnail: (val: boolean) => void;
  lastAddedId: string | null;
  setLastAddedId: (id: string | null) => void;
  sortBy: SortBy;
  setSortBy: (by: SortBy) => void;
  sortDir: SortDir;
  setSortDir: (dir: SortDir) => void;
}

const DeckContext = createContext<DeckContextType | null>(null);

export function DeckProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckIdState] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("original");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [deckViewMode, setDeckViewMode] = useState<"main" | "sideboard">("main");

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedActiveId = localStorage.getItem(ACTIVE_DECK_KEY);

    const storedDeckViewMode = localStorage.getItem(DECK_VIEW_MODE_KEY);

    if (stored) {
      try {
        const parsedDecks = JSON.parse(stored);
        if (Array.isArray(parsedDecks) && parsedDecks.length > 0) {
          const migratedDecks = parsedDecks.map((deck: any) => ({
            ...deck,
            format: deck.format ?? "freeform",
            commanderId: deck.commanderId ?? undefined,
            cards: deck.cards.map((card: any) => {
              if (card.ownedQty !== undefined) return card;
              return { ...card, ownedQty: card.isOwned ? card.quantity : 0 };
            }),
          }));
          setDecks(migratedDecks);
          const restoredId =
            storedActiveId && migratedDecks.find((d: Deck) => d.id === storedActiveId)
              ? storedActiveId
              : migratedDecks[0].id;
          setActiveDeckIdState(restoredId);
          // Restore deck view mode — fall back to 'main' if active deck has no sideboard
          if (storedDeckViewMode === "sideboard") {
            const activeD = migratedDecks.find((d: Deck) => d.id === restoredId);
            if (activeD?.sideboard !== undefined) {
              setDeckViewMode("sideboard");
            }
          }
        } else {
          // No stored decks — show home screen
          setDecks([]);
          setActiveDeckIdState(null);
        }
      } catch (e) {
        console.error("Failed to parse decks from local storage");
      }
    } else {
      // No localStorage entry — first visit, show home screen
      setDecks([]);
      setActiveDeckIdState(null);
    }

    // Load sort preference
    try {
      const sortPref = localStorage.getItem(SORT_PREF_KEY);
      if (sortPref) {
        const { by, dir } = JSON.parse(sortPref);
        if (by) setSortBy(by);
        if (dir) setSortDir(dir);
      }
    } catch {
      // ignore
    }

    // Load thumbnail preference
    const storedThumbnail = localStorage.getItem(THUMBNAIL_KEY);
    if (storedThumbnail !== null) {
      setShowThumbnail(storedThumbnail === "true");
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    }
  }, [decks, isMounted]);

  useEffect(() => {
    if (isMounted) {
      if (activeDeckId) {
        localStorage.setItem(ACTIVE_DECK_KEY, activeDeckId);
      } else {
        localStorage.removeItem(ACTIVE_DECK_KEY);
      }
    }
  }, [activeDeckId, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(SORT_PREF_KEY, JSON.stringify({ by: sortBy, dir: sortDir }));
    }
  }, [sortBy, sortDir, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(DECK_VIEW_MODE_KEY, deckViewMode);
    }
  }, [deckViewMode, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(THUMBNAIL_KEY, String(showThumbnail));
    }
  }, [showThumbnail, isMounted]);

  const setActiveDeckId = (id: string | null) => {
    setActiveDeckIdState(id);
  };

  const activeDeck = decks.find((d) => d.id === activeDeckId);
  const activeSideboardCards = activeDeck?.sideboard ?? [];

  const updateActiveDeck = (updater: (deck: Deck) => Deck) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) =>
        deck.id === activeDeckId ? updater(deck) : deck,
      ),
    );
  };

  const updateOwnedQty = (cardId: string, qty: number) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) =>
        deck.id === activeDeckId
          ? {
              ...deck,
              cards: deck.cards.map((c) =>
                c.id === cardId
                  ? { ...c, ownedQty: Math.max(0, qty) }
                  : c,
              ),
            }
          : deck,
      ),
    );
  };

  const createNewDeck = (format: DeckFormat = "freeform") => {
    const newId = crypto.randomUUID();
    setDecks((prev) => {
      const existingNames = prev.map((d) => d.name || "Untitled");
      let name = "Untitled";
      let n = 2;
      while (existingNames.includes(name)) {
        name = `Untitled (${n})`;
        n++;
      }
      return [...prev, { id: newId, name, cards: [], format }];
    });
    setActiveDeckIdState(newId);
  };

  const deleteDeck = (id: string) => {
    setDecks((prev) => {
      const filtered = prev.filter((d) => d.id !== id);

      if (filtered.length === 0) {
        setActiveDeckIdState(null);
        return [];
      }

      if (activeDeckId === id) {
        setActiveDeckIdState(filtered[0].id);
      }

      return filtered;
    });
  };

  const enableSideboard = (deckId: string) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) =>
        deck.id === deckId && deck.sideboard === undefined
          ? { ...deck, sideboard: [] }
          : deck,
      ),
    );
  };

  const deleteSideboard = (deckId: string) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) =>
        deck.id === deckId ? { ...deck, sideboard: undefined } : deck,
      ),
    );
    // If we're viewing the sideboard for this deck, switch back to main
    if (deckId === activeDeckId && deckViewMode === "sideboard") {
      setDeckViewMode("main");
    }
  };

  const setDeckFormat = (deckId: string, format: DeckFormat) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) => {
        if (deck.id !== deckId) return deck;
        const update: Partial<Deck> = { format };
        // Switching away from commander clears the commanderId
        if (deck.format === "commander" && format !== "commander") {
          update.commanderId = undefined;
        }
        return { ...deck, ...update };
      }),
    );
  };

  const setCommanderId = (cardId: string | undefined) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) =>
        deck.id === activeDeckId ? { ...deck, commanderId: cardId } : deck,
      ),
    );
  };

  const mergeSideboardIntoDeck = (deckId: string) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) => {
        if (deck.id !== deckId || !deck.sideboard) return deck;
        const newCards = [...deck.cards];
        for (const sbCard of deck.sideboard) {
          const existingIndex = newCards.findIndex((c) => c.name === sbCard.name);
          if (existingIndex >= 0) {
            newCards[existingIndex] = {
              ...newCards[existingIndex],
              quantity: newCards[existingIndex].quantity + sbCard.quantity,
            };
          } else {
            newCards.push(sbCard);
          }
        }
        return { ...deck, cards: newCards, sideboard: undefined };
      }),
    );
    if (deckId === activeDeckId && deckViewMode === "sideboard") {
      setDeckViewMode("main");
    }
  };

  const deleteSideboardForFormat = (deckId: string) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) =>
        deck.id === deckId ? { ...deck, sideboard: undefined } : deck,
      ),
    );
    if (deckId === activeDeckId && deckViewMode === "sideboard") {
      setDeckViewMode("main");
    }
  };

  return (
    <DeckContext.Provider
      value={{
        decks,
        activeDeck,
        setActiveDeckId,
        updateActiveDeck,
        updateOwnedQty,
        createNewDeck,
        deleteDeck,
        enableSideboard,
        deleteSideboard,
        setDeckFormat,
        setCommanderId,
        mergeSideboardIntoDeck,
        deleteSideboardForFormat,
        activeSideboardCards,
        deckViewMode,
        setDeckViewMode,
        isMounted,
        showThumbnail,
        setShowThumbnail,
        lastAddedId,
        setLastAddedId,
        sortBy,
        setSortBy,
        sortDir,
        setSortDir,
      }}
    >
      {children}
    </DeckContext.Provider>
  );
}

export function useDeckManager() {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error("useDeckManager must be used within a DeckProvider");
  }
  return context;
}
