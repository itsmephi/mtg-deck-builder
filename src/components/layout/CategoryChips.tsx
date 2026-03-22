"use client";

interface Category {
  id: string;
  label: string;
  query: string;
  formats: readonly string[];
}

const CATEGORIES: Category[] = [
  { id: "ramp", label: "Ramp", query: "o:\"add\" (t:artifact OR t:enchantment OR t:instant OR t:sorcery OR t:land)", formats: ["all"] },
  { id: "removal", label: "Removal", query: "(o:\"destroy target\" OR o:\"exile target creature\" OR o:\"exile target permanent\")", formats: ["all"] },
  { id: "card-draw", label: "Card Draw", query: "(o:\"draw a card\" OR o:\"draw two cards\" OR o:\"draw three cards\")", formats: ["all"] },
  { id: "wipes", label: "Wipes", query: "(o:\"destroy all\" OR o:\"exile all creatures\" OR o:\"each creature gets\")", formats: ["all"] },
  { id: "tokens", label: "Tokens", query: "o:\"create\" o:\"token\"", formats: ["all"] },
  { id: "counters", label: "Counters", query: "t:instant o:\"counter target spell\"", formats: ["Commander", "Freeform"] },
  { id: "tutors", label: "Tutors", query: "o:\"search your library\" (t:instant OR t:sorcery OR t:enchantment)", formats: ["Commander", "Freeform"] },
  { id: "burn", label: "Burn", query: "t:instant OR t:sorcery o:\"deals\" o:\"damage\"", formats: ["Standard", "Freeform"] },
  { id: "creatures", label: "Creatures", query: "t:creature", formats: ["all"] },
  { id: "lands", label: "Lands", query: "t:land -t:basic", formats: ["Commander", "Freeform"] },
];

interface CategoryChipsProps {
  activeDeckFormat: string | null;
  activeChipId: string | null;
  onSelectChip: (id: string, query: string) => void;
}

export default function CategoryChips({
  activeDeckFormat,
  activeChipId,
  onSelectChip,
}: CategoryChipsProps) {
  // Normalize format for comparison
  const fmt = activeDeckFormat?.toLowerCase() ?? "freeform";
  const fmtLabel = fmt === "commander" ? "Commander" : fmt === "standard" ? "Standard" : "Freeform";

  const visible = CATEGORIES.filter(
    (c) => c.formats.includes("all") || c.formats.includes(fmtLabel)
  );

  return (
    <div className="px-2.5 pt-2 pb-1 border-b border-line-subtle shrink-0">
      <div className="text-[9px] text-content-faint uppercase tracking-wider mb-1.5">
        Quick Search
      </div>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((cat) => {
          const isActive = activeChipId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectChip(cat.id, cat.query)}
              className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                isActive
                  ? "bg-blue-900/30 border-blue-500/30 text-blue-400"
                  : "bg-surface-raised border-line-default text-content-tertiary hover:text-content-heading hover:border-line-hover"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
