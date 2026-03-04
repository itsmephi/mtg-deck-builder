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

interface DeckContextType {
  decks: Deck[];
  activeDeck: Deck | undefined;
  setActiveDeckId: (id: string) => void;
  updateActiveDeck: (updater: (deck: Deck) => Deck) => void;
  createNewDeck: () => void;
  deleteDeck: (id: string) => void;
  isMounted: boolean;
  showThumbnail: boolean;
  setShowThumbnail: (val: boolean) => void;
  lastAddedId: string | null;
  setLastAddedId: (id: string | null) => void;
}

const DeckContext = createContext<DeckContextType | null>(null);

export function DeckProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsedDecks = JSON.parse(stored);
        if (Array.isArray(parsedDecks) && parsedDecks.length > 0) {
          setDecks(parsedDecks);
          setActiveDeckId(parsedDecks[0].id);
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
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    }
  }, [decks, isMounted]);

  const activeDeck = decks.find((d) => d.id === activeDeckId);

  const updateActiveDeck = (updater: (deck: Deck) => Deck) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) =>
        deck.id === activeDeckId ? updater(deck) : deck,
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
        createNewDeck,
        deleteDeck,
        isMounted,
        showThumbnail,
        setShowThumbnail,
        lastAddedId,
        setLastAddedId,
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
