"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { Deck, DeckCard } from "@/types";

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
  setActiveDeckId: (id: string) => void;
  updateActiveDeck: (updater: (deck: Deck) => Deck) => void;
  updateOwnedQty: (cardId: string, qty: number) => void;
  createNewDeck: () => void;
  deleteDeck: (id: string) => void;
  enableSideboard: (deckId: string) => void;
  deleteSideboard: (deckId: string) => void;
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
          const defaultDeck = {
            id: crypto.randomUUID(),
            name: "",
            cards: [],
          };
          setDecks([defaultDeck]);
          setActiveDeckIdState(defaultDeck.id);
        }
      } catch (e) {
        console.error("Failed to parse decks from local storage");
      }
    } else {
      const defaultDeck = {
        id: crypto.randomUUID(),
        name: "",
        cards: [],
      };
      setDecks([defaultDeck]);
      setActiveDeckIdState(defaultDeck.id);
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
    if (isMounted && activeDeckId) {
      localStorage.setItem(ACTIVE_DECK_KEY, activeDeckId);
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

  const setActiveDeckId = (id: string) => {
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

  const createNewDeck = () => {
    const newDeck = { id: crypto.randomUUID(), name: "", cards: [] };
    setDecks((prev) => [...prev, newDeck]);
    setActiveDeckIdState(newDeck.id);
  };

  const deleteDeck = (id: string) => {
    setDecks((prev) => {
      const filtered = prev.filter((d) => d.id !== id);

      if (filtered.length === 0) {
        const freshDeck = {
          id: crypto.randomUUID(),
          name: "",
          cards: [],
        };
        setActiveDeckIdState(freshDeck.id);
        return [freshDeck];
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
