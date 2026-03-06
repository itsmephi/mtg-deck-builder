import React, { useRef, useState } from "react";
import { Plus, Minus, Check, X } from "lucide-react";
import { DeckCard, ScryfallCard } from "@/types";

interface ListCardTableProps {
  cards: DeckCard[];
  showHeader?: boolean;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetQuantity: (id: string, qty: number) => void;
  onUpdateOwnedQty: (id: string, qty: number) => void;
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
  onSetQuantity,
  onUpdateOwnedQty,
  onRemove,
  onSelect,
  onHoverStart,
  onHoverEnd,
  onMouseMove,
  highlightedId,
  cardRefs,
}: ListCardTableProps) {
  // Remembers last non-zero ownedQty per card so checkbox can restore it on re-check
  const lastOwnedQtyRef = useRef<Map<string, number>>(new Map());

  // Inline quantity editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const isEscaping = useRef(false);

  const startEdit = (card: DeckCard) => {
    setEditingId(card.id);
    setEditValue(String(card.quantity));
  };

  const commitEdit = (card: DeckCard) => {
    const trimmed = editValue.trim();
    const parsed = parseInt(trimmed, 10);
    if (trimmed === "" || parsed === 0) {
      // 0 or empty: qty → 0, card grays out and stays in deck (matches − button behavior)
      onSetQuantity(card.id, 0);
    } else if (!isNaN(parsed) && parsed > 0) {
      // Allow any positive value — over-4 shows warning badge (soft warning, not a cap)
      onSetQuantity(card.id, parsed);
    }
    // non-numeric or negative: silently revert (do nothing, card keeps current qty)
    setEditingId(null);
  };

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
              <th className="px-2 py-1.5 w-16">Qty</th>
              <th className="py-1.5 w-24">Owned</th>
              <th className="px-2 py-1.5 min-w-0">Name</th>
              <th className="px-2 py-1.5 w-48">Type</th>
              <th className="px-2 py-1.5 w-24">Mana</th>
              <th className="px-2 py-1.5 text-right w-20">Price</th>
              <th className="pr-3 py-1.5 w-8 text-center"></th>
            </tr>
          </thead>
        )}
        <tbody>
          {cards.map((card) => {
            const isFullyOwned = card.quantity > 0 && card.ownedQty >= card.quantity;
            const isChecked = card.ownedQty > 0;
            // Visual-only cap at 100% — underlying ownedQty is never clamped
            const ownershipRatio = card.quantity > 0 ? Math.min(card.ownedQty / card.quantity, 1) : 0;
            // Opacity applied per-cell (not row-level) so Owned column stays full brightness
            const cellOpacity = card.quantity === 0 ? 0.3 : 1 - ownershipRatio * 0.6;
            const cellGrayscale = card.quantity === 0 ? "grayscale" : "";
            const nameColor = card.quantity === 0
              ? "text-neutral-500"
              : isFullyOwned
              ? "text-green-400"
              : "text-neutral-100";

            const overLimit =
              card.quantity >= 5 &&
              !card.type_line?.toLowerCase().includes("basic land") &&
              !card.oracle_text?.includes("A deck can have any number");

            // Keep ref up to date whenever ownedQty is non-zero
            if (card.ownedQty > 0) lastOwnedQtyRef.current.set(card.id, card.ownedQty);

            return (
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
                className={`border-b border-neutral-800/40 hover:bg-neutral-800/40 transition-colors ${highlightedId === card.id ? "bg-yellow-400/10 outline outline-1 outline-yellow-400/50" : ""}`}
              >
                {/* Qty */}
                <td className={`px-2 py-1 ${cellGrayscale}`} style={{ opacity: cellOpacity }}>
                  <div className="flex items-center gap-2">
                    <Minus
                      onClick={() => onUpdateQuantity(card.id, -1)}
                      className="w-3 h-3 cursor-pointer text-neutral-500"
                    />
                    {editingId === card.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        onBlur={() => {
                          if (isEscaping.current) {
                            isEscaping.current = false;
                            return;
                          }
                          commitEdit(card);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitEdit(card);
                          }
                          if (e.key === "Escape") {
                            isEscaping.current = true;
                            setEditingId(null);
                          }
                        }}
                        className="w-6 text-center text-xs font-medium bg-neutral-800 border border-blue-500 rounded text-neutral-200 focus:outline-none"
                        autoFocus
                      />
                    ) : overLimit ? (
                      <div className="group relative flex items-center justify-center">
                        <span
                          onClick={() => startEdit(card)}
                          className="w-6 text-center font-medium text-yellow-400 cursor-text hover:bg-neutral-800 rounded"
                        >
                          {card.quantity}
                        </span>
                        <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          Exceeds the 4-copy limit for standard play
                        </span>
                      </div>
                    ) : (
                      <span
                        onClick={() => startEdit(card)}
                        className="w-6 text-center font-medium text-neutral-300 cursor-text hover:bg-neutral-800 rounded"
                      >
                        {card.quantity}
                      </span>
                    )}
                    <Plus
                      onClick={() => onUpdateQuantity(card.id, 1)}
                      className="w-3 h-3 cursor-pointer text-neutral-500"
                    />
                  </div>
                </td>

                {/* Owned — always full brightness, progress bar spans full cell width */}
                <td className="py-1 w-24">
                  <div className="px-2">
                    <div className="flex items-center gap-1">
                      <Check
                        onClick={() => onUpdateOwnedQty(card.id, isChecked ? 0 : (lastOwnedQtyRef.current.get(card.id) ?? Math.max(card.quantity, 1)))}
                        className={`w-3.5 h-3.5 flex-shrink-0 cursor-pointer ${isChecked ? "text-green-500 hover:text-green-400" : "text-neutral-700 hover:text-green-400"}`}
                      />
                      {card.ownedQty > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Minus
                            onClick={() => onUpdateOwnedQty(card.id, card.ownedQty - 1)}
                            className="w-3 h-3 cursor-pointer text-neutral-500 hover:text-white transition-colors"
                          />
                          <span className="text-[9px] text-green-400/80 font-medium w-3 text-center tabular-nums">{card.ownedQty}</span>
                          <Plus
                            onClick={() => onUpdateOwnedQty(card.id, card.ownedQty + 1)}
                            className="w-3 h-3 cursor-pointer text-neutral-500 hover:text-white transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Progress bar — no px padding so it spans the full cell width */}
                  <div className="h-0.5 bg-neutral-700 overflow-hidden mt-0.5">
                    <div
                      className="h-full bg-green-500/60 transition-all duration-200"
                      style={{ width: `${ownershipRatio * 100}%` }}
                    />
                  </div>
                </td>

                {/* Name */}
                <td
                  onClick={() => onSelect(card)}
                  className={`px-2 py-1 cursor-pointer hover:underline truncate min-w-0 ${cellGrayscale}`}
                  style={{ opacity: cellOpacity }}
                >
                  <span className={`font-medium ${nameColor}`}>
                    {card.name}
                  </span>
                </td>

                {/* Type */}
                <td className={`px-2 py-1 text-[10px] text-neutral-500 truncate ${cellGrayscale}`} style={{ opacity: cellOpacity }}>
                  {card.type_line || "—"}
                </td>

                {/* Mana */}
                <td className={`px-2 py-1 ${cellGrayscale}`} style={{ opacity: cellOpacity }}>
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

                {/* Price */}
                <td
                  className={`px-2 py-1 text-right text-[10px] tabular-nums ${isFullyOwned ? "text-green-500/50" : "text-neutral-400"} ${cellGrayscale}`}
                  style={{ opacity: cellOpacity }}
                >
                  {card.prices.usd ? `$${card.prices.usd}` : "N/A"}
                </td>

                {/* Remove */}
                <td className="pr-3 py-1 text-center">
                  <X
                    onClick={() => onRemove(card.id)}
                    className="w-3 h-3 inline cursor-pointer text-neutral-700 hover:text-red-500"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
