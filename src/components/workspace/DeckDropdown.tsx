"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Trash2, PlusCircle, Layers } from "lucide-react";
import { Deck } from "@/types";

interface Props {
  decks: Deck[];
  activeDeck: Deck;
  setActiveDeckId: (id: string) => void;
  createNewDeck: () => void;
  onDeleteDeck: () => void;
  onEnableSideboard: (deckId: string) => void;
  onSwitchToSideboard: () => void;
  onDeleteSideboard: () => void;
}

export default function DeckDropdown({
  decks,
  activeDeck,
  setActiveDeckId,
  createNewDeck,
  onDeleteDeck,
  onEnableSideboard,
  onSwitchToSideboard,
  onDeleteSideboard,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteDeck = () => {
    const hasSideboard = activeDeck.sideboard !== undefined;
    const msg = hasSideboard
      ? `Are you sure you want to delete "${activeDeck.name}"? This will also delete its sideboard.`
      : `Are you sure you want to delete "${activeDeck.name}"?`;
    if (window.confirm(msg)) {
      onDeleteDeck();
      setIsOpen(false);
    }
  };

  const handleDeleteSideboard = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the sideboard for "${activeDeck.name}"? This cannot be undone.`,
      )
    ) {
      onDeleteSideboard();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex items-center gap-2 min-w-0" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-neutral-500 hover:text-white transition-colors shrink-0"
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl py-1 z-50">
          {decks.map((d) => {
            const isActive = d.id === activeDeck.id;
            const hasSideboard = d.sideboard !== undefined;
            return (
              <div key={d.id} className="flex items-center">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 pointer-events-none ml-3 ${isActive ? "bg-blue-400" : "bg-transparent"}`}
                />
                <button
                  onClick={() => {
                    setActiveDeckId(d.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2 flex-1 text-left pl-2 pr-1 py-2 text-xs transition-colors min-w-0 ${
                    isActive
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                  }`}
                >
                  <span className="truncate">{d.name}</span>
                </button>

                <div className="group relative flex items-center justify-center pr-3 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasSideboard) {
                        if (!isActive) setActiveDeckId(d.id);
                        onSwitchToSideboard();
                        setIsOpen(false);
                      } else {
                        if (!isActive) setActiveDeckId(d.id);
                        onEnableSideboard(d.id);
                        onSwitchToSideboard();
                        setIsOpen(false);
                      }
                    }}
                    className={`p-1 transition-colors ${
                      hasSideboard
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-neutral-600 hover:text-neutral-300"
                    }`}
                  >
                    {hasSideboard ? (
                      <Layers className="w-3 h-3" />
                    ) : (
                      <PlusCircle className="w-3 h-3" />
                    )}
                  </button>
                  <span className="absolute right-0 top-full mt-1 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-[60]">
                    {hasSideboard ? "View sideboard" : "Add sideboard"}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="border-t border-neutral-800 mt-1 pt-1">
            <button
              onClick={() => {
                createNewDeck();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-colors"
            >
              <Plus className="w-3 h-3" /> New Deck
            </button>
            <button
              onClick={handleDeleteDeck}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete Deck
            </button>
            {activeDeck.sideboard !== undefined && (
              <button
                onClick={handleDeleteSideboard}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Delete Sideboard
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
