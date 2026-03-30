"use client";

import React, { useRef, useState } from "react";
import { ScryfallCard } from "@/types";

function getRowTint(card: ScryfallCard): string {
  const isLand = card.type_line?.includes("Land");
  if (isLand) return "rgba(180, 140, 90, 0.15)";
  const colors: string[] = (card as any).colors ?? [];
  if (colors.length > 1) return "rgba(199, 162, 75, 0.10)";
  if (colors.length === 0) return "rgba(150, 150, 150, 0.12)";
  switch (colors[0]) {
    case "W": return "rgba(248, 231, 187, 0.08)";
    case "U": return "rgba(14, 104, 171, 0.10)";
    case "B": return "rgba(148, 110, 174, 0.10)";
    case "R": return "rgba(211, 73, 53, 0.10)";
    case "G": return "rgba(0, 115, 62, 0.10)";
    default:  return "rgba(150, 150, 150, 0.12)";
  }
}

function getRowHoverTint(card: ScryfallCard): string {
  const isLand = card.type_line?.includes("Land");
  if (isLand) return "rgba(180, 140, 90, 0.28)";
  const colors: string[] = (card as any).colors ?? [];
  if (colors.length > 1) return "rgba(199, 162, 75, 0.20)";
  if (colors.length === 0) return "rgba(150, 150, 150, 0.22)";
  switch (colors[0]) {
    case "W": return "rgba(248, 231, 187, 0.16)";
    case "U": return "rgba(14, 104, 171, 0.20)";
    case "B": return "rgba(148, 110, 174, 0.20)";
    case "R": return "rgba(211, 73, 53, 0.20)";
    case "G": return "rgba(0, 115, 62, 0.20)";
    default:  return "rgba(150, 150, 150, 0.22)";
  }
}

function renderManaSymbols(manaCost: string | undefined) {
  if (!manaCost) return null;
  const symbols = manaCost.match(/\{[^}]+\}/g) || [];
  return (
    <div className="flex items-center gap-0.5 min-h-[16px]">
      {symbols.map((s, i) => (
        <img
          key={i}
          src={`https://svgs.scryfall.io/card-symbols/${s.replace(/\{|\}/g, "").replace(/\//g, "")}.svg`}
          className="w-3.5 h-3.5"
          alt={s}
        />
      ))}
    </div>
  );
}

interface SearchListTableProps {
  cards: ScryfallCard[];
  deckCardNames: Set<string>;
  onAdd: (card: ScryfallCard) => void;
  onSelect: (card: ScryfallCard) => void;
  showThumbnail: boolean;
}

export default function SearchListTable({ cards, deckCardNames, onAdd, onSelect, showThumbnail }: SearchListTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<ScryfallCard | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = e.clientX + 20;
    const y = Math.min(e.clientY + 20, window.innerHeight - 370);
    mousePosRef.current = { x, y };
    if (tooltipRef.current) {
      tooltipRef.current.style.left = `${x}px`;
      tooltipRef.current.style.top = `${y}px`;
    }
  };

  return (
    <div onMouseMove={handleMouseMove}>
      <div className="bg-surface-base border border-line-subtle rounded-lg shadow-sm" style={{ margin: "10px" }}>
        <table className="w-full table-fixed text-left text-xs">
          <thead className="bg-surface-base text-[10px] text-content-muted border-b border-line-subtle uppercase tracking-wider">
            <tr>
              <th className="px-2 py-1.5 w-10"></th>
              <th className="px-2 py-1.5 w-8">Own</th>
              <th className="px-2 py-1.5 min-w-0">Name</th>
              <th className="px-2 py-1.5 w-48">Type</th>
              <th className="px-2 py-1.5 w-24">Mana</th>
              <th className="px-2 py-1.5 text-right w-20">Price</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => {
              const inDeck = deckCardNames.has(card.name);
              const isHovered = hoveredRowId === card.id;
              const rowBg = isHovered ? getRowHoverTint(card) : getRowTint(card);

              return (
                <tr
                  key={card.id}
                  onClick={() => onSelect(card)}
                  onMouseEnter={() => { setHoveredRowId(card.id); setHoveredCard(card); }}
                  onMouseLeave={() => { setHoveredRowId(null); setHoveredCard(null); }}
                  className="border-b border-neutral-800/40 transition-colors group cursor-pointer"
                  style={{ backgroundColor: rowBg }}
                >
                  {/* + Add button */}
                  <td className="px-2 py-1 w-10">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); onAdd(card); }}
                        title="Add to deck"
                        className="w-[22px] h-[22px] rounded-full border border-white/10 flex items-center justify-center text-content-tertiary text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-500/15 hover:border-blue-500/30 hover:text-blue-400"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* In-deck indicator */}
                  <td className="px-1 py-1 w-5">
                    <div className="flex items-center justify-center">
                      {inDeck && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"
                          style={{ boxShadow: "0 0 4px rgba(74, 222, 128, 0.4)" }}
                        />
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-2 py-1 min-w-0">
                    <span className={`truncate font-medium block ${inDeck ? "text-content-tertiary" : "text-content-primary"}`}>
                      {card.name}
                    </span>
                  </td>

                  {/* Type */}
                  <td className={`px-2 py-1 text-[10px] truncate w-48 ${inDeck ? "text-content-faint" : "text-content-tertiary"}`}>
                    {card.type_line || "—"}
                  </td>

                  {/* Mana */}
                  <td className={`px-2 py-1 w-24 ${inDeck ? "opacity-40" : ""}`}>
                    {card.card_faces ? (
                      <div className="flex items-center gap-1">
                        {renderManaSymbols(card.card_faces[0].mana_cost)}
                        <span className="text-[10px] text-content-faint font-bold">//</span>
                        {renderManaSymbols(card.card_faces[1].mana_cost)}
                      </div>
                    ) : (
                      renderManaSymbols((card as any).mana_cost)
                    )}
                  </td>

                  {/* Price */}
                  <td className={`px-2 py-1 text-right text-[10px] tabular-nums w-20 ${inDeck ? "text-content-faint" : "text-content-tertiary"}`}>
                    {card.prices.usd ? `$${card.prices.usd}` : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hoveredCard && showThumbnail && (
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-none w-56 rounded-xl overflow-hidden shadow-2xl border border-line-default"
          style={{ left: `${mousePosRef.current.x}px`, top: `${mousePosRef.current.y}px` }}
        >
          <img
            src={hoveredCard.image_uris?.normal || hoveredCard.card_faces?.[0]?.image_uris?.normal}
            className="w-full h-auto"
            alt={hoveredCard.name}
          />
        </div>
      )}
    </div>
  );
}
