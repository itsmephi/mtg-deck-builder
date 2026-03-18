import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import { DeckCard, ScryfallCard } from "@/types";
import { DeckFormat, getFormatRules, getCardWarnings, isEligibleCommander } from "@/lib/formatRules";

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

// Crown SVG paths
const CrownFilled = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 18h18v2H3v-2zm0-2l3-8 4 3 2-6 2 6 4-3 3 8H3z" />
  </svg>
);

const CrownOutline = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M3 18h18v2H3v-2zm0-2l3-8 4 3 2-6 2 6 4-3 3 8H3z" />
  </svg>
);

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
  sideboardQtyMap?: Map<string, number>;
  sortBy?: string;
  isGrouped?: boolean;
  // Commander/format props
  format?: DeckFormat;
  commanderId?: string;
  commanderIdentity?: string[];
  onSetCommander?: (id: string | undefined) => void;
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
  format = "freeform",
  commanderId,
  commanderIdentity,
  onSetCommander,
}: ListCardTableProps) {
  const rules = getFormatRules(format);

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
      onSetQuantity(card.id, 0);
    } else if (!isNaN(parsed) && parsed > 0) {
      onSetQuantity(card.id, parsed);
    }
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

  const isCommanderFormat = format === "commander";
  const COLUMN_COUNT = 7;

  // Separate out pinned commander (first card if it's the commander)
  const pinnedCommander =
    isCommanderFormat && commanderId && cards.length > 0 && cards[0].id === commanderId
      ? cards[0]
      : null;
  const bodyCards = pinnedCommander ? cards.slice(1) : cards;

  const renderRow = (card: DeckCard, index: number, fromPinned = false) => {
    const showGroupSpacer =
      !fromPinned &&
      !isGrouped &&
      !!sortBy &&
      (sortBy === "color" || sortBy === "mv") &&
      index > 0 &&
      getGroupKey(bodyCards[index - 1], sortBy) !== getGroupKey(card, sortBy);

    const isFullyOwned = card.quantity > 0 && card.ownedQty >= card.quantity;
    const ownershipRatio = card.quantity > 0 ? Math.min(card.ownedQty / card.quantity, 1) : 0;
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
    const atCopyLimit = combinedQty === rules.copyLimit && !isExempt;
    const overCopyLimit = combinedQty >= rules.softWarnThreshold && !isExempt;
    const showCopyBadge = atCopyLimit || overCopyLimit;

    const isThisCommander = isCommanderFormat && card.id === commanderId;
    const warnings = getCardWarnings(card, format, commanderIdentity);
    const eligibleCommander = isEligibleCommander(card);

    // Row background — commander row uses normal card color tint (no special yellow)
    let rowBg: string;
    if (highlightedId === card.id) {
      rowBg = ""; // handled by className
    } else if (hoveredRowId === card.id) {
      rowBg = getRowHoverTint(card);
    } else {
      rowBg = getRowTint(card);
    }

    const qtyButtonBase = "w-5 h-5 rounded-full bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white flex items-center justify-center transition-colors";
    const qtyButtonClass = isThisCommander
      ? qtyButtonBase
      : `${qtyButtonBase} opacity-0 group-hover:opacity-100`;

    return (
      <React.Fragment key={card.id}>
        {showGroupSpacer && (
          <tr aria-hidden>
            <td colSpan={COLUMN_COUNT} className="p-0 bg-transparent">
              <div className="h-3" />
            </td>
          </tr>
        )}
        <tr
          ref={(el) => {
            if (el && cardRefs) {
              cardRefs.current.set(card.id, el);
            }
          }}
          onMouseEnter={() => { onHoverStart(card); setHoveredRowId(card.id); }}
          onMouseLeave={() => { onHoverEnd(); setHoveredRowId(null); }}
          className={`border-b border-neutral-800/40 transition-colors group ${highlightedId === card.id ? "bg-yellow-400/10 outline outline-1 outline-yellow-400/50" : ""}`}
          style={highlightedId !== card.id ? { backgroundColor: rowBg } : undefined}
        >
          {/* Qty — [− qty +] */}
          <td className={`px-2 py-1 w-24 ${cellGrayscale}`} style={{ opacity: cellOpacity }}>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateQuantity(card.id, -1)}
                className={qtyButtonClass}
              >
                <svg width="8" height="8" viewBox="0 0 8 2" fill="currentColor">
                  <rect x="0" y="0" width="8" height="2" />
                </svg>
              </button>

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
                <div className="group/badge relative flex items-center justify-center">
                  <span
                    onClick={() => startEdit(card)}
                    className={`w-6 text-center font-medium cursor-text hover:bg-neutral-800 rounded ${atCopyLimit ? "text-green-400" : "text-red-400"}`}
                  >
                    {card.quantity}
                  </span>
                  {overCopyLimit && (
                    <span className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
                      {format === "commander" ? "Exceeds singleton limit" : `Exceeds ${rules.copyLimit}-copy limit`}
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

              <button
                onClick={() => onUpdateQuantity(card.id, 1)}
                className={qtyButtonClass}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                  <rect x="3" y="0" width="2" height="8" />
                  <rect x="0" y="3" width="8" height="2" />
                </svg>
              </button>
            </div>
          </td>

          {/* Owned — X/Y inline-editable */}
          <td className="py-1 w-16">
            <div className="px-2 flex items-center">
              {editingOwnedId === card.id ? (
                <div className="flex items-center gap-0.5">
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
                    className="w-5 text-center text-[10px] font-medium bg-neutral-800 border border-blue-500 rounded text-green-400 focus:outline-none"
                    autoFocus
                  />
                  <span className={`text-[10px] tabular-nums ${isFullyOwned ? "text-green-400" : "text-neutral-400"}`}>
                    /{card.quantity}
                  </span>
                </div>
              ) : (
                <span
                  onClick={() => startOwnedEdit(card)}
                  className={`text-[10px] tabular-nums cursor-pointer hover:underline ${isFullyOwned ? "text-green-400" : "text-neutral-400"}`}
                >
                  {card.ownedQty}/{card.quantity}
                </span>
              )}
            </div>
          </td>

          {/* Name — crown icon before, warning icon after */}
          <td
            className={`px-2 py-1 min-w-0 ${cellGrayscale}`}
            style={{ opacity: cellOpacity }}
          >
            <div className="flex items-center gap-1 min-w-0">
              {/* Crown icon — commander format only */}
              {isCommanderFormat && onSetCommander && (
                isThisCommander ? (
                  <button
                    onClick={() => onSetCommander(undefined)}
                    title="Remove commander designation"
                    className="shrink-0 cursor-pointer"
                  >
                    <CrownFilled className="text-yellow-400 w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => onSetCommander(card.id)}
                    title={
                      !eligibleCommander
                        ? "Set as Commander (not typically eligible)"
                        : "Set as Commander"
                    }
                    className="opacity-0 group-hover:opacity-100 shrink-0 transition-opacity cursor-pointer"
                  >
                    <CrownOutline className="text-neutral-600 hover:text-yellow-400 w-3.5 h-3.5" />
                  </button>
                )
              )}

              {/* Card name */}
              <span
                onClick={() => onSelect(card)}
                className={`font-medium cursor-pointer hover:underline truncate ${nameColor}`}
              >
                {card.name}
              </span>

              {/* Warning icon — triangle */}
              {warnings.length > 0 && (
                <span title={warnings.join("\n")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0 ml-0.5">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" fill="#f59e0b" stroke="none" />
                    <path d="M12 9v4" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <circle cx="12" cy="17" r="1" fill="white" />
                  </svg>
                </span>
              )}
            </div>
          </td>

          {/* Type */}
          <td className={`px-2 py-1 text-[10px] text-neutral-500 truncate w-48 ${cellGrayscale}`} style={{ opacity: cellOpacity }}>
            {card.type_line || "—"}
          </td>

          {/* Mana */}
          <td className={`px-2 py-1 w-24 ${cellGrayscale}`} style={{ opacity: cellOpacity }}>
            {card.card_faces ? (
              <div className="flex items-center gap-1">
                {renderManaSymbols(card.card_faces[0].mana_cost)}
                <span className="text-[10px] text-neutral-600 font-bold">//</span>
                {renderManaSymbols(card.card_faces[1].mana_cost)}
              </div>
            ) : (
              renderManaSymbols((card as any).mana_cost)
            )}
          </td>

          {/* Price */}
          <td
            className={`px-2 py-1 text-right text-[10px] tabular-nums w-20 ${isFullyOwned ? "text-green-500/50" : "text-neutral-400"} ${cellGrayscale}`}
            style={{ opacity: cellOpacity }}
          >
            {card.prices.usd ? `$${card.prices.usd}` : "N/A"}
          </td>

          {/* Remove */}
          <td className="pr-3 py-1 text-center w-8">
            <X
              onClick={() => onRemove(card.id)}
              className="w-3 h-3 inline cursor-pointer text-neutral-700 hover:text-red-500"
            />
          </td>
        </tr>
      </React.Fragment>
    );
  };

  return (
    <div
      className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-sm"
      onMouseMove={onMouseMove}
    >
      <table className="w-full table-fixed text-left text-xs">
        {showHeader && (
          <thead className="bg-neutral-900 text-[10px] text-neutral-500 border-b border-neutral-800 uppercase tracking-wider">
            <tr>
              <th className="px-2 py-1.5 w-24">Qty</th>
              <th className="py-1.5 w-16">Owned</th>
              <th className="px-2 py-1.5 min-w-0">Name</th>
              <th className="px-2 py-1.5 w-48">Type</th>
              <th className="px-2 py-1.5 w-24">Mana</th>
              <th className="px-2 py-1.5 text-right w-20">Price</th>
              <th className="pr-3 py-1.5 w-8 text-center"></th>
            </tr>
          </thead>
        )}
        <tbody>
          {/* Pinned commander row */}
          {pinnedCommander && (
            <>
              {renderRow(pinnedCommander, 0, true)}
              <tr aria-hidden>
                <td colSpan={COLUMN_COUNT} className="p-0 bg-transparent">
                  <div className="h-3" />
                </td>
              </tr>
            </>
          )}
          {/* Remaining cards */}
          {bodyCards.map((card, index) => renderRow(card, index))}
        </tbody>
      </table>
    </div>
  );
}
