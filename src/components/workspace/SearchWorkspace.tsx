"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LayoutGrid, List } from "lucide-react";
import { searchCards, autocompleteCards, lookupSetCode } from "@/lib/scryfall";
import { parseSearchQuery } from "@/lib/nlpParser";
import { ScryfallCard } from "@/types";
import { Deck } from "@/types";
import { useDeckManager } from "@/hooks/useDeckManager";
import SearchBar from "./SearchBar";
import VisualCard from "./VisualCard";
import CardModal from "@/components/layout/CardModal";
import { FilterState, buildSidebarFilterSyntax } from "@/components/layout/FilterPanel";
import TileSizeSlider from "./TileSizeSlider";
import { TILE_SIZE_STOPS, TileSizeKey, DEFAULT_TILE_SIZE, TILE_SIZE_STORAGE_KEY } from "@/config/gridConfig";

interface SearchWorkspaceProps {
  isActive: boolean;
  activeChipQuery: string | null;
  onDeactivateChip: () => void;
  sidebarFilters: FilterState;
}

function buildFilterSyntax(activeDeck: Deck | undefined, filterActive: boolean): string {
  if (!filterActive || !activeDeck) return "";
  const format = activeDeck.format;
  if (!format || format === "freeform") return "";

  let syntax = `legal:${format}`;
  if (format === "commander" && activeDeck.commanderId) {
    const commander = activeDeck.cards.find((c) => c.id === activeDeck.commanderId);
    if (commander?.color_identity?.length) {
      syntax += ` id<=${commander.color_identity.join("")}`;
    }
  }
  return syntax;
}

export default function SearchWorkspace({ isActive, activeChipQuery, onDeactivateChip, sidebarFilters }: SearchWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [filterActive, setFilterActive] = useState(true);
  const [tileSize, setTileSizeState] = useState<TileSizeKey>(DEFAULT_TILE_SIZE);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [setMatch, setSetMatch] = useState<{ query: string; code: string; name: string } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { activeDeck, updateActiveDeck, setLastAddedId, deckViewMode } = useDeckManager();

  // Derived: parse the raw query into tokens + scryfall syntax
  const parsed = useMemo(() => parseSearchQuery(query), [query]);

  // Derived: full Scryfall query including filter syntax
  const filterSyntax = useMemo(
    () => buildFilterSyntax(activeDeck, filterActive),
    [activeDeck, filterActive]
  );
  const sidebarFilterSyntax = useMemo(
    () => buildSidebarFilterSyntax(sidebarFilters),
    [sidebarFilters]
  );

  const scryfallQuery = useMemo(() => {
    const parts = [filterSyntax];
    if (activeChipQuery !== null) {
      parts.push(activeChipQuery);
    } else if (setMatch && setMatch.query === parsed.remainder) {
      const tokenPart = parsed.tokens.map((t) => t.scryfall).join(" ");
      if (tokenPart) parts.push(tokenPart);
      parts.push(`e:${setMatch.code}`);
    } else if (parsed.scryfallQuery) {
      parts.push(parsed.scryfallQuery);
    }
    if (sidebarFilterSyntax) parts.push(sidebarFilterSyntax);
    return parts.filter(Boolean).join(" ").trim();
  }, [filterSyntax, activeChipQuery, parsed, sidebarFilterSyntax, setMatch]);

  // Derived: filter badge data
  const filterBadge = useMemo(() => {
    if (!activeDeck) return null;
    const format = activeDeck.format;
    const commander = activeDeck.commanderId
      ? activeDeck.cards.find((c) => c.id === activeDeck.commanderId)
      : null;
    const manaColors =
      format === "commander" && commander?.color_identity?.length
        ? commander.color_identity
        : undefined;
    const label = format.charAt(0).toUpperCase() + format.slice(1);
    return { label, manaColors, active: filterActive };
  }, [activeDeck, filterActive]);

  // Derived: set of deck card names for in-deck detection
  const deckCardNames = useMemo(
    () => new Set(activeDeck?.cards.map((c) => c.name) ?? []),
    [activeDeck?.cards]
  );

  // Restore tile size on mount
  useEffect(() => {
    const stored = localStorage.getItem(TILE_SIZE_STORAGE_KEY) as TileSizeKey | null;
    if (stored && TILE_SIZE_STOPS.some((s) => s.key === stored)) setTileSizeState(stored);
  }, []);

  const setTileSize = (s: TileSizeKey) => {
    setTileSizeState(s);
    localStorage.setItem(TILE_SIZE_STORAGE_KEY, s);
  };

  // Focus input when tab becomes active
  useEffect(() => {
    if (isActive) {
      searchInputRef.current?.focus();
    }
  }, [isActive]);

  // Reset filter and clear results when active deck changes
  useEffect(() => {
    setFilterActive(true);
    setResults([]);
  }, [activeDeck?.id]);

  // Debounced search — fires when scryfallQuery changes
  useEffect(() => {
    if (!scryfallQuery.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      const data = await searchCards(scryfallQuery);
      setResults(data);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [scryfallQuery]);

  // Autocomplete — fires on every query change, no debounce
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowAutocomplete(false);
      return;
    }
    autocompleteCards(query).then((names) => {
      setSuggestions(names);
      if (names.length > 0 || parsed.tokens.length > 0) setShowAutocomplete(true);
    }).catch(() => setSuggestions([]));
  }, [query, parsed.tokens.length]);

  // Set name lookup — fires when remainder has 2+ words
  useEffect(() => {
    const words = parsed.remainder.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      setSetMatch(null);
      return;
    }
    const timer = setTimeout(async () => {
      const result = await lookupSetCode(parsed.remainder);
      if (result) {
        setSetMatch({ query: parsed.remainder, ...result });
      } else {
        setSetMatch(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [parsed.remainder]);

  // Clear query input when a chip activates
  useEffect(() => {
    if (activeChipQuery !== null) {
      setQuery("");
      setSuggestions([]);
      setShowAutocomplete(false);
    }
  }, [activeChipQuery]);

  const handleRemoveToken = useCallback(
    (index: number) => {
      const token = parsed.tokens[index];
      const newQuery = query.replace(token.matchedText, "").replace(/\s+/g, " ").trim();
      setQuery(newQuery);
    },
    [parsed.tokens, query]
  );

  const handleToggleFilter = useCallback(() => {
    setFilterActive((f) => !f);
  }, []);

  const handleAutocompleteSelect = useCallback((name: string) => {
    setQuery(name);
    setSuggestions([]);
    setShowAutocomplete(false);
  }, []);

  const handleDismissAutocomplete = useCallback(() => {
    setSuggestions([]);
    setShowAutocomplete(false);
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (activeChipQuery !== null) onDeactivateChip();
  }, [activeChipQuery, onDeactivateChip]);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 2000);
  }, []);

  const handleAdd = useCallback(
    async (card: ScryfallCard) => {
      if (!activeDeck) return;

      let cardToAdd = card;
      if (!card.prices.usd || card.prices.usd === "0.00") {
        const rescueResults = await searchCards(`!"${card.name}"`);
        if (
          rescueResults.length > 0 &&
          rescueResults[0].prices.usd &&
          rescueResults[0].prices.usd !== "0.00"
        ) {
          cardToAdd = { ...rescueResults[0], id: card.id };
        }
      }

      if (deckViewMode === "sideboard") {
        const existing = activeDeck.sideboard?.find((c) => c.id === cardToAdd.id);
        const newQty = (existing?.quantity ?? 0) + 1;
        updateActiveDeck((deck) => {
          if (deck.sideboard === undefined) return deck;
          if (existing) {
            return {
              ...deck,
              sideboard: deck.sideboard!.map((c) =>
                c.id === cardToAdd.id ? { ...c, quantity: c.quantity + 1 } : c
              ),
            };
          }
          return {
            ...deck,
            sideboard: [...deck.sideboard!, { ...cardToAdd, quantity: 1, ownedQty: 0 }],
          };
        });
        const qtyLabel = newQty > 1 ? ` (×${newQty})` : "";
        showToast(`Added ${cardToAdd.name} to ${activeDeck.name}${qtyLabel}`);
      } else {
        const existing = activeDeck.cards.find((c) => c.id === cardToAdd.id);
        const newQty = (existing?.quantity ?? 0) + 1;
        updateActiveDeck((deck) => {
          if (existing) {
            return {
              ...deck,
              cards: deck.cards.map((c) =>
                c.id === cardToAdd.id ? { ...c, quantity: c.quantity + 1 } : c
              ),
            };
          }
          return {
            ...deck,
            cards: [...deck.cards, { ...cardToAdd, quantity: 1, ownedQty: 0 }],
          };
        });
        const qtyLabel = newQty > 1 ? ` (×${newQty})` : "";
        showToast(`Added ${cardToAdd.name} to ${activeDeck.name}${qtyLabel}`);
      }
      setLastAddedId(cardToAdd.id);
    },
    [activeDeck, updateActiveDeck, setLastAddedId, deckViewMode, showToast]
  );

  const showEmpty = !isLoading && !scryfallQuery.trim();
  const showNoResults = !isLoading && !!scryfallQuery.trim() && results.length === 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar Row 1: Search Bar */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center px-3.5 gap-2 min-h-[38px] pt-1">
          <SearchBar
            query={query}
            onChange={handleQueryChange}
            onClear={() => { setQuery(""); setSuggestions([]); setShowAutocomplete(false); setSetMatch(null); }}
            inputRef={searchInputRef}
            tokens={parsed.tokens}
            onRemoveToken={handleRemoveToken}
            filterBadge={filterBadge}
            onToggleFilter={handleToggleFilter}
            autocompleteSuggestions={suggestions}
            deckCardNames={deckCardNames}
            onSelectAutocomplete={handleAutocompleteSelect}
            onDismissAutocomplete={handleDismissAutocomplete}
            showAutocomplete={showAutocomplete}
          />
        </div>
        {/* Toolbar Row 2: Results count + sort + view toggles */}
        <div className="flex items-center px-3.5 gap-2 min-h-[34px] pb-1">
          <span className="text-xs text-neutral-500">
            {scryfallQuery.trim() ? (
              <>
                <b className="text-neutral-400 font-medium">{results.length}</b> results
              </>
            ) : (
              "Search to find cards"
            )}
          </span>
          {setMatch && setMatch.query === parsed.remainder && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] text-neutral-300 max-w-[220px]">
              <span className="text-neutral-500 shrink-0">Set:</span>
              <span className="truncate">{setMatch.name}</span>
              <button
                onClick={() => setQuery("")}
                className="ml-0.5 text-neutral-500 hover:text-white shrink-0"
              >
                ×
              </button>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1.5 h-7">
            <select className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer">
              <option value="relevance" className="bg-neutral-900">Sort: Relevance</option>
              <option value="name" className="bg-neutral-900">Name</option>
              <option value="price_asc" className="bg-neutral-900">Price ↑</option>
              <option value="price_desc" className="bg-neutral-900">Price ↓</option>
              <option value="mv" className="bg-neutral-900">Mana Value</option>
              <option value="color" className="bg-neutral-900">Color</option>
            </select>
            <div className="w-px h-[18px] bg-neutral-800" />
            <TileSizeSlider activeStop={tileSize} onChangeStop={setTileSize} />
            <div className="w-px h-[18px] bg-neutral-800" />
            <button
              className="h-7 px-2 flex items-center justify-center rounded-md bg-neutral-800 text-white border border-neutral-700/50 transition-all"
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              className="h-7 px-2 flex items-center justify-center rounded-md text-neutral-700 border border-transparent cursor-not-allowed"
              title="List view (coming soon)"
              disabled
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center p-12">
            <div className="w-5 h-5 border-2 border-neutral-600 border-t-neutral-400 rounded-full animate-spin" />
          </div>
        )}

        {showEmpty && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-neutral-500">Type something to search cards</p>
          </div>
        )}

        {showNoResults && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-neutral-500">No cards found</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div
            className="p-3.5"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, minmax(${(TILE_SIZE_STOPS.find((s) => s.key === tileSize) ?? TILE_SIZE_STOPS[2]).minWidth}px, 1fr))`,
              gap: `${(TILE_SIZE_STOPS.find((s) => s.key === tileSize) ?? TILE_SIZE_STOPS[2]).gap}px`,
              alignContent: "start",
            }}
          >
            {results.map((card) => (
              <VisualCard
                key={card.id}
                card={{ ...card, quantity: 1, ownedQty: 0 }}
                mode="search"
                inDeck={deckCardNames.has(card.name)}
                onAdd={handleAdd}
                onSelect={setSelectedCard}
              />
            ))}
          </div>
        )}
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          context="search"
          onAddToDeck={async (card) => {
            await handleAdd(card);
          }}
        />
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-neutral-200 shadow-lg max-w-xs">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
