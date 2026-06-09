"use client";

import {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { Deck, DeckCard, ScryfallCard } from "@/types";
import { DeckFormat } from "@/lib/formatRules";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  migrateDecks,
  loadLocalDecks,
  SupabaseDeckStore,
} from "@/lib/deckStore";

const STORAGE_KEY = "mtg_builder_decks";

/** Cloud-sync status for the account UI. `local` = not syncing (signed out). */
export type SyncState = "local" | "syncing" | "synced" | "error";

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
  toggleIsOwned: (cardId: string) => void;
  createNewDeck: (format?: DeckFormat) => void;
  deleteDeck: (id: string) => void;
  enableSideboard: (deckId: string) => void;
  deleteSideboard: (deckId: string) => void;
  setDeckFormat: (deckId: string, format: DeckFormat) => void;
  setCommanderIds: (ids: string[] | undefined) => void;
  addCommander: (cardId: string) => void;
  removeCommander: (cardId: string) => void;
  replaceCommander: (slot: 0 | 1, cardId: string) => void;
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
  replaceAllDecks: (newDecks: Deck[]) => void;
  sortBy: SortBy;
  setSortBy: (by: SortBy) => void;
  sortDir: SortDir;
  setSortDir: (dir: SortDir) => void;
  createNamedDeck: (name: string, format?: DeckFormat) => string;
  addCardToSpecificDeck: (deckId: string, card: ScryfallCard, pool: "main" | "sideboard") => void;
  removeCardFromDeckById: (deckId: string, cardId: string, pool: "main" | "sideboard", decrementOnly: boolean) => void;
  syncState: SyncState;
  lastSyncedAt: number | null;
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

  // ─── Cloud sync (v2.0.0) ───────────────────────────────────────────────────
  // Signed out, this provider behaves exactly as before: state mirrored to
  // localStorage. Signed in, deck changes are additionally diffed and pushed to
  // Supabase (debounced); localStorage stays a warm offline cache either way.
  const { status: authStatus, user } = useAuth();
  const [syncState, setSyncState] = useState<SyncState>("local");
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const storeRef = useRef<SupabaseDeckStore | null>(null);
  const cloudLoadedRef = useRef(false);
  // id → JSON of the last value we know is in the cloud, for change diffing.
  const lastSyncedDecksRef = useRef<Map<string, string>>(new Map());
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedActiveId = localStorage.getItem(ACTIVE_DECK_KEY);

    const storedDeckViewMode = localStorage.getItem(DECK_VIEW_MODE_KEY);

    if (stored) {
      try {
        const parsedDecks = JSON.parse(stored);
        if (Array.isArray(parsedDecks) && parsedDecks.length > 0) {
          const migratedDecks = migrateDecks(parsedDecks);
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

  // Cloud load / first-login merge / sign-out revert. Local-first: the mount
  // effect above already painted local decks, so this only swaps in the cloud
  // copy once auth resolves.
  useEffect(() => {
    if (!supabase) return;
    if (authStatus === "loading") return;

    if (authStatus === "signedIn" && user) {
      let cancelled = false;
      const store = new SupabaseDeckStore(supabase, user.id);
      storeRef.current = store;
      setSyncState("syncing");
      (async () => {
        try {
          const cloudDecks = await store.loadAll();
          // First-login merge: push local-only decks up exactly once per user
          // per device, so deleting a deck on another device doesn't resurrect
          // it on the next sign-in here.
          const mergeFlagKey = `mtg-merged-${user.id}`;
          const alreadyMerged =
            localStorage.getItem(mergeFlagKey) === "true";
          let merged = cloudDecks;
          if (!alreadyMerged) {
            const localDecks = loadLocalDecks();
            const cloudIds = new Set(cloudDecks.map((d) => d.id));
            const toUpload = localDecks.filter((d) => !cloudIds.has(d.id));
            for (const d of toUpload) {
              if (cancelled) return;
              await store.upsert(d);
            }
            merged = [...cloudDecks, ...toUpload];
            localStorage.setItem(mergeFlagKey, "true");
          }
          if (cancelled) return;
          // Seed the diff baseline *before* applying state so the push effect
          // sees no change and doesn't echo the just-loaded decks back up.
          lastSyncedDecksRef.current = new Map(
            merged.map((d) => [d.id, JSON.stringify(d)]),
          );
          cloudLoadedRef.current = true;
          setDecks(merged);
          setActiveDeckIdState((prev) =>
            prev && merged.find((d) => d.id === prev)
              ? prev
              : (merged[0]?.id ?? null),
          );
          setSyncState("synced");
          setLastSyncedAt(Date.now());
        } catch (e) {
          if (cancelled) return;
          console.error("Cloud sync failed", e);
          setSyncState("error");
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    if (authStatus === "signedOut" && cloudLoadedRef.current) {
      // Was signed in, now signed out — revert to the local cache.
      cloudLoadedRef.current = false;
      storeRef.current = null;
      lastSyncedDecksRef.current = new Map();
      setSyncState("local");
      setLastSyncedAt(null);
      const local = loadLocalDecks();
      setDecks(local);
      setActiveDeckIdState(local[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, user?.id]);

  // Push deck changes to the cloud (debounced) while signed in. Diffs the
  // current decks against the last-synced snapshot so only changed/deleted
  // decks hit the network.
  useEffect(() => {
    if (authStatus !== "signedIn") return;
    if (!cloudLoadedRef.current || !storeRef.current) return;

    const store = storeRef.current;
    const current = new Map(decks.map((d) => [d.id, JSON.stringify(d)]));
    const prev = lastSyncedDecksRef.current;
    const toUpsert = decks.filter((d) => prev.get(d.id) !== current.get(d.id));
    const toRemove = [...prev.keys()].filter((id) => !current.has(id));
    if (toUpsert.length === 0 && toRemove.length === 0) return;

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    setSyncState("syncing");
    pushTimerRef.current = setTimeout(async () => {
      try {
        for (const d of toUpsert) await store.upsert(d);
        for (const id of toRemove) await store.remove(id);
        lastSyncedDecksRef.current = current;
        setSyncState("synced");
        setLastSyncedAt(Date.now());
      } catch (e) {
        console.error("Cloud push failed", e);
        setSyncState("error");
      }
    }, 800);
  }, [decks, authStatus]);

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
              cards: deck.cards.map((c) => {
                if (c.id !== cardId) return c;
                const newQty = Math.max(0, qty);
                return { ...c, ownedQty: newQty, isOwned: newQty > 0 };
              }),
            }
          : deck,
      ),
    );
  };

  const toggleIsOwned = (cardId: string) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) => {
        if (deck.id !== activeDeckId) return deck;
        return {
          ...deck,
          cards: deck.cards.map((c) => {
            if (c.id !== cardId) return c;
            if (c.isOwned) {
              // Deactivation: retain ownedQty so re-activation restores prior count
              return { ...c, isOwned: false };
            } else if (c.ownedQty === 0) {
              // First activation: fill to quantity
              return { ...c, isOwned: true, ownedQty: c.quantity };
            } else {
              // Re-activation: retain existing ownedQty
              return { ...c, isOwned: true };
            }
          }),
        };
      }),
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

  const createNamedDeck = (name: string, format: DeckFormat = "freeform"): string => {
    const newId = crypto.randomUUID();
    setDecks((prev) => {
      const existingNames = prev.map((d) => d.name || "");
      let finalName = name;
      let n = 2;
      while (existingNames.includes(finalName)) {
        finalName = `${name} ${n}`;
        n++;
      }
      return [...prev, { id: newId, name: finalName, cards: [], format }];
    });
    setActiveDeckIdState(newId);
    return newId;
  };

  const addCardToSpecificDeck = (deckId: string, card: ScryfallCard, pool: "main" | "sideboard") => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) => {
        if (deck.id !== deckId) return deck;
        if (pool === "sideboard" && deck.sideboard !== undefined) {
          const existing = deck.sideboard.find((c) => c.id === card.id);
          if (existing) {
            return { ...deck, sideboard: deck.sideboard.map((c) => c.id === card.id ? { ...c, quantity: c.quantity + 1 } : c) };
          }
          return { ...deck, sideboard: [...deck.sideboard, { ...card, quantity: 1, ownedQty: 0, isOwned: false }] };
        } else {
          const existing = deck.cards.find((c) => c.id === card.id);
          if (existing) {
            return { ...deck, cards: deck.cards.map((c) => c.id === card.id ? { ...c, quantity: c.quantity + 1 } : c) };
          }
          return { ...deck, cards: [...deck.cards, { ...card, quantity: 1, ownedQty: 0, isOwned: false }] };
        }
      })
    );
  };

  const removeCardFromDeckById = (deckId: string, cardId: string, pool: "main" | "sideboard", decrementOnly: boolean) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) => {
        if (deck.id !== deckId) return deck;
        if (pool === "sideboard" && deck.sideboard !== undefined) {
          if (decrementOnly) {
            return { ...deck, sideboard: deck.sideboard.map((c) => c.id === cardId ? { ...c, quantity: c.quantity - 1 } : c) };
          }
          return { ...deck, sideboard: deck.sideboard.filter((c) => c.id !== cardId) };
        } else {
          if (decrementOnly) {
            return { ...deck, cards: deck.cards.map((c) => c.id === cardId ? { ...c, quantity: c.quantity - 1 } : c) };
          }
          return { ...deck, cards: deck.cards.filter((c) => c.id !== cardId) };
        }
      })
    );
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
        // Switching away from commander clears commanderIds
        if (deck.format === "commander" && format !== "commander") {
          update.commanderIds = undefined;
        }
        return { ...deck, ...update };
      }),
    );
  };

  const setCommanderIds = (ids: string[] | undefined) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) =>
        deck.id === activeDeckId ? { ...deck, commanderIds: ids } : deck,
      ),
    );
  };

  const addCommander = (cardId: string) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) => {
        if (deck.id !== activeDeckId) return deck;
        const current = deck.commanderIds ?? [];
        if (current.length >= 2 || current.includes(cardId)) return deck;
        return { ...deck, commanderIds: [...current, cardId] };
      }),
    );
  };

  const removeCommander = (cardId: string) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) => {
        if (deck.id !== activeDeckId) return deck;
        const filtered = (deck.commanderIds ?? []).filter((id) => id !== cardId);
        return { ...deck, commanderIds: filtered.length > 0 ? filtered : undefined };
      }),
    );
  };

  const replaceCommander = (slot: 0 | 1, cardId: string) => {
    setDecks((currentDecks) =>
      currentDecks.map((deck) => {
        if (deck.id !== activeDeckId) return deck;
        const current = [...(deck.commanderIds ?? [])];
        current[slot] = cardId;
        return { ...deck, commanderIds: current };
      }),
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

  const replaceAllDecks = (newDecks: Deck[]) => {
    const migrated = migrateDecks(newDecks);
    setDecks(migrated);
    if (migrated.length > 0) {
      setActiveDeckIdState(migrated[0].id);
    } else {
      setActiveDeckIdState(null);
    }
    setDeckViewMode("main");
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
        toggleIsOwned,
        createNewDeck,
        deleteDeck,
        enableSideboard,
        deleteSideboard,
        setDeckFormat,
        setCommanderIds,
        addCommander,
        removeCommander,
        replaceCommander,
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
        replaceAllDecks,
        sortBy,
        setSortBy,
        sortDir,
        setSortDir,
        createNamedDeck,
        addCardToSpecificDeck,
        removeCardFromDeckById,
        syncState,
        lastSyncedAt,
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
