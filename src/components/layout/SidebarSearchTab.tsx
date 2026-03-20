"use client";

import { useDeckManager } from "@/hooks/useDeckManager";
import CategoryChips from "./CategoryChips";
import FilterPanel, { FilterState } from "./FilterPanel";

interface SidebarSearchTabProps {
  activeChipId: string | null;
  onSelectChip: (id: string, query: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function SidebarSearchTab({
  activeChipId,
  onSelectChip,
  filters,
  onFiltersChange,
}: SidebarSearchTabProps) {
  const { activeDeck } = useDeckManager();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <CategoryChips
        activeDeckFormat={activeDeck?.format ?? null}
        activeChipId={activeChipId}
        onSelectChip={onSelectChip}
      />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <FilterPanel filters={filters} onFiltersChange={onFiltersChange} />
      </div>
    </div>
  );
}
