"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LayoutGrid, List, ArrowUp, ArrowDown } from "lucide-react";
import { searchCards, autocompleteCards, lookupSetCode } from "@/lib/scryfall";
import { parseSearchQuery } from "@/lib/nlpParser";
import { ScryfallCard } from "@/types";
import { Deck } from "@/types";
import { useDeckManager } from "@/hooks/useDeckManager";
import SearchBar from "./SearchBar";
import SearchTakeover from "./SearchTakeover";
import VisualCard from "./VisualCard";
import CardModal from "@/components/layout/CardModal";
import { FilterState, buildSidebarFilterSyntax } from "@/components/layout/FilterPanel";
import TileSizeSlider from "./TileSizeSlider";
import { TILE_SIZE_STOPS, TileSizeKey } from "@/config/gridConfig";

interface SearchWorkspaceProps {
  isActive: boolean;
  activeChipQuery: string | null;
  onDeactivateChip: () => void;
  sidebarFilters: FilterState;
  tileSize: TileSizeKey;
  onTileSizeChange: (stop: TileSizeKey) => void;
  showSearchTakeover?: boolean;
  onDismissTakeover?: () => void;
  triggerSearch?: string | null;
  onTriggerSearchConsumed?: () => void;
  showToast: (message: string) => void;
}

const SORT_ORDER_MAP: Record<string, string> = {
  relevance: "",
  name: "order:name",
  price: "order:usd",
  mv: "order:mv",
  color: "order:color",
};

function buildFilterSyntax(activeDeck: Deck | undefined, filterActive: boolean): string {
  if (!filterActive || !activeDeck) return "";
  const format = activeDeck.format;
  if (!format || format === "freeform") return "";

  let syntax = `legal:${format}`;
  if (format === "commander" && activeDeck.commanderIds?.length) {
    const commanders = activeDeck.commanderIds
      .map((id) => activeDeck.cards.find((c) => c.id === id))
      .filter(Boolean);
    const combined = [...new Set(commanders.flatMap((c) => c!.color_identity ?? []))];
    if (combined.length) {
      syntax += ` id<=${combined.join("")}`;
    }
  }
  return syntax;
}

export default function SearchWorkspace({ isActive, activeChipQuery, onDeactivateChip, sidebarFilters, tileSize, onTileSizeChange, showSearchTakeover, onDismissTakeover, triggerSearch, onTriggerSearchConsumed, showToast }: SearchWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const FILTER_ACTIVE_KEY_PREFIX = "mtg-search-filter-active";
  const readFilterActive = (deckId?: string) => {
    const key = deckId ? `${FILTER_ACTIVE_KEY_PREFIX}-${deckId}` : FILTER_ACTIVE_KEY_PREFIX;
    const stored = localStorage.getItem(key);
    return stored === null ? false : stored === "true";
  };
  const [filterActive, setFilterActive] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const SORT_DIR_KEY = "mtg-search-sort-direction";
  const [sortOrder, setSortOrder] = useState("price");
  const [sortDir, setSortDirState] = useState<"asc" | "desc">("desc");
  const setSortDir = (dir: "asc" | "desc") => {
    setSortDirState(dir);
    localStorage.setItem(SORT_DIR_KEY, dir);
  };
  const [setMatch, setSetMatch] = useState<{ query: string; code: string; name: string } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suppressAutocompleteRef = useRef(false);

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
    const sortClause = SORT_ORDER_MAP[sortOrder];
    if (sortClause) {
      parts.push(sortClause);
      parts.push(`dir:${sortDir}`);
    }
    return parts.filter(Boolean).join(" ").trim();
  }, [filterSyntax, activeChipQuery, parsed, sidebarFilterSyntax, setMatch, sortOrder, sortDir]);

  // Derived: filter badge data (combined identity from all commanders)
  const filterBadge = useMemo(() => {
    if (!activeDeck) return null;
    const format = activeDeck.format;
    const commanders = (activeDeck.commanderIds ?? [])
      .map((id) => activeDeck.cards.find((c) => c.id === id))
      .filter(Boolean);
    const combined = [...new Set(commanders.flatMap((c) => c!.color_identity ?? []))];
    const manaColors = format === "commander" && combined.length ? combined : undefined;
    const label = format.charAt(0).toUpperCase() + format.slice(1);
    return { label, manaColors, active: filterActive };
  }, [activeDeck, filterActive]);

  // Derived: set of deck card names for in-deck detection
  const deckCardNames = useMemo(
    () => new Set(activeDeck?.cards.map((c) => c.name) ?? []),
    [activeDeck?.cards]
  );

  // Initialize filterActive and sortDir from localStorage on mount
  useEffect(() => {
    setFilterActive(readFilterActive(activeDeck?.id));
    const storedDir = localStorage.getItem(SORT_DIR_KEY);
    if (storedDir === "asc" || storedDir === "desc") setSortDirState(storedDir);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus input when tab becomes active
  useEffect(() => {
    if (isActive) {
      searchInputRef.current?.focus();
    }
  }, [isActive]);

  // Reset filter and clear results when active deck changes
  useEffect(() => {
    setFilterActive(readFilterActive(activeDeck?.id));
    setResults([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (suppressAutocompleteRef.current) {
      suppressAutocompleteRef.current = false;
      return;
    }
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

  // Consume external search trigger (from set/artist click in deck context)
  useEffect(() => {
    if (!triggerSearch) return;
    suppressAutocompleteRef.current = true;
    setQuery(triggerSearch);
    setSuggestions([]);
    setShowAutocomplete(false);
    onTriggerSearchConsumed?.();
  }, [triggerSearch]);

  const handleRemoveToken = useCallback(
    (index: number) => {
      const token = parsed.tokens[index];
      const newQuery = query.replace(token.matchedText, "").replace(/\s+/g, " ").trim();
      setQuery(newQuery);
    },
    [parsed.tokens, query]
  );

  const handleToggleFilter = useCallback(() => {
    setFilterActive((f) => {
      const next = !f;
      const key = activeDeck?.id ? `${FILTER_ACTIVE_KEY_PREFIX}-${activeDeck.id}` : FILTER_ACTIVE_KEY_PREFIX;
      localStorage.setItem(key, String(next));
      return next;
    });
  }, [activeDeck?.id]);

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

  const handleAdd = useCallback(
    async (card: ScryfallCard) => {
      if (!activeDeck) return;

      let cardToAdd = card;
      if (!card.prices.usd || card.prices.usd === "0.00") {
        const rescueResults = await searchCards(`!"${card.name}" order:usd`);
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

  function handleTakeoverSearch(value: string) {
    setQuery(value);
    onDismissTakeover?.();
  }

  function handleTakeoverTag(tag: string) {
    setQuery(tag);
    onDismissTakeover?.();
  }

  if (showSearchTakeover) {
    return (
      <SearchTakeover
        onSearch={handleTakeoverSearch}
        onTagSelect={handleTakeoverTag}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar Row 1: Search Bar */}
      <div className="bg-surface-base border-b border-line-subtle flex flex-col gap-2 pt-4 pb-3">
        <div className="flex items-center px-4 gap-2">
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
        <div className="flex items-center px-4 gap-2">
          <span className="text-xs text-content-muted">
            {scryfallQuery.trim() ? (
              <>
                <b className="text-content-tertiary font-medium">{results.length}</b> results
              </>
            ) : (
              "Search to find cards"
            )}
          </span>
          {setMatch && setMatch.query === parsed.remainder && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-surface-raised border border-line-default rounded text-[10px] text-content-secondary max-w-[220px]">
              <span className="text-content-muted shrink-0">Set:</span>
              <span className="truncate">{setMatch.name}</span>
              <button
                onClick={() => setQuery("")}
                className="ml-0.5 text-content-muted hover:text-content-primary shrink-0"
              >
                ×
              </button>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2 h-8">
            <div className="flex items-center h-full bg-surface-base p-0.5 rounded-lg border border-line-subtle space-x-0.5 shadow-sm">
              <div className="flex items-center px-2 border-r border-line-subtle h-full gap-1">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-transparent text-xs text-content-secondary focus:outline-none cursor-pointer h-full"
                >
                  <option value="relevance" className="bg-surface-base">Sort: Relevance</option>
                  <option value="name" className="bg-surface-base">Name</option>
                  <option value="price" className="bg-surface-base">Price</option>
                  <option value="mv" className="bg-surface-base">Mana Value</option>
                  <option value="color" className="bg-surface-base">Color</option>
                </select>
                <div className="group relative flex items-center justify-center">
                  <button
                    onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
                    disabled={sortOrder === "relevance"}
                    className={`flex items-center justify-center w-5 h-5 rounded transition-colors ${
                      sortOrder === "relevance"
                        ? "text-content-disabled cursor-not-allowed"
                        : "text-content-tertiary hover:text-content-primary"
                    }`}
                  >
                    {sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  </button>
                  <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface-raised border border-line-default text-content-heading text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {sortDir === "asc" ? "Sort ascending" : "Sort descending"}
                  </span>
                </div>
              </div>
              <TileSizeSlider activeStop={tileSize} onChangeStop={onTileSizeChange} />
              <div className="w-px self-stretch bg-surface-raised mx-0.5" />
              <button
                className="h-full px-2 flex items-center justify-center rounded-md bg-surface-raised text-content-primary border border-neutral-700/50 transition-all"
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                className="h-full px-2 flex items-center justify-center rounded-md text-content-disabled border border-transparent cursor-not-allowed"
                title="List view (coming soon)"
                disabled
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center p-12">
            <div className="w-5 h-5 border-2 border-line-default border-t-blue-400 rounded-full animate-spin" />
          </div>
        )}

        {showEmpty && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-content-muted">Type something to search cards</p>
          </div>
        )}

        {showNoResults && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-content-muted">No cards found</p>
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
                tileSize={tileSize}
              />
            ))}
          </div>
        )}
      </div>

      {selectedCard && (() => {
        const idx = results.findIndex((r) => r.id === selectedCard.id);
        const hasNext = idx >= 0 && idx < results.length - 1;
        const hasPrev = idx > 0;
        return (
          <CardModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            context="search"
            onAddToDeck={async (card) => { await handleAdd(card); }}
            onNext={hasNext ? () => setSelectedCard(results[idx + 1]) : undefined}
            onPrev={hasPrev ? () => setSelectedCard(results[idx - 1]) : undefined}
            onSearchQuery={(q) => { suppressAutocompleteRef.current = true; setQuery(q); setSelectedCard(null); setSuggestions([]); setShowAutocomplete(false); }}
          />
        );
      })()}

    </div>
  );
}
