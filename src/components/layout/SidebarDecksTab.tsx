"use client";

import { useRef, useState, useEffect } from "react";
import { Layers, X, Plus, RefreshCw, Download, Upload, ShoppingCart } from "lucide-react";
import { useDeckManager } from "@/hooks/useDeckManager";
import { useDeckStats } from "@/hooks/useDeckStats";
import { FormatPicker } from "@/components/layout/FormatPicker";
import { DeckFormat } from "@/lib/formatRules";

interface Props {
  onImport: () => void;
  onExport: () => void;
  isImporting: boolean;
}

interface ConfirmDialogState {
  deckId: string;
  sideboardCount: number;
  targetFormat: DeckFormat;
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
    setDeckFormat,
    mergeSideboardIntoDeck,
    deleteSideboardForFormat,
  } = useDeckManager();

  const { buyOnTCGPlayer, buyOnCardKingdom } = useDeckStats(activeDeck ?? null);

  const [openDeleteDropdownId, setOpenDeleteDropdownId] = useState<string | null>(null);
  const deleteDropdownRef = useRef<HTMLDivElement>(null);

  // Format picker open for which deck (badge-anchored)
  const [formatPickerDeckId, setFormatPickerDeckId] = useState<string | null>(null);
  const [formatPickerDir, setFormatPickerDir] = useState<"up" | "down">("down");
  const formatPickerRef = useRef<HTMLDivElement>(null);

  // Format picker for + New Deck
  const [newDeckPickerOpen, setNewDeckPickerOpen] = useState(false);
  const [newDeckPickerDir, setNewDeckPickerDir] = useState<"up" | "down">("up");
  const newDeckPickerRef = useRef<HTMLDivElement>(null);

  // Confirmation dialog for sideboard → commander
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Close delete dropdown on outside click
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

  // Close format picker on outside click
  useEffect(() => {
    if (!formatPickerDeckId) return;
    function handleClickOutside(e: MouseEvent) {
      if (formatPickerRef.current && !formatPickerRef.current.contains(e.target as Node)) {
        setFormatPickerDeckId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [formatPickerDeckId]);

  // Close new-deck picker on outside click
  useEffect(() => {
    if (!newDeckPickerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (newDeckPickerRef.current && !newDeckPickerRef.current.contains(e.target as Node)) {
        setNewDeckPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [newDeckPickerOpen]);

  // Escape key closes confirmation dialog
  useEffect(() => {
    if (!confirmDialog) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmDialog(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirmDialog]);

  const handleChangeFormat = (deckId: string, format: DeckFormat) => {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;

    if (format === "commander") {
      const sideboardCount = deck.sideboard?.reduce((s, c) => s + c.quantity, 0) ?? 0;
      if (sideboardCount > 0) {
        setConfirmDialog({ deckId, sideboardCount, targetFormat: format });
        setFormatPickerDeckId(null);
        return;
      } else if (deck.sideboard !== undefined) {
        deleteSideboardForFormat(deckId);
      }
    }

    setDeckFormat(deckId, format);
    setFormatPickerDeckId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Deck list */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {decks.map((deck) => {
          const isActive = deck.id === activeDeck?.id;
          const hasSideboard = deck.sideboard !== undefined;
          const cardCount = deck.cards.reduce((s, c) => s + c.quantity, 0);
          const isCommander = deck.format === "commander";

          return (
            <div
              key={deck.id}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg group relative ${
                isActive ? "bg-surface-raised" : "hover:bg-neutral-800/50"
              } transition-colors`}
            >
              {/* Active dot */}
              <span
                className={`shrink-0 rounded-full ${
                  isActive ? "w-1.5 h-1.5 bg-blue-400" : "w-1.5 h-1.5 bg-transparent"
                }`}
              />

              {/* Deck name */}
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
                  isActive ? "text-primary" : "text-tertiary hover:text-primary"
                }`}
              >
                <span className={!deck.name ? "text-muted" : ""}>
                  {deck.name || "Untitled"}
                </span>
              </button>

              {/* Card count */}
              <span className="text-[10px] text-faint shrink-0">{cardCount}</span>

              {/* Format badge — clickable, opens format picker */}
              <div className="shrink-0">
                <button
                  onClick={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const dir = (window.innerHeight - rect.bottom) > rect.top ? "down" : "up";
                    setFormatPickerDir(dir);
                    setFormatPickerDeckId(formatPickerDeckId === deck.id ? null : deck.id);
                  }}
                  className="flex items-center"
                >
                  {deck.format === "standard" && (
                    <span className="text-[9px] font-bold text-blue-400 bg-blue-400/10 px-1 rounded hover:bg-blue-400/20 transition-colors cursor-pointer">
                      STD
                    </span>
                  )}
                  {deck.format === "commander" && (
                    <span className="text-[9px] font-bold text-yellow-400 bg-yellow-400/10 px-1 rounded hover:bg-yellow-400/20 transition-colors cursor-pointer">
                      CMD
                    </span>
                  )}
                  {(!deck.format || deck.format === "freeform") && (
                    <span className="text-[9px] font-bold text-neutral-500 bg-neutral-500/10 px-1 rounded hover:bg-neutral-500/20 transition-colors cursor-pointer">
                      FF
                    </span>
                  )}
                </button>
                {formatPickerDeckId === deck.id && (
                  <div
                    ref={formatPickerRef}
                    className={`absolute left-2 right-2 bg-surface-base border border-line-default rounded-lg shadow-xl z-50 ${formatPickerDir === "down" ? "top-full mt-1" : "bottom-full mb-1"}`}
                  >
                    <FormatPicker
                      currentFormat={deck.format}
                      onSelect={(format) => handleChangeFormat(deck.id, format)}
                    />
                  </div>
                )}
              </div>

              {/* Layers icon — always rendered, disabled/grayed for Commander */}
              <button
                onClick={() => {
                  if (isCommander) return;
                  if (!isActive) setActiveDeckId(deck.id);
                  if (!hasSideboard) enableSideboard(deck.id);
                  setDeckViewMode("sideboard");
                }}
                disabled={isCommander}
                title={
                  isCommander
                    ? "Commander decks don't use sideboards"
                    : hasSideboard
                    ? "View sideboard"
                    : "Add sideboard"
                }
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isCommander
                    ? "text-faint cursor-not-allowed opacity-40"
                    : hasSideboard
                    ? "text-blue-400 hover:bg-blue-500/10"
                    : "text-neutral-700 hover:text-tertiary"
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
                  className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-700 hover:text-tertiary opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>

                {openDeleteDropdownId === deck.id && (
                  <div
                    ref={deleteDropdownRef}
                    className="absolute right-0 top-full mt-1 w-40 bg-surface-base border border-line-default rounded-lg shadow-xl py-1 z-50"
                  >
                    <button
                      onClick={() => {
                        deleteDeck(deck.id);
                        setOpenDeleteDropdownId(null);
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      Delete Deck
                    </button>
                    {hasSideboard && (
                      <button
                        onClick={() => {
                          deleteSideboard(deck.id);
                          setOpenDeleteDropdownId(null);
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

        {/* + New Deck — opens FormatPicker */}
        <div className="relative">
          <button
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const dir = (window.innerHeight - rect.bottom) > rect.top ? "down" : "up";
              setNewDeckPickerDir(dir);
              setNewDeckPickerOpen(!newDeckPickerOpen);
            }}
            className="flex items-center gap-2 w-full px-2 py-1.5 mt-1 text-xs text-muted hover:text-primary hover:bg-neutral-800/50 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Deck
          </button>
          {newDeckPickerOpen && (
            <div
              ref={newDeckPickerRef}
              className={`absolute left-0 w-52 bg-surface-base border border-line-default rounded-lg shadow-xl z-50 ${newDeckPickerDir === "down" ? "top-full mt-1" : "bottom-full mb-1"}`}
            >
              <FormatPicker
                onSelect={(format) => {
                  createNewDeck(format);
                  setNewDeckPickerOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Actions strip */}
      <div className="border-t border-line-subtle p-2 space-y-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 bg-surface-raised hover:bg-surface-overlay rounded-lg text-xs text-secondary hover:text-primary transition-colors"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
          <button
            onClick={onImport}
            disabled={isImporting}
            className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 bg-surface-raised hover:bg-surface-overlay rounded-lg text-xs text-secondary hover:text-primary transition-colors disabled:opacity-50"
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
            className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 bg-orange-600/10 border border-orange-600/30 rounded-lg text-[10px] font-bold text-orange-400 hover:bg-orange-600/20 transition-colors"
          >
            <ShoppingCart className="w-3 h-3" />
            TCGPlayer
          </button>
          <button
            onClick={buyOnCardKingdom}
            className="flex items-center gap-1.5 flex-1 justify-center px-2 py-1.5 bg-blue-600/10 border border-blue-600/30 rounded-lg text-[10px] font-bold text-blue-400 hover:bg-blue-600/20 transition-colors"
          >
            <ShoppingCart className="w-3 h-3" />
            Card Kingdom
          </button>
        </div>
      </div>

      {/* Sideboard → Commander confirmation dialog */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setConfirmDialog(null)}
        >
          <div
            className="bg-surface-base border border-line-default rounded-xl shadow-2xl p-6 w-80 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-sm font-bold text-primary mb-1">
                Commander decks don&apos;t use sideboards
              </h3>
              <p className="text-xs text-tertiary">
                Your sideboard has {confirmDialog.sideboardCount}{" "}
                {confirmDialog.sideboardCount === 1 ? "card" : "cards"}. What would you
                like to do?
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  mergeSideboardIntoDeck(confirmDialog.deckId);
                  setDeckFormat(confirmDialog.deckId, "commander");
                  setConfirmDialog(null);
                }}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-yellow-600 hover:bg-yellow-500 text-primary transition-colors"
              >
                Merge into Main Deck
              </button>
              <button
                onClick={() => {
                  deleteSideboardForFormat(confirmDialog.deckId);
                  setDeckFormat(confirmDialog.deckId, "commander");
                  setConfirmDialog(null);
                }}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition-colors"
              >
                Delete Sideboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
