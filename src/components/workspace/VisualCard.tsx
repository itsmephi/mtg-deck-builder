import { Minus, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { DeckCard, ScryfallCard } from '@/types';

interface VisualCardProps {
  card: DeckCard;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetQuantity: (id: string, qty: number) => void;
  onUpdateOwnedQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onSelect: (card: ScryfallCard) => void;
  extraQty?: number;
}

export default function VisualCard({
  card,
  onUpdateQuantity,
  onSetQuantity,
  onUpdateOwnedQty,
  onRemove,
  onSelect,
  extraQty = 0,
}: VisualCardProps) {
  const isExempt =
    card.type_line?.toLowerCase().includes("basic land") ||
    card.oracle_text?.includes("A deck can have any number");
  const combinedQty = card.quantity + extraQty;
  const atCopyLimit = combinedQty === 4 && !isExempt;
  const overCopyLimit = combinedQty >= 5 && !isExempt;

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

  const badgeClass = overCopyLimit
    ? "bg-red-500/80 text-white"
    : atCopyLimit
    ? "bg-green-500/80 text-white"
    : "bg-black/60 text-neutral-300";

  const isFullyOwned = card.ownedQty >= card.quantity;

  return (
    <div
      className={`relative group overflow-hidden rounded-xl cursor-pointer aspect-[2.5/3.5] ${
        card.quantity === 0 ? "opacity-40" : ""
      }`}
      onClick={() => onSelect(card)}
    >
      {/* Card art */}
      <img
        src={imgSrc}
        className={`w-full h-full object-cover ${card.quantity === 0 ? "grayscale" : ""}`}
        alt={card.name}
      />

      {/* Qty badge — top-left, always visible */}
      <div
        className={`absolute top-1.5 left-1.5 w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold z-10 ${badgeClass}`}
      >
        {card.quantity}
      </div>

      {/* × remove — top-right, hover-only */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(card.id);
        }}
        className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-neutral-400 hover:text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all z-30"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Slide-up bottom overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-sm px-2 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out z-20 flex flex-col items-center gap-2.5"
        onClick={(e) => e.stopPropagation()}
      >
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
              className="text-sm font-bold text-white tabular-nums cursor-text w-6 text-center"
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
    </div>
  );
}
