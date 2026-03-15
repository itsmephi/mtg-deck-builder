"use client";

import { useRef, useState, useEffect } from "react";
import { Layers, X, Plus, RefreshCw, Download, Upload, ShoppingCart } from "lucide-react";
import { useDeckManager } from "@/hooks/useDeckManager";
import { useDeckStats } from "@/hooks/useDeckStats";

interface Props {
  onImport: () => void;
  onExport: () => void;
  isImporting: boolean;
}

export default function SidebarDecksTab({ onImport, onExport, isImporting }: Props) {
  const {
    decks,
    activeDeck,
    setActiveDeckId,
    createNewDeck,
    deleteDeck,
    enableSideboard,
    deleteSideboard,
    setDeckViewMode,
  } = useDeckManager();

  const { buyOnTCGPlayer, buyOnCardKingdom } = useDeckStats(activeDeck ?? null);

  const [openDeleteDropdownId, setOpenDeleteDropdownId] = useState<string | null>(null);
  const deleteDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openDeleteDropdownId) return;
    function handleClickOutside(e: MouseEvent) {
      if (deleteDropdownRef.current && !deleteDropdownRef.current.contains(e.target as Node)) {
        setOpenDeleteDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDeleteDropdownId]);

  return (
    <div className="flex flex-col h-full">
      {/* Deck list */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {decks.map((deck) => {
          const isActive = deck.id === activeDeck?.id;
          const hasSideboard = deck.sideboard !== undefined;
          const cardCount = deck.cards.reduce((s, c) => s + c.quantity, 0);

          return (
            <div
              key={deck.id}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg group relative ${
                isActive ? "bg-neutral-800" : "hover:bg-neutral-800/50"
              } transition-colors`}
            >
              {/* Active dot */}
              <span
                className={`shrink-0 rounded-full ${
                  isActive ? "w-1.5 h-1.5 bg-blue-400" : "w-1.5 h-1.5 bg-transparent"
                }`}
              />

              {/* Deck name — switches to this deck; always navigates to main view */}
              <button
                onClick={() => {
                  if (isActive) {
                    setDeckViewMode("main");
                  } else {
                    setActiveDeckId(deck.id);
                    setDeckViewMode("main");
                  }
                }}
                className={`flex-1 text-left text-xs truncate transition-colors min-w-0 ${
                  isActive ? "text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                <span className={!deck.name ? "text-neutral-500" : ""}>
                  {deck.name || "Untitled"}
                </span>
              </button>

              {/* Card count */}
              <span className="text-[10px] text-neutral-600 shrink-0">{cardCount}</span>

              {/* Layers icon — muted if no sideboard, blue if exists */}
              <button
                onClick={() => {
                  if (!isActive) setActiveDeckId(deck.id);
                  if (!hasSideboard) enableSideboard(deck.id);
                  setDeckViewMode("sideboard");
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  hasSideboard
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-neutral-600 hover:text-neutral-400"
                }`}
              >
                <Layers className="w-3 h-3" />
              </button>

              {/* × button — hover-only, opens delete dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() =>
                    setOpenDeleteDropdownId(
                      openDeleteDropdownId === deck.id ? null : deck.id
                    )
                  }
                  className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-700 hover:text-neutral-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>

                {openDeleteDropdownId === deck.id && (
                  <div
                    ref={deleteDropdownRef}
                    className="absolute right-0 top-full mt-1 w-40 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl py-1 z-50"
                  >
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${deck.name || "Untitled"}"?`)) {
                          deleteDeck(deck.id);
                          setOpenDeleteDropdownId(null);
                        }
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      Delete Deck
                    </button>
                    {hasSideboard && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete sideboard for "${deck.name || "Untitled"}"?`
                            )
                          ) {
                            deleteSideboard(deck.id);
                            setOpenDeleteDropdownId(null);
                          }
                        }}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        Delete Sideboard
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* + New Deck */}
        <button
          onClick={createNewDeck}
          className="flex items-center gap-2 w-full px-2 py-1.5 mt-1 text-xs text-neutral-500 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Deck
        </button>
      </div>

      {/* Actions strip */}
      <div className="border-t border-neutral-800 p-2 space-y-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs text-neutral-300 hover:text-white transition-colors"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
          <button
            onClick={onImport}
            disabled={isImporting}
            className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs text-neutral-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {isImporting ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Upload className="w-3 h-3" />
            )}
            Import
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={buyOnTCGPlayer}
            className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 bg-orange-600/10 border border-orange-600/30 rounded-lg text-xs font-bold text-orange-400 hover:bg-orange-600/20 transition-colors"
          >
            <ShoppingCart className="w-3 h-3" />
            TCGPlayer
          </button>
          <button
            onClick={buyOnCardKingdom}
            className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 bg-blue-600/10 border border-blue-600/30 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-600/20 transition-colors"
          >
            <ShoppingCart className="w-3 h-3" />
            Card Kingdom
          </button>
        </div>
      </div>
    </div>
  );
}
