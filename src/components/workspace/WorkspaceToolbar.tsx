"use client";

import { useRef, useState, useEffect } from "react";
import {
  LayoutGrid,
  List,
  Layout,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Dices,
} from "lucide-react";
import { Deck } from "@/types";
import { SortBy, SortDir, useDeckManager } from "@/hooks/useDeckManager";
import { getFormatRules, DeckFormat } from "@/lib/formatRules";
import { FormatPicker } from "@/components/layout/FormatPicker";

interface Props {
  activeDeck: Deck;
  onUpdateDeckName: (name: string) => void;
  // Stats
  totalCards: number;
  totalValue: number;
  remainingCost: number;
  hasPriceData: boolean;
  // View controls
  viewMode: "visual" | "list";
  setViewMode: (v: "visual" | "list") => void;
  sortBy: SortBy;
  setSortBy: (by: SortBy) => void;
  sortDir: SortDir;
  setSortDir: (dir: SortDir) => void;
  isGrouped: boolean;
  setIsGrouped: (g: boolean) => void;
  // Deck view mode
  deckViewMode: "main" | "sideboard";
  setDeckViewMode: (v: "main" | "sideboard") => void;
  activeDeckHasSideboard: boolean;
  sideboardCardCount: number;
  // Modals
  onOpenSampleHand: () => void;
  // Commander dialog trigger (from parent for sideboard-to-commander case)
  onRequestFormatChange?: (format: DeckFormat) => void;
}

export default function WorkspaceToolbar({
  activeDeck,
  onUpdateDeckName,
  totalCards,
  totalValue,
  remainingCost,
  hasPriceData,
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
  sideboardCardCount,
  onOpenSampleHand,
  onRequestFormatChange,
}: Props) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [formatPickerOpen, setFormatPickerOpen] = useState(false);
  const [formatPickerDir, setFormatPickerDir] = useState<"up" | "down">("down");
  const formatPickerRef = useRef<HTMLDivElement>(null);
  const nameMeasureRef = useRef<HTMLSpanElement>(null);
  const [nameInputWidth, setNameInputWidth] = useState(80);

  useEffect(() => {
    if (nameMeasureRef.current) {
      setNameInputWidth(Math.max(80, nameMeasureRef.current.scrollWidth + 2));
    }
  }, [activeDeck.name]);

  const { setDeckFormat, mergeSideboardIntoDeck, deleteSideboardForFormat } = useDeckManager();

  // Close format picker on outside click
  useEffect(() => {
    if (!formatPickerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (formatPickerRef.current && !formatPickerRef.current.contains(e.target as Node)) {
        setFormatPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [formatPickerOpen]);

  const format = activeDeck.format ?? "freeform";
  const rules = getFormatRules(format);

  // Card count color
  const cardCountClass =
    rules.cardCountGreen !== null && totalCards === rules.cardCountGreen
      ? "text-green-400 font-bold"
      : rules.cardCountRed(totalCards)
      ? "text-red-400 font-bold"
      : "";

  // Sideboard count color (Standard: max 15)
  const sideboardClass =
    format === "standard" && sideboardCardCount > 15
      ? "text-red-400 font-bold"
      : format === "standard" && sideboardCardCount === 15
      ? "text-green-400 font-bold"
      : "";

  const handleFormatSelect = (newFormat: DeckFormat) => {
    setFormatPickerOpen(false);
    if (onRequestFormatChange) {
      onRequestFormatChange(newFormat);
    } else {
      // Fallback: direct change (no confirmation dialog available here)
      if (newFormat === "commander") {
        const sideboardCount = activeDeck.sideboard?.reduce((s, c) => s + c.quantity, 0) ?? 0;
        if (sideboardCount > 0) {
          // No dialog available — skip (parent should handle via onRequestFormatChange)
          return;
        } else if (activeDeck.sideboard !== undefined) {
          deleteSideboardForFormat(activeDeck.id);
        }
      }
      setDeckFormat(activeDeck.id, newFormat);
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-4 pb-3 border-b border-neutral-800">
      {/* Row 1: deck name + format badge */}
      <div className="flex items-center gap-1.5">
        {/* Hidden span to measure exact rendered text width */}
        <span
          ref={nameMeasureRef}
          className="invisible absolute whitespace-pre pointer-events-none text-3xl"
          aria-hidden="true"
        >
          {activeDeck.name || "Untitled"}
        </span>
        <input
          value={activeDeck.name}
          onChange={(e) => onUpdateDeckName(e.target.value)}
          style={{ width: nameInputWidth }}
          onFocus={() => setIsEditingName(true)}
          onBlur={() => setIsEditingName(false)}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
          className={`text-3xl text-white bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-blue-500 focus:outline-none transition-all px-0 outline-none placeholder:text-neutral-500 ${isEditingName ? "" : "truncate"}`}
          placeholder="Untitled"
        />

        {/* Format badge pill */}
        <div className="relative">
          {format === "standard" && (
            <span
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setFormatPickerDir((window.innerHeight - rect.bottom) > rect.top ? "down" : "up");
                setFormatPickerOpen(!formatPickerOpen);
              }}
              className="text-[10px] font-medium text-blue-400 bg-blue-400/10 border border-blue-400/20 px-1.5 py-0.5 rounded-full cursor-pointer hover:bg-blue-400/20 transition-colors select-none"
            >
              Standard
            </span>
          )}
          {format === "commander" && (
            <span
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setFormatPickerDir((window.innerHeight - rect.bottom) > rect.top ? "down" : "up");
                setFormatPickerOpen(!formatPickerOpen);
              }}
              className="text-[10px] font-medium text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-1.5 py-0.5 rounded-full cursor-pointer hover:bg-yellow-400/20 transition-colors select-none"
            >
              Commander
            </span>
          )}
          {format === "freeform" && (
            <span
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setFormatPickerDir((window.innerHeight - rect.bottom) > rect.top ? "down" : "up");
                setFormatPickerOpen(!formatPickerOpen);
              }}
              className="text-[10px] font-medium text-neutral-500 bg-neutral-500/10 border border-neutral-500/20 px-1.5 py-0.5 rounded-full cursor-pointer hover:bg-neutral-500/20 transition-colors select-none"
            >
              Freeform
            </span>
          )}
          {formatPickerOpen && (
            <div
              ref={formatPickerRef}
              className={`absolute left-0 w-52 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-50 ${formatPickerDir === "down" ? "top-full mt-1" : "bottom-full mb-1"}`}
            >
              <FormatPicker
                currentFormat={format}
                onSelect={handleFormatSelect}
              />
            </div>
          )}
        </div>
      </div>

      {/* Row 2: stats (left) + controls (right) */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-neutral-400 shrink-0">
          {deckViewMode === "sideboard" ? (
            <span className={sideboardClass}>
              {format === "standard"
                ? `Side: ${sideboardCardCount} / 15`
                : `${sideboardCardCount} / 15`}
            </span>
          ) : (
            <span className={cardCountClass}>
              {totalCards} Cards
            </span>
          )}
          <span>
            Value:{" "}
            <span className="text-neutral-200 font-medium">
              {hasPriceData ? `$${totalValue.toFixed(2)}` : "N/A"}
            </span>
            {activeDeckHasSideboard && (
              <span className="text-neutral-500 ml-1">(M+S)</span>
            )}
          </span>
          <span>
            To Buy:{" "}
            <span className="text-green-500 font-medium">
              {hasPriceData ? `$${remainingCost.toFixed(2)}` : "N/A"}
            </span>
            {activeDeckHasSideboard && (
              <span className="text-neutral-500 ml-1">(M+S)</span>
            )}
          </span>
          {deckViewMode === "main" && activeDeckHasSideboard && (
            <span className="text-neutral-600">
              SB: {sideboardCardCount}
            </span>
          )}
        </div>

      {/* Right: simulator + main/side + sort/group/view */}
      <div className="flex items-center gap-2 h-8 shrink-0">
        <button
          onClick={onOpenSampleHand}
          className="flex items-center gap-2 h-full px-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <Dices className="w-4 h-4" />
          <span className="whitespace-nowrap">Simulator</span>
        </button>

        {/* Main / Side pill — hidden for Commander */}
        {format !== "commander" && (
          <div className="flex items-center h-full bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 shadow-sm">
            <button
              onClick={() => setDeckViewMode("main")}
              className={`h-full px-2.5 text-xs rounded-md transition-all ${
                deckViewMode === "main"
                  ? "bg-blue-600 text-white border border-blue-500/50"
                  : "text-neutral-500 hover:text-neutral-300 border border-transparent"
              }`}
            >
              Main
            </button>
            <button
              onClick={() => activeDeckHasSideboard && setDeckViewMode("sideboard")}
              className={`h-full px-2.5 text-xs rounded-md transition-all ${
                deckViewMode === "sideboard"
                  ? "bg-blue-600 text-white border border-blue-500/50"
                  : activeDeckHasSideboard
                  ? "text-neutral-500 hover:text-neutral-300 border border-transparent"
                  : "text-neutral-700 cursor-not-allowed border border-transparent"
              }`}
            >
              Side
            </button>
          </div>
        )}

        {/* Sort / Group / View */}
        <div className="flex items-center h-full bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 space-x-0.5 shadow-sm">
          <div className="flex items-center px-2 border-r border-neutral-800 h-full gap-1">
            <ArrowUpDown className="w-3 h-3 text-neutral-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-transparent text-xs text-neutral-300 focus:outline-none cursor-pointer h-full"
            >
              <option value="original" className="bg-neutral-900">Original</option>
              <option value="name" className="bg-neutral-900">Name</option>
              <option value="color" className="bg-neutral-900">Color</option>
              <option value="mv" className="bg-neutral-900">Mana Value</option>
            </select>
            <div className="group relative flex items-center justify-center">
              <button
                onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
                disabled={sortBy === "original"}
                className={`flex items-center justify-center w-5 h-5 rounded transition-colors ${
                  sortBy === "original"
                    ? "text-neutral-700 cursor-not-allowed"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {sortDir === "asc" ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
              </button>
              <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
                {sortDir === "asc" ? "Sort ascending" : "Sort descending"}
              </span>
            </div>
          </div>

          <div className="group relative h-full flex items-center justify-center">
            <button
              onClick={() => setIsGrouped(!isGrouped)}
              className={`h-full px-2 flex items-center justify-center rounded-md transition-all ${
                isGrouped
                  ? "bg-neutral-800 text-white border border-neutral-700/50"
                  : "text-neutral-500 hover:text-neutral-300 border border-transparent"
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
            </button>
            <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
              Toggle Type Groups
            </span>
          </div>

          <div className="group relative h-full flex items-center justify-center">
            <button
              onClick={() => setViewMode("visual")}
              className={`h-full px-2 flex items-center justify-center rounded-md transition-all ${
                viewMode === "visual"
                  ? "bg-neutral-800 text-white border border-neutral-700/50"
                  : "text-neutral-500 hover:text-neutral-300 border border-transparent"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
              Grid View
            </span>
          </div>

          <div className="group relative h-full flex items-center justify-center">
            <button
              onClick={() => setViewMode("list")}
              className={`h-full px-2 flex items-center justify-center rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-neutral-800 text-white border border-neutral-700/50"
                  : "text-neutral-500 hover:text-neutral-300 border border-transparent"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
              List View
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
