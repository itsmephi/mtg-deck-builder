"use client";

import { useRef } from "react";

export interface FilterState {
  priceMin: number;
  priceMax: number;
  rarities: Set<string>;
  types: Set<string>;
  colors: Set<string>;
}

export const DEFAULT_FILTERS: FilterState = {
  priceMin: 0,
  priceMax: 100,
  rarities: new Set(["common", "uncommon", "rare", "mythic"]),
  types: new Set(["creature", "instant", "sorcery", "enchantment", "artifact", "land", "planeswalker"]),
  colors: new Set(["W", "U", "B", "R", "G", "C"]),
};

export function buildSidebarFilterSyntax(filters: FilterState): string {
  const parts: string[] = [];

  if (filters.priceMin > 0) parts.push(`usd>=${filters.priceMin}`);
  if (filters.priceMax < 100) parts.push(`usd<=${filters.priceMax}`);

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
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border transition-colors ${
        active
          ? "bg-blue-900/30 border-blue-500/30 text-blue-400"
          : "bg-neutral-800 border-neutral-700 text-neutral-500"
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleSliderClick = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newMax = Math.round(Math.max(filters.priceMin + 1, ratio * 100));
    onFiltersChange({ ...filters, priceMax: Math.min(100, newMax) });
  };

  return (
    <div className="p-2.5 space-y-4">
      {/* Price Range */}
      <div>
        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">
          Price Range
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={`$${filters.priceMin}`}
            onChange={(e) => {
              const val = parseInt(e.target.value.replace(/[^0-9]/g, "") || "0", 10);
              onFiltersChange({
                ...filters,
                priceMin: Math.max(0, Math.min(val, filters.priceMax - 1)),
              });
            }}
            className="w-12 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-300 px-1.5 py-0.5 text-center focus:outline-none focus:border-neutral-500"
          />
          <div
            ref={sliderRef}
            className="flex-1 relative h-2 bg-neutral-700 rounded cursor-pointer"
            onClick={handleSliderClick}
          >
            <div
              className="absolute h-full bg-blue-500 rounded"
              style={{
                left: `${(filters.priceMin / 100) * 100}%`,
                width: `${((filters.priceMax - filters.priceMin) / 100) * 100}%`,
              }}
            />
          </div>
          <input
            type="text"
            value={`$${filters.priceMax}`}
            onChange={(e) => {
              const val = parseInt(e.target.value.replace(/[^0-9]/g, "") || "0", 10);
              onFiltersChange({
                ...filters,
                priceMax: Math.min(100, Math.max(filters.priceMin + 1, val)),
              });
            }}
            className="w-12 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-300 px-1.5 py-0.5 text-center focus:outline-none focus:border-neutral-500"
          />
        </div>
      </div>

      {/* Rarity */}
      <div>
        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Rarity</div>
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
        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Card Type</div>
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
        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Colors</div>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map(({ key, label }) => (
            <ToggleChip
              key={key}
              active={filters.colors.has(key)}
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
