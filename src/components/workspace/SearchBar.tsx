"use client";

import { useRef, useEffect } from "react";
import { Search, X, Lock } from "lucide-react";
import { ParsedToken } from "@/lib/nlpParser";

interface FilterBadge {
  label: string;
  manaColors?: string[];
  active: boolean;
}

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  tokens: ParsedToken[];
  onRemoveToken: (index: number) => void;
  filterBadge: FilterBadge | null;
  onToggleFilter: () => void;
  autocompleteSuggestions: string[];
  deckCardNames: Set<string>;
  onSelectAutocomplete: (name: string) => void;
  onDismissAutocomplete: () => void;
  showAutocomplete: boolean;
}

function ManaPip({ symbol }: { symbol: string }) {
  return (
    <img
      src={`https://svgs.scryfall.io/card-symbols/${symbol}.svg`}
      className="w-3 h-3 inline-block"
      alt={symbol}
    />
  );
}

export default function SearchBar({
  query,
  onChange,
  onClear,
  inputRef,
  tokens,
  onRemoveToken,
  filterBadge,
  onToggleFilter,
  autocompleteSuggestions,
  deckCardNames,
  onSelectAutocomplete,
  onDismissAutocomplete,
  showAutocomplete,
}: SearchBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close autocomplete on outside click
  useEffect(() => {
    if (!showAutocomplete) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onDismissAutocomplete();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [showAutocomplete, onDismissAutocomplete]);

  return (
    <div ref={containerRef} className="flex-1 relative min-w-0">
      {/* Search bar row */}
      <div className="flex items-center flex-wrap min-w-0 bg-surface-deep border border-line-subtle rounded-lg px-2 gap-1 min-h-[32px] transition-colors focus-within:border-input-edge-focus">
        <Search size={14} className="text-content-muted shrink-0" />

        {/* Filter badge */}
        {filterBadge && (
          <span
            onClick={onToggleFilter}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] shrink-0 cursor-pointer transition-colors select-none ${
              filterBadge.active
                ? filterBadge.label.toLowerCase() === "commander"
                  ? "bg-yellow-900/30 border border-yellow-500/25 text-yellow-400"
                  : filterBadge.label.toLowerCase() === "standard"
                  ? "bg-blue-900/30 border border-blue-500/25 text-blue-400"
                  : "bg-surface-raised border border-line-hover text-content-secondary"
                : "bg-surface-raised border border-line-default text-content-muted"
            }`}
          >
            <Lock size={9} />
            {filterBadge.label}
            {filterBadge.manaColors?.map((color) => (
              <ManaPip key={color} symbol={color} />
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFilter();
              }}
              className="opacity-60 hover:opacity-100 leading-none"
            >
              ×
            </button>
          </span>
        )}

        {/* NLP token chips */}
        {tokens.map((token, i) => (
          <span
            key={i}
            onClick={() => onRemoveToken(i)}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface-raised border border-line-default rounded text-[10px] text-content-secondary shrink-0 cursor-pointer transition-colors hover:border-red-500/60 hover:text-red-400 group select-none"
            title="Click to remove"
          >
            <span className="text-content-muted text-[9px] uppercase tracking-wide">
              {token.label}:
            </span>
            {token.value}
            <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity leading-none">
              ×
            </span>
          </span>
        ))}

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") onDismissAutocomplete();
          }}
          placeholder={tokens.length > 0 ? "Add more filters..." : "Search for cards, types, keywords..."}
          className="flex-1 min-w-[80px] bg-transparent border-none text-input-value text-xs outline-none placeholder:text-input-placeholder py-0.5"
        />

        {/* Clear button */}
        {(query || tokens.length > 0) && (
          <button
            onClick={onClear}
            className="w-4 h-4 flex items-center justify-center rounded-full text-content-muted hover:text-content-secondary hover:bg-surface-overlay transition-colors shrink-0"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {showAutocomplete && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-base border border-line-default rounded-lg shadow-xl overflow-hidden z-50">
          {/* Card name matches */}
          {autocompleteSuggestions.length > 0 && (
            <div className="py-1">
              <div className="px-2.5 py-1 text-[9px] text-content-muted uppercase tracking-wider">
                Cards
              </div>
              {autocompleteSuggestions.slice(0, 5).map((name) => (
                <button
                  key={name}
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent input blur before click
                    onSelectAutocomplete(name);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-content-secondary hover:bg-surface-raised hover:text-content-primary transition-colors text-left"
                >
                  {deckCardNames.has(name) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  )}
                  <span className="truncate">{name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Parsed token preview */}
          {tokens.length > 0 && (
            <div className="px-2.5 py-2 border-t border-line-subtle flex flex-wrap gap-1 items-center">
              <span className="text-[9px] text-content-muted mr-1">Parsed:</span>
              {tokens.map((token, i) => (
                <span
                  key={i}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onRemoveToken(i);
                  }}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface-raised border border-line-default rounded text-[10px] text-content-secondary cursor-pointer hover:border-red-500/60 hover:text-red-400 select-none"
                >
                  <span className="text-content-muted text-[9px] uppercase tracking-wide">
                    {token.label}:
                  </span>
                  {token.value}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
