import { Minus, Plus, TriangleAlert, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { DeckCard, ScryfallCard } from '@/types';
import { DeckFormat, getCardWarnings, isEligibleCommander } from '@/lib/formatRules';

interface VisualCardProps {
  card: DeckCard;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetQuantity: (id: string, qty: number) => void;
  onUpdateOwnedQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onSelect: (card: ScryfallCard) => void;
  extraQty?: number;
  // Commander/format props
  format?: DeckFormat;
  commanderId?: string;
  commanderIdentity?: string[];
  onSetCommander?: (id: string | undefined) => void;
}

export default function VisualCard({
  card,
  onUpdateQuantity,
  onSetQuantity,
  onUpdateOwnedQty,
  onRemove,
  onSelect,
  extraQty = 0,
  format = "freeform",
  commanderId,
  commanderIdentity,
  onSetCommander,
}: VisualCardProps) {
  const isExempt =
    card.type_line?.toLowerCase().includes("basic land") ||
    card.oracle_text?.includes("A deck can have any number");
  const combinedQty = card.quantity + extraQty;
  const atCopyLimit = combinedQty === 4 && !isExempt;
  const overCopyLimit = combinedQty >= 5 && !isExempt;

  const isCommander = format === "commander" && card.id === commanderId;
  const warnings = getCardWarnings(card, format, commanderIdentity);

  // Inline qty editing
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const isEscaping = useRef(false);

  // Inline owned editing
  const [isOwnedEditing, setIsOwnedEditing] = useState(false);
  const [ownedEditValue, setOwnedEditValue] = useState("");
  const isOwnedEscaping = useRef(false);

  const startEdit = () => {
    setIsEditing(true);
    setEditValue(String(card.quantity));
  };

  const commitEdit = () => {
    const trimmed = editValue.trim();
    const parsed = parseInt(trimmed, 10);
    if (trimmed === "" || parsed === 0) {
      onSetQuantity(card.id, 0);
    } else if (!isNaN(parsed) && parsed > 0) {
      onSetQuantity(card.id, parsed);
    }
    setIsEditing(false);
  };

  const startOwnedEdit = () => {
    setIsOwnedEditing(true);
    setOwnedEditValue(String(card.ownedQty));
  };

  const commitOwnedEdit = () => {
    const trimmed = ownedEditValue.trim();
    const parsed = parseInt(trimmed, 10);
    if (trimmed !== "" && !isNaN(parsed) && parsed >= 0) {
      onUpdateOwnedQty(card.id, parsed);
    }
    setIsOwnedEditing(false);
  };

  const imgSrc =
    card.card_faces?.[0].image_uris?.normal || card.image_uris?.normal;

  const overlayQtyClass = overCopyLimit
    ? "text-red-400"
    : atCopyLimit
    ? "text-green-400"
    : "text-white";

  const isFullyOwned = card.ownedQty >= card.quantity;

  const eligible = isEligibleCommander(card);

  return (
    <div
      className="relative group rounded-xl cursor-pointer aspect-[2.5/3.5]"
      onClick={() => onSelect(card)}
    >
      {/* Art + slide-up overlay — clipped to rounded corners */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        {/* Card art */}
        <img
          src={imgSrc}
          className={`w-full h-full object-cover ${card.quantity === 0 ? "grayscale opacity-40" : isFullyOwned ? "opacity-40" : ""}`}
          alt={card.name}
        />

        {/* × remove — inset top-right, hover-only */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(card.id);
          }}
          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-neutral-900 text-neutral-400 hover:text-red-400 hover:bg-red-900 opacity-0 group-hover:opacity-100 transition-all z-30"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Slide-up bottom overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-sm px-2 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out z-20 flex flex-col items-center gap-2.5"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Commander designation button — only in commander format */}
        {format === "commander" && onSetCommander && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetCommander(isCommander ? undefined : card.id);
            }}
            title={
              !eligible
                ? `${isCommander ? "Commander ✓" : "Set as Commander"} (not typically eligible)`
                : undefined
            }
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-colors hover:bg-white/10"
          >
            {isCommander ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400 shrink-0">
                  <path d="M3 18h18v2H3v-2zm0-2l3-8 4 3 2-6 2 6 4-3 3 8H3z" />
                </svg>
                <span className="text-yellow-400">Commander ✓</span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400 shrink-0">
                  <path d="M3 18h18v2H3v-2zm0-2l3-8 4 3 2-6 2 6 4-3 3 8H3z" />
                </svg>
                <span className="text-neutral-300">Set as Commander</span>
              </>
            )}
          </button>
        )}

        {/* − qty + controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQuantity(card.id, -1);
            }}
            className="w-7 h-7 rounded-full bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600 hover:text-white flex items-center justify-center transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {isEditing ? (
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
                commitEdit();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitEdit();
                }
                if (e.key === "Escape") {
                  isEscaping.current = true;
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-8 text-center text-sm font-bold bg-neutral-800 border border-blue-500 rounded text-white focus:outline-none tabular-nums"
              autoFocus
            />
          ) : (
            <span
              onClick={(e) => {
                e.stopPropagation();
                startEdit();
              }}
              className={`text-sm font-bold tabular-nums cursor-text w-6 text-center ${overlayQtyClass}`}
            >
              {card.quantity}
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQuantity(card.id, 1);
            }}
            className="w-7 h-7 rounded-full bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600 hover:text-white flex items-center justify-center transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Owned counter — inline editable */}
        <div className="flex items-center gap-0.5">
          <span
            className={`text-[10px] tabular-nums ${
              isFullyOwned ? "text-green-400" : "text-neutral-400"
            }`}
          >
            Owned:&nbsp;
          </span>
          {isOwnedEditing ? (
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
                commitOwnedEdit();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitOwnedEdit();
                }
                if (e.key === "Escape") {
                  isOwnedEscaping.current = true;
                  setIsOwnedEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-6 text-center text-[10px] font-medium bg-neutral-800 border border-blue-500 rounded text-green-400 focus:outline-none"
              autoFocus
            />
          ) : (
            <span
              onClick={(e) => {
                e.stopPropagation();
                startOwnedEdit();
              }}
              className={`text-[10px] tabular-nums cursor-pointer hover:underline ${
                isFullyOwned ? "text-green-400" : "text-neutral-400"
              }`}
            >
              {card.ownedQty}
            </span>
          )}
          <span
            className={`text-[10px] tabular-nums ${
              isFullyOwned ? "text-green-400" : "text-neutral-400"
            }`}
          >
            /{card.quantity}
          </span>
        </div>
      </div>
      {/* End art + overlay inner wrapper */}
      </div>

      {/* Crown badge — top-left */}
      {isCommander && (
        <div className="absolute -top-3.5 -left-3.5 z-20 w-7 h-7 rounded-full bg-yellow-500 text-white shadow-md flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v2H3v-2zm0-2l3-8 4 3 2-6 2 6 4-3 3 8H3z" />
          </svg>
        </div>
      )}

      {/* Warning badge — top-right */}
      {warnings.length > 0 && (
        <div className="absolute -top-3.5 -right-3.5 z-20" title={warnings.join("\n")}>
          <TriangleAlert className="w-[22px] h-[22px] fill-amber-500 text-white drop-shadow-md" />
        </div>
      )}
    </div>
  );
}
