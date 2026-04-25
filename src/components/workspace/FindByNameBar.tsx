"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, X, RotateCw, AlertTriangle } from "lucide-react";
import { autocompleteCards, searchCards, getCardPrintings } from "@/lib/scryfall";
import { useDeckManager } from "@/hooks/useDeckManager";
import { ScryfallCard } from "@/types";
import { getFormatRules } from "@/lib/formatRules";

interface FindByNameBarProps {
  showToast: (msg: string) => void;
  registerFocusFn?: (fn: () => void) => void;
  registerSearchFn?: (fn: (query: string) => void) => void;
  registerDismissFn?: (fn: () => void) => void;
  onActiveChange?: (active: boolean) => void;
}

function renderManaSymbols(manaCost: string | undefined): React.ReactNode {
  if (!manaCost) return null;
  const symbols = manaCost.match(/\{[^}]+\}/g) || [];
  if (!symbols.length) return null;
  return (
    <span className="flex gap-0.5 items-center shrink-0">
      {symbols.map((s, i) => (
        <img
          key={i}
          src={`https://svgs.scryfall.io/card-symbols/${s.replace(/\{|\}/g, "").replace(/\//g, "")}.svg`}
          className="w-3.5 h-3.5"
          alt={s}
        />
      ))}
    </span>
  );
}

function renderOracleText(text: string | undefined): React.ReactNode {
  if (!text) return <span className="text-content-muted italic">No rules text.</span>;
  return (
    <div className="space-y-1.5">
      {text.split("\n").map((para, pi) => (
        <p key={pi} className="leading-relaxed">
          {para.split(/(\{[^}]+\})/g).map((token, ti) => {
            if (token.match(/^\{[^}]+\}$/)) {
              const symbol = token.replace(/\{|\}/g, "").replace(/\//g, "");
              return (
                <img
                  key={ti}
                  src={`https://svgs.scryfall.io/card-symbols/${symbol}.svg`}
                  className="w-3.5 h-3.5 inline-block mx-0.5 align-middle"
                  alt={token}
                />
              );
            }
            return <span key={ti}>{token}</span>;
          })}
        </p>
      ))}
    </div>
  );
}

export default function FindByNameBar({ showToast, registerFocusFn, registerSearchFn, registerDismissFn, onActiveChange }: FindByNameBarProps) {
  const { activeDeck, updateActiveDeck, deckViewMode, setLastAddedId } = useDeckManager();

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const artStripRef = useRef<HTMLDivElement>(null);
  const artDrag = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });

  const [query, setQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingAC, setIsLoadingAC] = useState(false);
  const [acError, setAcError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [selectedPrinting, setSelectedPrinting] = useState<ScryfallCard | null>(null);
  const [printings, setPrintings] = useState<ScryfallCard[]>([]);
  const [flipFace, setFlipFace] = useState(false);
  const [browseResults, setBrowseResults] = useState<ScryfallCard[]>([]);
  const [browseLabel, setBrowseLabel] = useState("");
  const [isLoadingBrowse, setIsLoadingBrowse] = useState(false);

  // Detect e: and a: prefix queries — suppress normal autocomplete, show hint row
  const prefixHint = useMemo(() => {
    const artistMatch = query.match(/^a:"?(.+?)"?$/i);
    if (artistMatch) return { type: "artist" as const, value: artistMatch[1].trim() };
    const setMatch = query.match(/^e:(\w+)$/i);
    if (setMatch) return { type: "set" as const, value: setMatch[1] };
    return null;
  }, [query]);

  useEffect(() => {
    registerFocusFn?.(() => inputRef.current?.focus());
  }, [registerFocusFn]);

  useEffect(() => {
    onActiveChange?.(showDropdown || showPreview);
  }, [showDropdown, showPreview, onActiveChange]);

  // / or Cmd+K focuses the input from anywhere in the workspace
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (document.activeElement === inputRef.current) return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/" || (e.metaKey && e.key === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Autocomplete — debounced 150ms, fires on query change while preview is not open
  useEffect(() => {
    if (showPreview || query.length < 2) {
      if (query.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        setAcError(false);
      }
      return;
    }

    // Prefix mode: show hint row immediately, skip autocomplete fetch
    if (prefixHint) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSuggestions([]);
      setShowDropdown(true);
      setAcError(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsLoadingAC(true);
      setAcError(false);
      try {
        const results = await autocompleteCards(query);
        setSuggestions(results.slice(0, 8));
        setShowDropdown(true);
        setFocusedIndex(-1);
      } catch {
        setAcError(true);
        setShowDropdown(true);
      } finally {
        setIsLoadingAC(false);
      }
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, showPreview, prefixHint]);

  const handleSelectSuggestion = useCallback(async (name: string) => {
    setShowDropdown(false);
    setShowPreview(true);
    setIsLoadingPreview(true);
    setFlipFace(false);
    setSelectedPrinting(null);
    setPrintings([]);

    try {
      const results = await searchCards(`!"${name}"`);
      if (!results.length) {
        setShowPreview(false);
        setIsLoadingPreview(false);
        showToast("Card not found. Try another search.");
        return;
      }
      const canonical = results[0];
      const allPrintings = await getCardPrintings(canonical.name, canonical.oracle_id);
      const available = allPrintings.length > 0 ? allPrintings : [canonical];
      setSelectedPrinting(available[0]);
      setPrintings(available);
    } catch {
      setShowPreview(false);
      showToast("Could not fetch card data. Try again.");
    } finally {
      setIsLoadingPreview(false);
    }
  }, [showToast]);

  const handleCancel = useCallback(() => {
    setShowPreview(false);
    setSelectedPrinting(null);
    setPrintings([]);
    setFlipFace(false);
    setBrowseResults([]);
    setBrowseLabel("");
    setIsLoadingBrowse(false);
    if (suggestions.length > 0 && query.length >= 2) {
      setShowDropdown(true);
    }
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [suggestions.length, query]);

  const clearAll = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setFocusedIndex(-1);
    setShowPreview(false);
    setSelectedPrinting(null);
    setPrintings([]);
    setFlipFace(false);
    setBrowseResults([]);
    setBrowseLabel("");
    setIsLoadingBrowse(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    registerDismissFn?.(clearAll);
  }, [registerDismissFn, clearAll]);

  const handleAddCard = useCallback(async () => {
    if (!selectedPrinting || !activeDeck) return;

    let cardToAdd = selectedPrinting;

    // Price rescue: if selected printing has no price, try order:usd fallback
    if (!cardToAdd.prices?.usd || cardToAdd.prices.usd === "0.00") {
      try {
        const rescued = await searchCards(`!"${cardToAdd.name}" order:usd`);
        if (rescued.length > 0 && rescued[0].prices?.usd && rescued[0].prices.usd !== "0.00") {
          cardToAdd = { ...cardToAdd, prices: rescued[0].prices };
        }
      } catch { /* keep original */ }
    }

    const newCard = { ...cardToAdd, quantity: 1, ownedQty: 0, isOwned: false };

    if (deckViewMode === "sideboard") {
      updateActiveDeck((deck) => {
        if (!deck.sideboard) return deck;
        const existing = deck.sideboard.find((c) => c.id === cardToAdd.id);
        if (existing) {
          return {
            ...deck,
            sideboard: deck.sideboard.map((c) =>
              c.id === cardToAdd.id ? { ...c, quantity: c.quantity + 1 } : c,
            ),
          };
        }
        return { ...deck, sideboard: [...deck.sideboard, newCard] };
      });
    } else {
      updateActiveDeck((deck) => {
        const existing = deck.cards.find((c) => c.id === cardToAdd.id);
        if (existing) {
          return {
            ...deck,
            cards: deck.cards.map((c) =>
              c.id === cardToAdd.id ? { ...c, quantity: c.quantity + 1 } : c,
            ),
          };
        }
        return { ...deck, cards: [...deck.cards, newCard] };
      });
    }

    setLastAddedId(cardToAdd.id);
    clearAll();
    showToast(`Added ${cardToAdd.name}`);
  }, [selectedPrinting, activeDeck, deckViewMode, updateActiveDeck, setLastAddedId, clearAll, showToast]);

  // Close dropdown on click outside
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Format rules + warnings
  const format = activeDeck?.format ?? "freeform";
  const rules = getFormatRules(format);

  const commanderIdentity = useMemo(() => {
    if (!activeDeck?.commanderIds?.length) return undefined;
    const commanders = activeDeck.commanderIds
      .map((id) => activeDeck.cards.find((c) => c.id === id))
      .filter(Boolean) as { color_identity?: string[] }[];
    const combined = [...new Set(commanders.flatMap((c) => c.color_identity ?? []))];
    return combined.length > 0 ? combined : undefined;
  }, [activeDeck]);

  const activePool = useMemo(
    () => (activeDeck ? (deckViewMode === "sideboard" ? (activeDeck.sideboard ?? []) : activeDeck.cards) : []),
    [activeDeck, deckViewMode],
  );

  const warnings = useMemo(() => {
    if (!selectedPrinting) return [];
    const ws: { type: string; text: string }[] = [];

    if (rules.hasLegalityCheck && rules.legalityFormat) {
      const legality = selectedPrinting.legalities?.[rules.legalityFormat];
      if (legality === "not_legal" || legality === "banned") {
        ws.push({ type: "legality", text: `Not legal in ${format === "standard" ? "Standard" : "Commander"}` });
      }
    }

    if (rules.hasColorIdentityCheck && commanderIdentity && selectedPrinting.color_identity) {
      const outside = selectedPrinting.color_identity.filter((c) => !commanderIdentity.includes(c));
      if (outside.length > 0) {
        ws.push({ type: "color_identity", text: "Outside commander identity" });
      }
    }

    const isExempt =
      (selectedPrinting.type_line ?? "").includes("Basic Land") ||
      (selectedPrinting.oracle_text ?? "").includes("A deck can have any number");
    if (!isExempt) {
      const count = activePool
        .filter((c) => c.name.toLowerCase() === selectedPrinting.name.toLowerCase())
        .reduce((sum, c) => sum + c.quantity, 0);
      if (count >= rules.copyLimit) {
        ws.push({
          type: "copy_limit",
          text: format === "commander" ? "Already in deck" : `Already in deck (${count}×)`,
        });
      }
    }

    return ws;
  }, [selectedPrinting, rules, format, commanderIdentity, activePool]);

  // Derived display values
  const hasBackFace = !!(
    selectedPrinting?.card_faces?.length &&
    selectedPrinting.card_faces[1]?.image_uris &&
    !selectedPrinting.type_line?.includes("Room")
  );

  const artImage = useMemo(() => {
    if (!selectedPrinting) return undefined;
    if (flipFace && selectedPrinting.card_faces?.[1]?.image_uris) {
      return selectedPrinting.card_faces[1].image_uris.normal;
    }
    return selectedPrinting.image_uris?.normal ?? selectedPrinting.card_faces?.[0]?.image_uris?.normal;
  }, [selectedPrinting, flipFace]);

  const displayMana = selectedPrinting?.mana_cost ?? selectedPrinting?.card_faces?.[0]?.mana_cost;
  const displayOracleText = selectedPrinting?.oracle_text ?? selectedPrinting?.card_faces?.[0]?.oracle_text;
  const priceStr = selectedPrinting?.prices?.usd ? `$${selectedPrinting.prices.usd}` : "Price unavailable";
  const rarityLabel = selectedPrinting?.rarity
    ? selectedPrinting.rarity[0].toUpperCase() + selectedPrinting.rarity.slice(1)
    : "";
  const displayFlavorText = selectedPrinting?.flavor_text ?? selectedPrinting?.card_faces?.[0]?.flavor_text;
  const displayArtist = selectedPrinting?.artist ?? selectedPrinting?.card_faces?.[0]?.artist;
  const addLabel = deckViewMode === "sideboard" ? "+ Add to sideboard" : "+ Add to deck";

  const retryAutocomplete = useCallback(() => {
    setAcError(false);
    setIsLoadingAC(true);
    autocompleteCards(query)
      .then((r) => { setSuggestions(r.slice(0, 8)); setShowDropdown(true); })
      .catch(() => setAcError(true))
      .finally(() => setIsLoadingAC(false));
  }, [query]);

  const handleArtistClick = useCallback(async (artistName: string) => {
    const artistQuery = `a:"${artistName}"`;
    setQuery(artistQuery);
    setShowPreview(true);
    setIsLoadingBrowse(true);
    setBrowseResults([]);
    setBrowseLabel(artistName);
    setPrintings([]);
    try {
      const results = await searchCards(artistQuery);
      if (results.length > 0) {
        setBrowseResults(results);
        setSelectedPrinting(results[0]);
        setFlipFace(false);
      }
    } catch { /* keep current card visible */ }
    finally {
      setIsLoadingBrowse(false);
    }
  }, []);

  const handleSetClick = useCallback(async (setCode: string, setName: string) => {
    const q = `e:${setCode}`;
    setQuery(q);
    setShowPreview(true);
    setIsLoadingBrowse(true);
    setBrowseResults([]);
    setBrowseLabel(setName);
    setPrintings([]);
    try {
      const results = await searchCards(q);
      if (results.length > 0) {
        setBrowseResults(results);
        setSelectedPrinting(results[0]);
        setFlipFace(false);
      }
    } catch { /* keep current card visible */ }
    finally {
      setIsLoadingBrowse(false);
    }
  }, []);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showPreview) {
        if (e.key === "Escape") {
          e.preventDefault();
          handleCancel();
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        clearAll();
        return;
      }

      // Prefix query: Enter fires browse search regardless of dropdown state
      if (e.key === "Enter" && prefixHint) {
        e.preventDefault();
        if (prefixHint.type === "artist") handleArtistClick(prefixHint.value);
        else handleSetClick(prefixHint.value, prefixHint.value.toUpperCase());
        return;
      }

      if (!showDropdown) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const idx = focusedIndex >= 0 ? focusedIndex : 0;
        if (suggestions[idx]) handleSelectSuggestion(suggestions[idx]);
      }
    },
    [showPreview, showDropdown, suggestions, focusedIndex, prefixHint, handleCancel, clearAll, handleSelectSuggestion, handleArtistClick, handleSetClick],
  );

  const handleExternalQuery = useCallback((query: string) => {
    const artistMatch = query.match(/^a:"(.+)"$/);
    if (artistMatch) { handleArtistClick(artistMatch[1]); return; }
    const setMatch = query.match(/^e:(\w+)$/i);
    if (setMatch) { handleSetClick(setMatch[1], setMatch[1].toUpperCase()); return; }
  }, [handleArtistClick, handleSetClick]);

  useEffect(() => {
    registerSearchFn?.(handleExternalQuery);
  }, [registerSearchFn, handleExternalQuery]);

  const onArtPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = artStripRef.current;
    if (!el) return;
    artDrag.current = { isDown: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false };
    el.style.scrollSnapType = "none";
    el.style.cursor = "grabbing";
  };

  const onArtPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = artDrag.current;
    if (!d.isDown) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 4) d.moved = true;
    if (d.moved && artStripRef.current) artStripRef.current.scrollLeft = d.scrollLeft - dx;
  };

  const onArtPointerUp = () => {
    artDrag.current.isDown = false;
    const el = artStripRef.current;
    if (!el) return;
    el.style.scrollSnapType = "x proximity";
    el.style.cursor = "";
  };

  return (
    <div ref={containerRef} className="relative shrink-0 bg-surface-base z-[60] px-3 py-2">
      {/* Header row — visually styled input box */}
      <div className={`flex items-center gap-2 px-3 h-11 rounded-xl border bg-surface-panel ${inputFocused || showPreview ? "border-line-focus" : "border-line-subtle"}`}>
        <Search className="w-4 h-4 text-content-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            if (showPreview) {
              setShowPreview(false);
              setSelectedPrinting(null);
              setPrintings([]);
              setFlipFace(false);
              setBrowseResults([]);
              setBrowseLabel("");
              setIsLoadingBrowse(false);
            }
          }}
          onFocus={() => {
            setInputFocused(true);
            if (!showPreview && suggestions.length > 0 && query.length >= 2) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => setInputFocused(false)}
          onKeyDown={handleInputKeyDown}
          placeholder="Find a card by name…"
          className="flex-1 bg-transparent text-sm text-content-heading placeholder:text-content-muted outline-none"
          autoComplete="off"
          spellCheck={false}
        />
        {!inputFocused && !query && !showPreview && (
          <kbd className="text-[10px] text-content-disabled font-mono border border-line-subtle rounded px-1 py-0.5 shrink-0 select-none">
            /
          </kbd>
        )}
        {(query || showPreview) && (
          <button
            onClick={clearAll}
            className="text-content-muted hover:text-content-primary transition-colors shrink-0 p-0.5"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {showDropdown && !showPreview && (
        <div
          className="absolute left-3 right-3 top-full bg-surface-raised border border-line-default rounded-lg shadow-xl z-30 overflow-y-auto"
          style={{ maxHeight: 320 }}
        >
          {prefixHint ? (
            <button
              className="w-full text-left px-4 py-2.5 text-xs text-content-heading hover:bg-surface-deep transition-colors"
              onClick={() => {
                if (prefixHint.type === "artist") handleArtistClick(prefixHint.value);
                else handleSetClick(prefixHint.value, prefixHint.value.toUpperCase());
              }}
            >
              {prefixHint.type === "artist" ? (
                <>Search artist <span className="text-blue-400">"{prefixHint.value}"</span> →</>
              ) : (
                <>Search set <span className="text-blue-400">{prefixHint.value.toUpperCase()}</span> →</>
              )}
            </button>
          ) : (
            <>
              {isLoadingAC && (
                <div className="p-2 space-y-1.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-8 rounded-md bg-surface-deep animate-pulse" />
                  ))}
                </div>
              )}
              {!isLoadingAC && acError && (
                <button
                  className="w-full text-left px-4 py-3 text-xs text-content-muted hover:bg-surface-deep transition-colors"
                  onClick={retryAutocomplete}
                >
                  Could not reach Scryfall — try again
                </button>
              )}
              {!isLoadingAC && !acError && suggestions.length === 0 && (
                <div className="px-4 py-3 text-xs text-content-muted">No card matches</div>
              )}
              {!isLoadingAC &&
                !acError &&
                suggestions.map((name, i) => (
                  <button
                    key={name}
                    className={`w-full text-left px-4 py-2.5 text-xs text-content-heading transition-colors ${
                      focusedIndex === i ? "bg-surface-deep" : "hover:bg-surface-deep"
                    }`}
                    onMouseEnter={() => setFocusedIndex(i)}
                    onClick={() => handleSelectSuggestion(name)}
                  >
                    <span className="truncate block">{name}</span>
                  </button>
                ))}
            </>
          )}
        </div>
      )}

      {/* Preview — overlays the deck workspace */}
      {showPreview && (
        <div className="absolute left-3 right-3 top-full z-[100] bg-surface-panel border border-line-default rounded-lg shadow-xl overflow-y-auto" style={{ maxHeight: "80vh" }}>
          {isLoadingPreview || !selectedPrinting ? (
            <div className="flex gap-4 p-4">
              <div
                className="shrink-0 w-[220px] rounded-xl bg-surface-deep animate-pulse"
                style={{ aspectRatio: "488/680" }}
              />
              <div className="flex-1 space-y-3 pt-1">
                <div className="h-5 rounded-lg bg-surface-deep animate-pulse w-3/4" />
                <div className="h-4 rounded-lg bg-surface-deep animate-pulse w-1/2" />
                <div className="h-24 rounded-lg bg-surface-deep animate-pulse" />
                <div className="h-4 rounded-lg bg-surface-deep animate-pulse w-2/3" />
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex">
                {/* Left column: card art + buttons */}
                <div className="shrink-0 flex flex-col pr-4" style={{ width: 220 }}>
                  <div className="relative">
                    {artImage ? (
                      <img
                        src={artImage}
                        alt={selectedPrinting.name}
                        className="w-full rounded-xl object-cover"
                        style={{ aspectRatio: "488/680" }}
                      />
                    ) : (
                      <div
                        className="w-full rounded-xl bg-surface-deep flex items-center justify-center"
                        style={{ aspectRatio: "488/680" }}
                      >
                        <span className="text-content-muted text-xs">No image</span>
                      </div>
                    )}
                    {hasBackFace && (
                      <button
                        onClick={() => setFlipFace((f) => !f)}
                        className="absolute bottom-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 rounded-full text-white transition-colors"
                        title="Flip card"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleAddCard}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white transition-colors"
                    >
                      {addLabel}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-2 rounded-lg text-xs font-medium border border-line-default text-content-muted hover:bg-surface-deep hover:text-content-primary transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Center column: card info */}
                <div className="shrink-0 flex flex-col border-l border-line-subtle pl-4 pr-4" style={{ width: 280 }}>
                  {/* Name + set name */}
                  <div className="mb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-bold text-content-primary leading-tight">
                        {selectedPrinting.name}
                      </h2>
                      {renderManaSymbols(displayMana)}
                    </div>
                    <p className="text-xs text-content-muted mt-0.5">{selectedPrinting.set_name}</p>
                  </div>

                  {/* Card details box */}
                  <div className="bg-surface-raised border border-line-subtle rounded-xl p-3 mb-2 space-y-2">
                    {/* Type line */}
                    <p className="text-xs text-content-secondary font-medium">{selectedPrinting.type_line}</p>

                    {/* Oracle text */}
                    {displayOracleText && (
                      <div className="text-[11px] text-content-secondary overflow-y-auto" style={{ maxHeight: 100 }}>
                        {renderOracleText(displayOracleText)}
                      </div>
                    )}

                    {/* Flavor text */}
                    {displayFlavorText && (
                      <p className="text-[11px] italic text-content-muted border-t border-line-subtle pt-2">
                        {displayFlavorText}
                      </p>
                    )}
                  </div>

                  {/* Warning pills */}
                  {warnings.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {warnings.map((w) => (
                        <span
                          key={w.type}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                        >
                          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                          {w.text}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="space-y-1 mb-3">
                    <p className="text-[10px] font-semibold text-content-muted uppercase tracking-wider">Product Details</p>
                    <div className="space-y-0.5 text-[11px]">
                      {displayArtist && (
                        <div className="flex gap-2">
                          <span className="text-content-muted w-16 shrink-0">Artist</span>
                          <button
                            onClick={() => handleArtistClick(displayArtist)}
                            className="text-blue-400 hover:underline cursor-pointer text-left"
                          >
                            {displayArtist}
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <span className="text-content-muted w-16 shrink-0">Set</span>
                        <button
                          onClick={() => handleSetClick(selectedPrinting.set, selectedPrinting.set_name ?? selectedPrinting.set.toUpperCase())}
                          className="text-blue-400 hover:underline cursor-pointer text-left"
                        >
                          {selectedPrinting.set.toUpperCase()}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-content-muted w-16 shrink-0">Rarity</span>
                        <span className="text-content-secondary">{rarityLabel}</span>
                      </div>
                      {selectedPrinting.collector_number && (
                        <div className="flex gap-2">
                          <span className="text-content-muted w-16 shrink-0">Collector #</span>
                          <span className="text-content-secondary">{selectedPrinting.collector_number}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <span className="text-content-muted w-16 shrink-0">Price</span>
                        <span className="text-green-400">{priceStr}</span>
                      </div>
                      {selectedPrinting.released_at && (
                        <div className="flex gap-2">
                          <span className="text-content-muted w-16 shrink-0">Released</span>
                          <span className="text-content-secondary">{selectedPrinting.released_at}</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              {/* Right column: browse results (artist/set) or art variants */}
              {(isLoadingBrowse || browseResults.length > 0 || printings.length > 1) && (
                <div className="flex-1 min-w-0 flex flex-col border-l border-line-subtle pl-3">
                  {isLoadingBrowse ? (
                    <>
                      <div className="h-3 w-36 rounded bg-surface-deep animate-pulse mb-2" />
                      <div className="flex gap-2" style={{ height: 318 }}>
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="h-full w-[115px] rounded-lg bg-surface-deep animate-pulse shrink-0" />
                        ))}
                      </div>
                    </>
                  ) : browseResults.length > 0 ? (
                    <>
                      <p className="text-[10px] font-semibold text-content-muted uppercase tracking-wider mb-2">
                        {browseLabel} — {browseResults.length} card{browseResults.length !== 1 ? "s" : ""}
                      </p>
                      <div
                        ref={artStripRef}
                        className="flex gap-2 overflow-x-auto pr-1.5 pt-1.5 pb-2 cursor-grab select-none [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-surface-deep"
                        style={{ scrollSnapType: "x proximity", height: 318 }}
                        onPointerDown={onArtPointerDown}
                        onPointerMove={onArtPointerMove}
                        onPointerUp={onArtPointerUp}
                        onPointerLeave={onArtPointerUp}
                        onDragStart={(e) => e.preventDefault()}
                        onWheel={(e) => { if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) e.currentTarget.scrollLeft += e.deltaY; }}
                      >
                        <div className="w-1 shrink-0" />
                        {browseResults.map((p) => {
                          const tileImg = p.image_uris?.normal ?? p.card_faces?.[0]?.image_uris?.normal;
                          const isSelected = p.id === selectedPrinting?.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => {
                                if (artDrag.current.moved) return;
                                setSelectedPrinting(p);
                                setFlipFace(false);
                              }}
                              style={{ scrollSnapAlign: "start", flexShrink: 0 }}
                              className={`relative h-full rounded-lg overflow-hidden transition-all ${
                                isSelected ? "" : "opacity-60 hover:opacity-100"
                              }`}
                            >
                              {tileImg ? (
                                <img
                                  src={tileImg}
                                  alt={p.name}
                                  className="h-full w-auto"
                                  draggable={false}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="h-full w-16 bg-surface-deep flex items-center justify-center text-[8px] text-content-muted">
                                  {p.set.toUpperCase()}
                                </div>
                              )}
                              {isSelected && (
                                <div
                                  className="absolute inset-0 rounded-lg pointer-events-none"
                                  style={{ boxShadow: "inset 0 0 0 3px var(--color-line-focus)" }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-semibold text-content-muted uppercase tracking-wider mb-2">
                        Art Variants — {printings.length} printing{printings.length !== 1 ? "s" : ""}
                      </p>
                      <div
                        ref={artStripRef}
                        className="flex gap-2 overflow-x-auto pr-1.5 pt-1.5 pb-2 cursor-grab select-none [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-surface-deep"
                        style={{ scrollSnapType: "x proximity", height: 318 }}
                        onPointerDown={onArtPointerDown}
                        onPointerMove={onArtPointerMove}
                        onPointerUp={onArtPointerUp}
                        onPointerLeave={onArtPointerUp}
                        onDragStart={(e) => e.preventDefault()}
                        onWheel={(e) => { if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) e.currentTarget.scrollLeft += e.deltaY; }}
                      >
                        <div className="w-1 shrink-0" />
                        {printings.map((p) => {
                          const tileImg = p.image_uris?.normal ?? p.card_faces?.[0]?.image_uris?.normal;
                          const isSelected = p.id === selectedPrinting?.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => {
                                if (artDrag.current.moved) return;
                                setSelectedPrinting(p);
                                setFlipFace(false);
                              }}
                              style={{ scrollSnapAlign: "start", flexShrink: 0 }}
                              className={`relative h-full rounded-lg overflow-hidden transition-all ${
                                isSelected ? "" : "opacity-60 hover:opacity-100"
                              }`}
                            >
                              {tileImg ? (
                                <img
                                  src={tileImg}
                                  alt={`${p.set_name} — ${p.set.toUpperCase()}`}
                                  className="h-full w-auto"
                                  draggable={false}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="h-full w-16 bg-surface-deep flex items-center justify-center text-[8px] text-content-muted">
                                  {p.set.toUpperCase()}
                                </div>
                              )}
                              {isSelected && (
                                <div
                                  className="absolute inset-0 rounded-lg pointer-events-none"
                                  style={{ boxShadow: "inset 0 0 0 3px var(--color-line-focus)" }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
