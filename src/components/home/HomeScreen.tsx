"use client";

import { useState, useRef } from "react";
import { useHomeTagline } from "@/hooks/useHomeTagline";
import { FormatPicker } from "@/components/layout/FormatPicker";
import { DeckFormat } from "@/lib/formatRules";
import DeckCoverCard from "./DeckCoverCard";
import GhostDeckCard from "./GhostDeckCard";

interface Deck {
  id: string;
  name: string;
  cards: { quantity: number }[];
  format?: string;
}

interface HomeScreenProps {
  decks: Deck[];
  onDeckSelect: (id: string) => void;
  onCreateDeck: (format: DeckFormat) => void;
}

export default function HomeScreen({ decks, onDeckSelect, onCreateDeck }: HomeScreenProps) {
  const tagline = useHomeTagline();
  const [pickerOpen, setPickerOpen] = useState(false);
  const ghostRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="flex-1 overflow-y-auto flex flex-col items-center"
      style={{ paddingTop: "10%" }}
    >
      {/* Heading + tagline */}
      <div className="flex flex-col items-center gap-1.5 mb-6">
        <h2 className="text-base font-medium text-content-heading">
          What are you brewing?
        </h2>
        <p className="text-xs text-content-faint">{tagline}</p>
      </div>

      {/* Deck grid */}
      <div className="flex flex-wrap gap-3 justify-center max-w-[520px] px-4 pb-8">
        {decks.map((deck) => (
          <DeckCoverCard
            key={deck.id}
            deck={deck}
            onClick={() => onDeckSelect(deck.id)}
          />
        ))}

        {/* Ghost deck slot — always last */}
        <div ref={ghostRef} className="relative">
          <GhostDeckCard onClick={() => setPickerOpen(true)} />
          {pickerOpen && (
            <div className="absolute left-full ml-2 top-0 w-52 bg-surface-base border border-line-default rounded-lg shadow-xl z-50">
              <FormatPicker
                onSelect={(format) => {
                  setPickerOpen(false);
                  onCreateDeck(format);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
