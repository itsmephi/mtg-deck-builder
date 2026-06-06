"use client";

import { useEffect } from "react";
import {
  LayoutGrid,
  List,
  Layout,
  ArrowUp,
  ArrowDown,
  Dices,
  X,
} from "lucide-react";
import { SortBy, SortDir } from "@/hooks/useDeckManager";
import { DeckFormat } from "@/lib/formatRules";
import { TILE_SIZE_STOPS, TileSizeKey } from "@/config/gridConfig";

interface Props {
  open: boolean;
  onClose: () => void;
  format: DeckFormat;
  viewMode: "visual" | "list";
  setViewMode: (v: "visual" | "list") => void;
  sortBy: SortBy;
  setSortBy: (by: SortBy) => void;
  sortDir: SortDir;
  setSortDir: (dir: SortDir) => void;
  isGrouped: boolean;
  setIsGrouped: (g: boolean) => void;
  deckViewMode: "main" | "sideboard";
  setDeckViewMode: (v: "main" | "sideboard") => void;
  activeDeckHasSideboard: boolean;
  onOpenSampleHand: () => void;
  tileSize: TileSizeKey;
  onTileSizeChange: (stop: TileSizeKey) => void;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "name", label: "Name" },
  { value: "color", label: "Color" },
  { value: "mv", label: "Mana Value" },
];

// Touch-friendly segmented control. The desktop toolbar packs these same
// controls into a dense bar; on mobile they get full-width, finger-sized rows.
function SegButton({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 h-10 px-2 flex items-center justify-center gap-1.5 text-sm rounded-md transition-all ${
        active
          ? "bg-blue-600 text-white border border-blue-500/50"
          : disabled
          ? "text-content-disabled cursor-not-allowed border border-transparent"
          : "text-content-muted hover:text-content-secondary border border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold text-content-muted uppercase tracking-widest">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function DeckToolsSheet({
  open,
  onClose,
  format,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  isGrouped,
  setIsGrouped,
  deckViewMode,
  setDeckViewMode,
  activeDeckHasSideboard,
  onOpenSampleHand,
  tileSize,
  onTileSizeChange,
}: Props) {
  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Backdrop — z-[80] clears workspace chrome but sits below the z-[100]
          Simulator modal that this sheet can launch. */}
      <div
        className={`fixed inset-0 z-[80] bg-black/50 md:hidden transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Deck tools"
        className={`fixed inset-x-0 bottom-0 z-[90] md:hidden bg-surface-panel border-t border-line-default rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-line-subtle">
          <span className="text-sm font-semibold text-content-heading">Deck tools</span>
          <button
            onClick={onClose}
            aria-label="Close deck tools"
            className="w-9 h-9 -mr-2 flex items-center justify-center text-content-muted hover:text-content-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* Simulator — closes the sheet, then opens the modal */}
          <button
            onClick={() => {
              onClose();
              onOpenSampleHand();
            }}
            className="w-full h-11 flex items-center justify-center gap-2 bg-surface-base border border-line-subtle rounded-lg text-sm font-bold text-content-tertiary hover:text-content-primary hover:bg-surface-raised transition-colors"
          >
            <Dices className="w-4 h-4" />
            Simulator
          </button>

          {/* Main / Side — hidden for Commander, matching the desktop toolbar */}
          {format !== "commander" && (
            <Section label="Cards">
              <div className="flex items-center gap-1 bg-surface-base p-0.5 rounded-lg border border-line-subtle">
                <SegButton active={deckViewMode === "main"} onClick={() => setDeckViewMode("main")}>
                  Main
                </SegButton>
                <SegButton
                  active={deckViewMode === "sideboard"}
                  disabled={!activeDeckHasSideboard}
                  onClick={() => activeDeckHasSideboard && setDeckViewMode("sideboard")}
                >
                  Sideboard
                </SegButton>
              </div>
            </Section>
          )}

          {/* Sort */}
          <Section label="Sort by">
            <div className="grid grid-cols-2 gap-1 bg-surface-base p-0.5 rounded-lg border border-line-subtle">
              {SORT_OPTIONS.map((opt) => (
                <SegButton
                  key={opt.value}
                  active={sortBy === opt.value}
                  onClick={() => setSortBy(opt.value)}
                >
                  {opt.label}
                </SegButton>
              ))}
            </div>
            <button
              onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
              disabled={sortBy === "original"}
              className={`w-full h-10 flex items-center justify-center gap-2 rounded-lg border text-sm transition-colors ${
                sortBy === "original"
                  ? "text-content-disabled border-line-subtle cursor-not-allowed"
                  : "text-content-secondary border-line-subtle hover:bg-surface-raised"
              }`}
            >
              {sortDir === "asc" ? (
                <>
                  <ArrowUp className="w-4 h-4" /> Ascending
                </>
              ) : (
                <>
                  <ArrowDown className="w-4 h-4" /> Descending
                </>
              )}
            </button>
          </Section>

          {/* Group */}
          <Section label="Grouping">
            <div className="flex items-center gap-1 bg-surface-base p-0.5 rounded-lg border border-line-subtle">
              <SegButton active={!isGrouped} onClick={() => setIsGrouped(false)}>
                Flat
              </SegButton>
              <SegButton active={isGrouped} onClick={() => setIsGrouped(true)}>
                <Layout className="w-4 h-4" /> By type
              </SegButton>
            </div>
          </Section>

          {/* Card size — segmented (the desktop slider is pointer-only) */}
          <Section label="Card size">
            <div className="flex items-center gap-1 bg-surface-base p-0.5 rounded-lg border border-line-subtle">
              {TILE_SIZE_STOPS.map((stop) => (
                <SegButton
                  key={stop.key}
                  active={tileSize === stop.key}
                  onClick={() => onTileSizeChange(stop.key)}
                >
                  {stop.key.toUpperCase()}
                </SegButton>
              ))}
            </div>
          </Section>

          {/* View */}
          <Section label="View">
            <div className="flex items-center gap-1 bg-surface-base p-0.5 rounded-lg border border-line-subtle">
              <SegButton active={viewMode === "visual"} onClick={() => setViewMode("visual")}>
                <LayoutGrid className="w-4 h-4" /> Grid
              </SegButton>
              <SegButton active={viewMode === "list"} onClick={() => setViewMode("list")}>
                <List className="w-4 h-4" /> List
              </SegButton>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
