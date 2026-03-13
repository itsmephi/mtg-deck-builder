import React, { useRef, useState } from "react";

const COLOR_ORDER_L = ["W", "U", "B", "R", "G"];

function getRowTint(card: DeckCard): string {
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

function getRowHoverTint(card: DeckCard): string {
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

function getGroupKey(card: DeckCard, sortBy: string): string {
  if (sortBy === "color") {
    const mc =
      (card as any).mana_cost ??
      card.card_faces?.map((f: any) => f.mana_cost).join("") ??
      "";
    const colors = COLOR_ORDER_L.filter((c) => mc.includes(`{${c}}`));
    if (colors.length === 0) return card.type_line?.includes("Land") ? "land" : "colorless";
    if (colors.length === 1) return colors[0];
    return "multi-" + colors.join("");
  }
  if (sortBy === "mv") {
    return String((card as any).cmc ?? "none");
  }
  return "";
}
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
  // Combined 4-copy check: qty of same card (by name) in the other pool
  sideboardQtyMap?: Map<string, number>;
  sortBy?: string;
  isGrouped?: boolean;
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
  sideboardQtyMap,
  sortBy,
  isGrouped,
}: ListCardTableProps) {
  // Remembers last non-zero ownedQty per card so checkbox can restore it on re-check
  const lastOwnedQtyRef = useRef<Map<string, number>>(new Map());

  // Row hover state for tint brightening
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  // Inline quantity editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const isEscaping = useRef(false);

  // Inline owned editing state
  const [editingOwnedId, setEditingOwnedId] = useState<string | null>(null);
  const [ownedEditValue, setOwnedEditValue] = useState("");
  const isOwnedEscaping = useRef(false);

  const startOwnedEdit = (card: DeckCard) => {
    setEditingOwnedId(card.id);
    setOwnedEditValue(String(card.ownedQty));
  };

  const commitOwnedEdit = (card: DeckCard) => {
    const trimmed = ownedEditValue.trim();
    const parsed = parseInt(trimmed, 10);
    if (trimmed !== "" && !isNaN(parsed) && parsed >= 0) {
      onUpdateOwnedQty(card.id, parsed);
    }
    // empty or non-numeric: silently revert
    setEditingOwnedId(null);
  };

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
      className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-sm"
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
          {cards.map((card, index) => {
            const showGroupSpacer =
              !isGrouped &&
              !!sortBy &&
              (sortBy === "color" || sortBy === "mv") &&
              index > 0 &&
              getGroupKey(cards[index - 1], sortBy) !== getGroupKey(card, sortBy);
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

            const extraQty = sideboardQtyMap?.get(card.name.toLowerCase()) ?? 0;
            const isExempt =
              card.type_line?.toLowerCase().includes("basic land") ||
              card.oracle_text?.includes("A deck can have any number");
            const combinedQty = card.quantity + extraQty;
            const atCopyLimit = combinedQty === 4 && !isExempt;
            const overCopyLimit = combinedQty >= 5 && !isExempt;
            const showCopyBadge = atCopyLimit || overCopyLimit;

            // Keep ref up to date whenever ownedQty is non-zero
            if (card.ownedQty > 0) lastOwnedQtyRef.current.set(card.id, card.ownedQty);

            return (
              <React.Fragment key={card.id}>
              {showGroupSpacer && (
                <tr aria-hidden>
                  <td colSpan={7} className="p-0 bg-transparent">
                    <div className="h-3" />
                  </td>
                </tr>
              )}
              <tr
                ref={(el) => {
                  if (el && cardRefs) {
                    if (el) cardRefs.current.set(card.id, el);
                    else cardRefs.current.delete(card.id);
                  }
                }}
                onMouseEnter={() => { onHoverStart(card); setHoveredRowId(card.id); }}
                onMouseLeave={() => { onHoverEnd(); setHoveredRowId(null); }}
                className={`border-b border-neutral-800/40 transition-colors ${highlightedId === card.id ? "bg-yellow-400/10 outline outline-1 outline-yellow-400/50" : ""}`}
                style={highlightedId !== card.id ? { backgroundColor: hoveredRowId === card.id ? getRowHoverTint(card) : getRowTint(card) } : undefined}
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
                    ) : showCopyBadge ? (
                      <div className="group relative flex items-center justify-center">
                        <span
                          onClick={() => startEdit(card)}
                          className={`w-6 text-center font-medium cursor-text hover:bg-neutral-800 rounded ${atCopyLimit ? "text-green-400" : "text-red-400"}`}
                        >
                          {card.quantity}
                        </span>
                        {overCopyLimit && (
                          <span className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
                            Exceeds 4-copy limit
                          </span>
                        )}
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
                          {editingOwnedId === card.id ? (
                            <input
                              type="text"
                              value={ownedEditValue}
                              onChange={(e) => setOwnedEditValue(e.target.value)}
                              onFocus={(e) => e.target.select()}
                              onBlur={() => {
                                if (isOwnedEscaping.current) {
                                  isOwnedEscaping.current = false;
                                  return;
                                }
                                commitOwnedEdit(card);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  commitOwnedEdit(card);
                                }
                                if (e.key === "Escape") {
                                  isOwnedEscaping.current = true;
                                  setEditingOwnedId(null);
                                }
                              }}
                              className="w-5 text-center text-[9px] font-medium bg-neutral-800 border border-blue-500 rounded text-green-400/80 focus:outline-none"
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={() => startOwnedEdit(card)}
                              className="text-[9px] text-green-400/80 font-medium w-3 text-center tabular-nums cursor-text hover:bg-neutral-800 rounded transition-colors"
                            >
                              {card.ownedQty}
                            </span>
                          )}
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
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
