"use client";

interface SearchTakeoverProps {
  onSearch: (query: string) => void;
  onTagSelect: (tag: string) => void;
}

const QUICK_TAGS = [
  "Ramp", "Removal", "Card Draw", "Wipes",
  "Tokens", "Creatures", "Burn", "Lands",
];

export default function SearchTakeover({ onSearch, onTagSelect }: SearchTakeoverProps) {
  return (
    <div
      className="flex-1 flex flex-col items-center overflow-y-auto"
      style={{ paddingTop: "10%" }}
    >
      <div className="flex flex-col items-center gap-4 w-full px-6 pb-8 max-w-[480px]">

        {/* Prompt */}
        <h2 className="text-base font-medium text-content-heading">
          What are you building with?
        </h2>

        {/* Search input */}
        <input
          autoFocus
          type="text"
          placeholder="Search for a card…"
          className="
            w-full max-w-[380px]
            bg-surface-raised border border-line-default rounded-lg
            py-2.5 px-3.5 text-sm text-content-primary
            placeholder:text-content-muted
            focus:outline-none focus:border-input-edge-focus
            transition-colors
          "
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              onSearch(e.currentTarget.value.trim());
            }
          }}
        />

        {/* Divider */}
        <span className="text-xs text-content-faint tracking-wide">
          or start with a category
        </span>

        {/* Quick tags */}
        <div className="flex flex-wrap gap-2 justify-center max-w-[380px]">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagSelect(tag)}
              className="
                text-xs py-1.5 px-3.5 rounded-full
                bg-surface-raised border border-line-default
                text-content-secondary
                hover:bg-[color:var(--input-edge-focus)]/8
                hover:text-[color:var(--input-edge-focus)]
                hover:border-input-edge-focus
                transition-colors cursor-pointer
              "
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
