"use client";

import { useRef } from "react";
import {
  LayoutGrid,
  List,
  Layout,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Dices,
  Download,
  Upload,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";
import DeckDropdown from "./DeckDropdown";
import { Deck } from "@/types";
import { SortBy, SortDir } from "@/hooks/useDeckManager";

interface Props {
  // Deck
  activeDeck: Deck;
  decks: Deck[];
  setActiveDeckId: (id: string) => void;
  createNewDeck: () => void;
  onDeleteDeck: () => void;
  onUpdateDeckName: (name: string) => void;
  onEnableSideboard: (deckId: string) => void;
  onSwitchToSideboard: () => void;
  onDeleteSideboard: () => void;
  // Stats
  totalCards: number;
  totalValue: number;
  remainingCost: number;
  hasPriceData: boolean;
  // Buy
  buyOnTCGPlayer: () => void;
  buyOnCardKingdom: () => void;
  // Import / Export
  exportDeck: () => void;
  handleImportFile: (
    e: React.ChangeEvent<HTMLInputElement>,
    ref: React.RefObject<HTMLInputElement | null>,
  ) => void;
  isImporting: boolean;
  // View controls
  viewMode: "visual" | "list";
  setViewMode: (v: "visual" | "list") => void;
  sortBy: SortBy;
  setSortBy: (by: SortBy) => void;
  sortDir: SortDir;
  setSortDir: (dir: SortDir) => void;
  isGrouped: boolean;
  setIsGrouped: (g: boolean) => void;
  // Deck view mode (main / sideboard)
  deckViewMode: "main" | "sideboard";
  setDeckViewMode: (v: "main" | "sideboard") => void;
  activeDeckHasSideboard: boolean;
  sideboardCardCount: number;
  // Modals
  onOpenSampleHand: () => void;
}

export default function WorkspaceToolbar({
  activeDeck,
  decks,
  setActiveDeckId,
  createNewDeck,
  onDeleteDeck,
  onUpdateDeckName,
  onEnableSideboard,
  onSwitchToSideboard,
  onDeleteSideboard,
  totalCards,
  totalValue,
  remainingCost,
  hasPriceData,
  buyOnTCGPlayer,
  buyOnCardKingdom,
  exportDeck,
  handleImportFile,
  isImporting,
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
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col mb-4 pb-3 border-b border-neutral-800 gap-3">
      {/* Row 1: Deck Name */}
      <div className="flex items-center gap-2">
        <DeckDropdown
          decks={decks}
          activeDeck={activeDeck}
          setActiveDeckId={setActiveDeckId}
          createNewDeck={createNewDeck}
          onDeleteDeck={onDeleteDeck}
          onEnableSideboard={onEnableSideboard}
          onSwitchToSideboard={onSwitchToSideboard}
          onDeleteSideboard={onDeleteSideboard}
        />
        <input
          value={activeDeck.name}
          onChange={(e) => onUpdateDeckName(e.target.value)}
          size={Math.max(10, activeDeck.name.length)}
          className="text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-blue-500 focus:outline-none transition-all px-0 outline-none placeholder:text-neutral-500"
          placeholder="Untitled"
        />
      </div>

      {/* Row 2: Stats */}
      <div className="flex items-center gap-4 text-xs text-neutral-400">
        {deckViewMode === "sideboard" ? (
          <p className={sideboardCardCount > 15 ? "text-red-400 font-bold" : sideboardCardCount === 15 ? "text-green-400 font-bold" : ""}>
            {sideboardCardCount} / 15
          </p>
        ) : (
          <p className={totalCards > 60 ? "text-red-400 font-bold" : totalCards === 60 ? "text-green-400 font-bold" : ""}>
            {totalCards} Cards
          </p>
        )}
        <p>
          Value:{" "}
          <span className="text-neutral-200 font-medium">
            {hasPriceData ? `$${totalValue.toFixed(2)}` : "N/A"}
          </span>
        </p>
        <p>
          To Buy:{" "}
          <span className="text-green-500 font-medium">
            {hasPriceData ? `$${remainingCost.toFixed(2)}` : "N/A"}
          </span>
        </p>
      </div>

      {/* Row 3: Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="group relative flex items-center justify-center">
              <button
                onClick={exportDeck}
                className="p-1 text-neutral-400 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
                Export List
              </span>
            </div>

            <div className="group relative flex items-center justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="p-1 text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
              >
                {isImporting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
              </button>
              <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
                Import List
              </span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleImportFile(e, fileInputRef)}
              className="hidden"
              accept=".txt"
            />
          </div>

          <div className="group relative flex items-center justify-center">
            <button
              onClick={buyOnTCGPlayer}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-600/10 border border-orange-600/30 rounded-lg text-xs font-bold text-orange-400 hover:bg-orange-600/20 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> TCGPlayer
            </button>
            <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
              Shop TCGPlayer
            </span>
          </div>

          <div className="group relative flex items-center justify-center">
            <button
              onClick={buyOnCardKingdom}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-600/30 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-600/20 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Card Kingdom
            </button>
            <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
              Shop Card Kingdom
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 h-8">
          <div className="group relative h-full flex items-center justify-center">
            <button
              onClick={onOpenSampleHand}
              className="flex items-center gap-2 h-full px-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <Dices className="w-4 h-4" />{" "}
              <span className="whitespace-nowrap">Test Deck</span>
            </button>
            <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
              Simulate opening hand
            </span>
          </div>

          {/* Main / Side pill toggle */}
          <div className="flex items-center h-full bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 shadow-sm">
            <div className="group relative h-full flex items-center justify-center">
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
              <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
                Switch to main deck
              </span>
            </div>
            <div className="group relative h-full flex items-center justify-center">
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
              <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
                Switch to sideboard
              </span>
            </div>
          </div>

          <div className="flex items-center h-full bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 space-x-0.5 shadow-sm">
            {/* Sort By + Direction */}
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
              {/* Fix 3: Sort direction tooltip */}
              <div className="group relative flex items-center justify-center">
                <button
                  onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
                  disabled={sortBy === "original"}
                  className={`flex items-center justify-center w-5 h-5 rounded transition-colors ${sortBy === "original" ? "text-neutral-700 cursor-not-allowed" : "text-neutral-400 hover:text-white"}`}
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
                className={`h-full px-2 flex items-center justify-center rounded-md transition-all ${isGrouped ? "bg-neutral-800 text-white border border-neutral-700/50" : "text-neutral-500 hover:text-neutral-300 border border-transparent"}`}
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
                className={`h-full px-2 flex items-center justify-center rounded-md transition-all ${viewMode === "visual" ? "bg-neutral-800 text-white border border-neutral-700/50" : "text-neutral-500 hover:text-neutral-300 border border-transparent"}`}
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
                className={`h-full px-2 flex items-center justify-center rounded-md transition-all ${viewMode === "list" ? "bg-neutral-800 text-white border border-neutral-700/50" : "text-neutral-500 hover:text-neutral-300 border border-transparent"}`}
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
