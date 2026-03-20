"use client";

import { useEffect, useRef, useState } from "react";

export interface FilterState {
  priceMin: number;
  priceMax: number;
  anyPrice: boolean;
  rarities: Set<string>;
  types: Set<string>;
  colors: Set<string>;
}

export const DEFAULT_FILTERS: FilterState = {
  priceMin: 0,
  priceMax: 100,
  anyPrice: false,
  rarities: new Set(["common", "uncommon", "rare", "mythic"]),
  types: new Set(["creature", "instant", "sorcery", "enchantment", "artifact", "land", "planeswalker"]),
  colors: new Set(["W", "U", "B", "R", "G", "C"]),
};

export const SIDEBAR_FILTERS_STORAGE_KEY = "mtg-sidebar-filters";

export function serializeFilters(f: FilterState): string {
  return JSON.stringify({
    priceMin: f.priceMin,
    priceMax: f.priceMax,
    anyPrice: f.anyPrice,
    rarities: Array.from(f.rarities),
    types: Array.from(f.types),
    colors: Array.from(f.colors),
  });
}

export function deserializeFilters(raw: string): FilterState {
  try {
    const parsed = JSON.parse(raw);
    return {
      priceMin: parsed.priceMin ?? DEFAULT_FILTERS.priceMin,
      priceMax: parsed.priceMax ?? DEFAULT_FILTERS.priceMax,
      anyPrice: parsed.anyPrice ?? DEFAULT_FILTERS.anyPrice,
      rarities: new Set(parsed.rarities ?? Array.from(DEFAULT_FILTERS.rarities)),
      types: new Set(parsed.types ?? Array.from(DEFAULT_FILTERS.types)),
      colors: new Set(parsed.colors ?? Array.from(DEFAULT_FILTERS.colors)),
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function buildSidebarFilterSyntax(filters: FilterState): string {
  const parts: string[] = [];

  if (!filters.anyPrice) {
    if (filters.priceMin > 0) parts.push(`usd>=${filters.priceMin}`);
    parts.push(`usd<=${filters.priceMax}`);
  }

  const allRarities = new Set(["common", "uncommon", "rare", "mythic"]);
  if (filters.rarities.size < allRarities.size && filters.rarities.size > 0) {
    const q = Array.from(filters.rarities).map((r) => `r:${r}`).join(" OR ");
    parts.push(`(${q})`);
  }

  const allTypes = new Set(["creature", "instant", "sorcery", "enchantment", "artifact", "land", "planeswalker"]);
  if (filters.types.size < allTypes.size && filters.types.size > 0) {
    const q = Array.from(filters.types).map((t) => `t:${t}`).join(" OR ");
    parts.push(`(${q})`);
  }

  const allColors = new Set(["W", "U", "B", "R", "G", "C"]);
  if (filters.colors.size < allColors.size && filters.colors.size > 0) {
    const q = Array.from(filters.colors).map((c) => `c:${c}`).join(" OR ");
    parts.push(`(${q})`);
  }

  return parts.join(" ");
}

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const RARITIES = ["common", "uncommon", "rare", "mythic"] as const;
const TYPES = ["creature", "instant", "sorcery", "enchantment", "artifact", "land", "planeswalker"] as const;
const COLORS = [
  { key: "W", label: "White" },
  { key: "U", label: "Blue" },
  { key: "B", label: "Black" },
  { key: "R", label: "Red" },
  { key: "G", label: "Green" },
  { key: "C", label: "Colorless" },
] as const;

function ToggleChip({
  active,
  onClick,
  activeClassName = "bg-blue-900/30 border-blue-500/30 text-blue-400",
  children,
}: {
  active: boolean;
  onClick: () => void;
  activeClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border transition-colors ${
        active
          ? activeClassName
          : "bg-neutral-800 border-neutral-700 text-neutral-500"
      }`}
    >
      {children}
    </button>
  );
}

const COLOR_ACTIVE_CLASS: Record<string, string> = {
  W: "bg-stone-700/40 border-stone-400/50 text-stone-300",
  U: "bg-blue-900/40 border-blue-500/40 text-blue-400",
  B: "bg-neutral-700/60 border-neutral-500/50 text-neutral-300",
  R: "bg-red-900/40 border-red-600/40 text-red-400",
  G: "bg-green-900/40 border-green-600/40 text-green-400",
  C: "bg-neutral-700/40 border-neutral-500/40 text-neutral-400",
};

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [localMin, setLocalMin] = useState(String(filters.priceMin));
  const [localMax, setLocalMax] = useState(String(filters.priceMax));

  useEffect(() => { setLocalMin(String(filters.priceMin)); }, [filters.priceMin]);
  useEffect(() => { setLocalMax(String(filters.priceMax)); }, [filters.priceMax]);

  const [dragMax, setDragMax] = useState<number | null>(null);

  const calcMax = (clientX: number, rect: DOMRect) => {
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.min(100, Math.round(Math.max(filters.priceMin + 1, ratio * 100)));
  };

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    e.preventDefault();
    const rect = sliderRef.current.getBoundingClientRect();
    setDragMax(calcMax(e.clientX, rect));

    const onMove = (me: MouseEvent) => {
      setDragMax(calcMax(me.clientX, rect));
    };
    const onUp = (me: MouseEvent) => {
      const val = calcMax(me.clientX, rect);
      setDragMax(null);
      onFiltersChange({ ...filters, priceMax: val });
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div className="p-2.5 space-y-4">
      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Price Range</div>
          <button
            onClick={() => onFiltersChange({ ...filters, anyPrice: !filters.anyPrice })}
            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
              filters.anyPrice
                ? "bg-blue-900/30 border-blue-500/30 text-blue-400"
                : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Any
          </button>
        </div>
        <div className={`flex items-center gap-2 ${filters.anyPrice ? "opacity-30 pointer-events-none" : ""}`}>
          <div className="flex items-center">
            <span className="text-xs text-neutral-400 mr-0.5">$</span>
            <input
              type="text"
              value={localMin}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setLocalMin(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              onBlur={() => {
                const val = Math.max(0, Math.min(parseInt(localMin || "0", 10), filters.priceMax - 1));
                setLocalMin(String(val));
                onFiltersChange({ ...filters, priceMin: val });
              }}
              className="w-10 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-300 px-1.5 py-0.5 text-center focus:outline-none focus:border-neutral-500"
            />
          </div>
          <div
            ref={sliderRef}
            className="flex-1 relative h-2 bg-neutral-700 rounded cursor-pointer"
            onMouseDown={handleSliderMouseDown}
          >
            {(() => {
              const displayMax = dragMax ?? filters.priceMax;
              return (
                <>
                  <div
                    className="absolute h-full bg-blue-500 rounded"
                    style={{
                      left: `${(filters.priceMin / 100) * 100}%`,
                      width: `${((displayMax - filters.priceMin) / 100) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full border-2 border-blue-500 shadow"
                    style={{ left: `${(displayMax / 100) * 100}%`, cursor: dragMax !== null ? "grabbing" : "grab" }}
                  />
                </>
              );
            })()}
          </div>
          <div className="flex items-center">
            <span className="text-xs text-neutral-400 mr-0.5">$</span>
            <input
              type="text"
              value={dragMax !== null ? String(dragMax) : localMax}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setLocalMax(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              onBlur={() => {
                const val = Math.min(100, Math.max(filters.priceMin + 1, parseInt(localMax || "0", 10)));
                setLocalMax(String(val));
                onFiltersChange({ ...filters, priceMax: val });
              }}
              className="w-10 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-300 px-1.5 py-0.5 text-center focus:outline-none focus:border-neutral-500"
            />
          </div>
        </div>
      </div>

      {/* Rarity */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Rarity</div>
          <button
            onClick={() =>
              onFiltersChange({
                ...filters,
                rarities: filters.rarities.size === RARITIES.length ? new Set() : new Set(RARITIES),
              })
            }
            className="text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {filters.rarities.size === RARITIES.length ? "None" : "All"}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RARITIES.map((r) => (
            <ToggleChip
              key={r}
              active={filters.rarities.has(r)}
              onClick={() =>
                onFiltersChange({ ...filters, rarities: toggle(filters.rarities, r) })
              }
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </ToggleChip>
          ))}
        </div>
      </div>

      {/* Card Type */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Card Type</div>
          <button
            onClick={() =>
              onFiltersChange({
                ...filters,
                types: filters.types.size === TYPES.length ? new Set() : new Set(TYPES),
              })
            }
            className="text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {filters.types.size === TYPES.length ? "None" : "All"}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => (
            <ToggleChip
              key={t}
              active={filters.types.has(t)}
              onClick={() =>
                onFiltersChange({ ...filters, types: toggle(filters.types, t) })
              }
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </ToggleChip>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Colors</div>
          <button
            onClick={() =>
              onFiltersChange({
                ...filters,
                colors: filters.colors.size === COLORS.length ? new Set() : new Set(COLORS.map((c) => c.key)),
              })
            }
            className="text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {filters.colors.size === COLORS.length ? "None" : "All"}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map(({ key, label }) => (
            <ToggleChip
              key={key}
              active={filters.colors.has(key)}
              activeClassName={COLOR_ACTIVE_CLASS[key]}
              onClick={() =>
                onFiltersChange({ ...filters, colors: toggle(filters.colors, key) })
              }
            >
              <img
                src={`https://svgs.scryfall.io/card-symbols/${key}.svg`}
                className="w-3 h-3"
                alt={key}
              />
              {label}
            </ToggleChip>
          ))}
        </div>
      </div>
    </div>
  );
}
