"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Deck } from "@/types";

interface Props {
  decks: Deck[];
  activeDeck: Deck;
  setActiveDeckId: (id: string) => void;
  createNewDeck: () => void;
  onDelete: () => void;
}

export default function DeckDropdown({
  decks,
  activeDeck,
  setActiveDeckId,
  createNewDeck,
  onDelete,
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
        <div className="absolute top-full left-0 mt-2 w-56 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl overflow-hidden py-1 z-50">
          {decks.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setActiveDeckId(d.id);
                setIsOpen(false);
              }}
              className={`flex items-center justify-between w-full text-left px-3 py-2 text-xs transition-colors ${d.id === activeDeck.id ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"}`}
            >
              <span className="truncate">{d.name}</span>
              {d.id === activeDeck.id && (
                <span className="text-blue-400 text-[10px] font-bold ml-2">
                  ACTIVE
                </span>
              )}
            </button>
          ))}
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
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete Current Deck
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
