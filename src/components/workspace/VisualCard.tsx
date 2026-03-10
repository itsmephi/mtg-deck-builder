import { Plus, Minus, Check, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { DeckCard, ScryfallCard } from '@/types';

interface VisualCardProps {
  card: DeckCard;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetQuantity: (id: string, qty: number) => void;
  onUpdateOwnedQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onSelect: (card: ScryfallCard) => void;
  // Qty of same card in the other pool (main/sideboard) for combined 4-copy check
  extraQty?: number;
}

export default function VisualCard({ card, onUpdateQuantity, onSetQuantity, onUpdateOwnedQty, onRemove, onSelect, extraQty = 0 }: VisualCardProps) {
  const isDoubleFaced = !!card.card_faces && card.card_faces.length > 1;
  const isRoom = card.type_line?.includes('Room');
  const hasBackArt = isDoubleFaced && !!card.card_faces![1].image_uris && !isRoom;

  const overCopyLimit =
    (card.quantity + extraQty) >= 5 &&
    !card.type_line?.toLowerCase().includes("basic land") &&
    !card.oracle_text?.includes("A deck can have any number");

  const isFullyOwned = card.quantity > 0 && card.ownedQty >= card.quantity;
  const isChecked = card.ownedQty > 0;
  // Visual-only cap at 100% — underlying ownedQty is never clamped
  const ownershipRatio = card.quantity > 0 ? Math.min(card.ownedQty / card.quantity, 1) : 0;

  // Remember last non-zero ownedQty so the checkbox can restore it on re-check
  const lastOwnedQtyRef = useRef<number>(card.ownedQty > 0 ? card.ownedQty : Math.max(card.quantity, 1));
  if (card.ownedQty > 0) lastOwnedQtyRef.current = card.ownedQty;

  // Inline quantity editing
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const isEscaping = useRef(false);

  // Inline owned editing
  const [isOwnedEditing, setIsOwnedEditing] = useState(false);
  const [ownedEditValue, setOwnedEditValue] = useState("");
  const isOwnedEscaping = useRef(false);

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
    // empty or non-numeric: silently revert
    setIsOwnedEditing(false);
  };

  const startEdit = () => {
    setIsEditing(true);
    setEditValue(String(card.quantity));
  };

  const commitEdit = () => {
    const trimmed = editValue.trim();
    const parsed = parseInt(trimmed, 10);
    if (trimmed === "" || parsed === 0) {
      // 0 or empty: qty → 0, card grays out and stays in deck (matches − button behavior)
      onSetQuantity(card.id, 0);
    } else if (!isNaN(parsed) && parsed > 0) {
      // Allow any positive value — over-4 shows warning badge (soft warning, not a cap)
      onSetQuantity(card.id, parsed);
    }
    // non-numeric or negative: silently revert
    setIsEditing(false);
  };

  const imgStyles = `w-full h-full rounded-lg object-cover transition-opacity duration-300 ${
    card.quantity === 0 ? 'opacity-25 grayscale' : ''
  }`;

  return (
    <div className="group/card flex flex-col p-1.5 rounded-xl border border-neutral-800 bg-neutral-900 transition-all hover:border-neutral-700">
      <div className="flex justify-between items-center px-0.5 mb-1.5 text-[10px]">
        <span className="text-neutral-400">${card.prices.usd || '0.00'}</span>
        <div className="flex items-center gap-2">

          {/* Owned stepper — visible when ownedQty > 0 */}
          {card.ownedQty > 0 && (
            <div className="flex items-center gap-0.5">
              <Minus
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onUpdateOwnedQty(card.id, card.ownedQty - 1); }}
                className="w-3 h-3 cursor-pointer text-neutral-500 hover:text-white transition-colors"
              />
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
                  className="w-5 text-center text-[10px] font-medium bg-neutral-800 border border-blue-500 rounded text-green-400/80 focus:outline-none"
                  autoFocus
                />
              ) : (
                <span
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); startOwnedEdit(); }}
                  className="text-[10px] text-green-400/80 font-medium w-3 text-center tabular-nums cursor-text hover:bg-neutral-800 rounded transition-colors"
                >
                  {card.ownedQty}
                </span>
              )}
              <Plus
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onUpdateOwnedQty(card.id, card.ownedQty + 1); }}
                className="w-3 h-3 cursor-pointer text-neutral-500 hover:text-white transition-colors"
              />
            </div>
          )}

          {/* Flipped Tooltip: Drops DOWN to avoid top frame clipping */}
          <div className="group relative flex items-center justify-center">
            <Check
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onUpdateOwnedQty(card.id, isChecked ? 0 : lastOwnedQtyRef.current); }}
              className={`w-3 h-3 cursor-pointer transition-colors ${isChecked ? 'text-green-500' : 'text-neutral-600 hover:text-green-400'}`}
            />
            <span className="absolute top-full mt-1.5 left-0 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
              {isChecked ? 'Unmark Owned' : 'Mark Owned'}
            </span>
          </div>

          <X
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRemove(card.id); }}
            className="w-3 h-3 cursor-pointer text-neutral-600 hover:text-red-500 transition-colors"
          />

        </div>
      </div>

      <div className="relative aspect-[2.5/3.5] w-full cursor-pointer" style={{ perspective: '1000px' }} onClick={() => onSelect(card)}>
        <div className={`relative w-full h-full transition-transform duration-500 shadow-lg rounded-lg ${hasBackArt ? 'group-hover/card:[transform:rotateY(180deg)]' : 'hover:scale-105'}`} style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0 w-full h-full backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
            <img src={card.card_faces?.[0].image_uris?.normal || card.image_uris?.normal} className={imgStyles} alt={card.name} />
            {/* Gray ownership overlay — scales with ownership, always in DOM for smooth transition */}
            <div
              className="absolute inset-0 rounded-lg bg-neutral-900 pointer-events-none transition-opacity duration-300"
              style={{ opacity: ownershipRatio * 0.65 }}
            />
          </div>
          {hasBackArt && (
            <div className="absolute inset-0 w-full h-full backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <img src={card.card_faces![1].image_uris?.normal} className={imgStyles} alt={card.name} />
              <div
                className="absolute inset-0 rounded-lg bg-neutral-900 pointer-events-none transition-opacity duration-300"
                style={{ opacity: ownershipRatio * 0.65 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Ownership progress bar — always in DOM so layout never shifts */}
      <div className="mx-0.5 mt-1.5 mb-0.5 h-0.5 rounded-full bg-neutral-800 overflow-hidden">
        <div
          className="h-full bg-green-500/60 transition-all duration-200"
          style={{ width: `${ownershipRatio * 100}%` }}
        />
      </div>

      {/* Bottom bar: − qty + grouped and centered */}
      <div className="flex justify-center items-center mt-0.5 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 gap-1">
        <div className="flex items-center justify-center">
          <Minus
            onClick={() => onUpdateQuantity(card.id, -1)}
            className="w-4 h-4 p-0.5 cursor-pointer text-neutral-500 hover:text-white transition-colors"
          />
        </div>

        <div className="group relative flex items-center justify-center">
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
              className="w-8 text-center text-xs font-bold bg-neutral-800 border border-blue-500 rounded text-neutral-200 focus:outline-none"
              autoFocus
            />
          ) : (
            <span
              onClick={startEdit}
              className={`text-xs font-bold cursor-text px-1 rounded hover:bg-neutral-800 transition-colors ${overCopyLimit ? "text-red-400" : "text-neutral-200"}`}
            >
              {card.quantity}
            </span>
          )}
          {overCopyLimit && !isEditing && (
            <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal max-w-xs z-50">
              Exceeds 4-copy limit
            </span>
          )}
        </div>

        <div className="flex items-center justify-center">
          <Plus
            onClick={() => onUpdateQuantity(card.id, 1)}
            className="w-4 h-4 p-0.5 cursor-pointer text-neutral-500 hover:text-white transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
