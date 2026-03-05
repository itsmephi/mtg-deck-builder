import React from "react";
import { Plus, Minus, Check, X } from "lucide-react";
import { DeckCard, ScryfallCard } from "@/types";

interface ListCardTableProps {
  cards: DeckCard[];
  showHeader?: boolean;
  onUpdateQuantity: (id: string, delta: number) => void;
  onToggleOwned: (id: string) => void;
  onRemove: (id: string) => void;
  onSelect: (card: ScryfallCard) => void;
  onHoverStart: (card: ScryfallCard) => void;
  onHoverEnd: () => void;
  onMouseMove: (e: React.MouseEvent) => void;
  highlightedId?: string | null;
  cardRefs?: React.MutableRefObject<Map<string, HTMLElement>>;
}

export default function ListCardTable({
  cards,
  showHeader = true,
  onUpdateQuantity,
  onToggleOwned,
  onRemove,
  onSelect,
  onHoverStart,
  onHoverEnd,
  onMouseMove,
  highlightedId,
  cardRefs,
}: ListCardTableProps) {
  const renderManaSymbols = (manaCost: string | undefined) => {
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
  };

  return (
    <div
      className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shadow-sm"
      onMouseMove={onMouseMove}
    >
      <table className="w-full table-fixed text-left text-xs">
        {showHeader && (
          <thead className="bg-neutral-950 text-[10px] text-neutral-500 border-b border-neutral-800 uppercase tracking-wider">
            <tr>
              <th className="pl-3 py-1.5 w-8 text-center"></th>
              <th className="px-2 py-1.5 w-16">Qty</th>
              <th className="px-2 py-1.5 min-w-0">Name</th>
              <th className="px-2 py-1.5 w-48">Type</th>
              <th className="px-2 py-1.5 w-24">Mana</th>
              <th className="px-2 py-1.5 text-right w-20">Price</th>
              <th className="pr-3 py-1.5 w-8 text-center"></th>
            </tr>
          </thead>
        )}
        <tbody>
          {cards.map((card) => (
            <tr
              key={card.id}
              ref={(el) => {
                if (el && cardRefs) {
                  if (el) cardRefs.current.set(card.id, el);
                  else cardRefs.current.delete(card.id);
                }
              }}
              onMouseEnter={() => onHoverStart(card)}
              onMouseLeave={onHoverEnd}
              className={`border-b border-neutral-800/40 hover:bg-neutral-800/40 transition-colors ${card.quantity === 0 ? "opacity-30 grayscale" : ""} ${highlightedId === card.id ? "bg-yellow-400/10 outline outline-1 outline-yellow-400/50" : ""}`}
            >
              <td className="pl-3 py-1 text-center">
                <Check
                  onClick={() => onToggleOwned(card.id)}
                  className={`w-3.5 h-3.5 inline cursor-pointer ${card.isOwned ? "text-green-500" : "text-neutral-700"}`}
                />
              </td>
              <td className="px-2 py-1">
                <div className="flex items-center gap-2">
                  <Minus
                    onClick={() => onUpdateQuantity(card.id, -1)}
                    className="w-3 h-3 cursor-pointer text-neutral-500"
                  />
                  <span className="w-3 text-center font-medium text-neutral-300">
                    {card.quantity}
                  </span>
                  <Plus
                    onClick={() => onUpdateQuantity(card.id, 1)}
                    className="w-3 h-3 cursor-pointer text-neutral-500"
                  />
                  {card.quantity >= 5 &&
                    !card.type_line?.toLowerCase().includes("basic land") &&
                    !card.oracle_text?.includes("A deck can have any number") && (
                      <div className="group relative flex items-center">
                        <span className="text-[11px] leading-none cursor-default">⚠️</span>
                        <span className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          Exceeds the 4-copy limit for standard play
                        </span>
                      </div>
                    )}
                </div>
              </td>
              <td
                onClick={() => onSelect(card)}
                className="px-2 py-1 cursor-pointer hover:underline truncate min-w-0"
              >
                <span
                  className={`font-medium ${card.isOwned ? "text-green-500/70" : "text-white"}`}
                >
                  {card.name}
                </span>
              </td>
              <td className="px-2 py-1 text-[10px] text-neutral-500 truncate">
                {card.type_line || "—"}
              </td>
              <td className="px-2 py-1">
                {card.card_faces ? (
                  <div className="flex items-center gap-1">
                    {renderManaSymbols(card.card_faces[0].mana_cost)}
                    <span className="text-[10px] text-neutral-600 font-bold">
                      //
                    </span>
                    {renderManaSymbols(card.card_faces[1].mana_cost)}
                  </div>
                ) : (
                  renderManaSymbols((card as any).mana_cost)
                )}
              </td>
              <td
                className={`px-2 py-1 text-right text-[10px] tabular-nums ${card.isOwned ? "text-green-500/50" : "text-neutral-400"}`}
              >
                {card.prices.usd ? `$${card.prices.usd}` : "N/A"}
              </td>
              <td className="pr-3 py-1 text-center">
                <X
                  onClick={() => onRemove(card.id)}
                  className="w-3 h-3 inline cursor-pointer text-neutral-700 hover:text-red-500"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
