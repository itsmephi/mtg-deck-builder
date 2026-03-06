"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { Deck } from "@/types";

const STORAGE_KEY = "mtg_builder_decks";
const SORT_PREF_KEY = "mtg-sort-preference";

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
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("original");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);

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
          setActiveDeckId(migratedDecks[0].id);
        } else {
          const defaultDeck = {
            id: crypto.randomUUID(),
            name: "New Deck",
            cards: [],
          };
          setDecks([defaultDeck]);
          setActiveDeckId(defaultDeck.id);
        }
      } catch (e) {
        console.error("Failed to parse decks from local storage");
      }
    } else {
      const defaultDeck = {
        id: crypto.randomUUID(),
        name: "New Deck",
        cards: [],
      };
      setDecks([defaultDeck]);
      setActiveDeckId(defaultDeck.id);
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
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    }
  }, [decks, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(SORT_PREF_KEY, JSON.stringify({ by: sortBy, dir: sortDir }));
    }
  }, [sortBy, sortDir, isMounted]);

  const activeDeck = decks.find((d) => d.id === activeDeckId);

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
    const newDeck = { id: crypto.randomUUID(), name: "New Deck", cards: [] };
    setDecks((prev) => [...prev, newDeck]);
    setActiveDeckId(newDeck.id);
  };

  const deleteDeck = (id: string) => {
    setDecks((prev) => {
      const filtered = prev.filter((d) => d.id !== id);

      // If we just deleted the last deck, create a fresh one immediately
      if (filtered.length === 0) {
        const freshDeck = {
          id: crypto.randomUUID(),
          name: "New Deck",
          cards: [],
        };
        setActiveDeckId(freshDeck.id);
        return [freshDeck];
      }

      // If we deleted the active deck, move the focus to the next available one
      if (activeDeckId === id) {
        setActiveDeckId(filtered[0].id);
      }

      return filtered;
    });
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
