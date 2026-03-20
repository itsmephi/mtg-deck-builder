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
      <div className="flex items-center flex-wrap min-w-0 bg-neutral-950 border border-neutral-800 rounded-lg px-2 gap-1 min-h-[32px] transition-colors focus-within:border-neutral-600">
        <Search size={14} className="text-neutral-500 shrink-0" />

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
                  : "bg-neutral-800 border border-neutral-600 text-neutral-300"
                : "bg-neutral-800 border border-neutral-700 text-neutral-500"
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
            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] text-neutral-300 shrink-0 cursor-pointer transition-colors hover:border-red-500/60 hover:text-red-400 group select-none"
            title="Click to remove"
          >
            <span className="text-neutral-500 text-[9px] uppercase tracking-wide">
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
          className="flex-1 min-w-[80px] bg-transparent border-none text-neutral-200 text-xs outline-none placeholder:text-neutral-600 py-0.5"
        />

        {/* Clear button */}
        {(query || tokens.length > 0) && (
          <button
            onClick={onClear}
            className="w-4 h-4 flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700 transition-colors shrink-0"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {showAutocomplete && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl overflow-hidden z-50">
          {/* Card name matches */}
          {autocompleteSuggestions.length > 0 && (
            <div className="py-1">
              <div className="px-2.5 py-1 text-[9px] text-neutral-500 uppercase tracking-wider">
                Cards
              </div>
              {autocompleteSuggestions.slice(0, 5).map((name) => (
                <button
                  key={name}
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent input blur before click
                    onSelectAutocomplete(name);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 transition-colors text-left"
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
            <div className="px-2.5 py-2 border-t border-neutral-800 flex flex-wrap gap-1 items-center">
              <span className="text-[9px] text-neutral-500 mr-1">Parsed:</span>
              {tokens.map((token, i) => (
                <span
                  key={i}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onRemoveToken(i);
                  }}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] text-neutral-300 cursor-pointer hover:border-red-500/60 hover:text-red-400 select-none"
                >
                  <span className="text-neutral-500 text-[9px] uppercase tracking-wide">
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
