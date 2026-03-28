import { Minus, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { DeckCard, ScryfallCard } from '@/types';
import { DeckFormat, getCardWarnings, isEligibleCommander, isVehicleOrSpacecraftCommander, hasPartnerAbility } from '@/lib/formatRules';
import { TileSizeKey } from '@/config/gridConfig';

const PRICE_BADGE_SIZES: Record<TileSizeKey, { fontSize: string; padding: string; bottom: string; right: string; borderRadius: string }> = {
  xs: { fontSize: '9px',  padding: '2px 4px', bottom: '-6px', right: '-3px', borderRadius: '5px' },
  s:  { fontSize: '10px', padding: '2px 6px', bottom: '-6px', right: '-3px', borderRadius: '6px' },
  m:  { fontSize: '11px', padding: '3px 7px', bottom: '-7px', right: '-4px', borderRadius: '7px' },
  l:  { fontSize: '12px', padding: '3px 8px', bottom: '-7px', right: '-4px', borderRadius: '7px' },
  xl: { fontSize: '13px', padding: '4px 9px', bottom: '-7px', right: '-4px', borderRadius: '7px' },
};

interface VisualCardProps {
  card: DeckCard;
  onSelect: (card: ScryfallCard) => void;
  // Deck mode props (not used in search mode)
  onUpdateQuantity?: (id: string, delta: number) => void;
  onSetQuantity?: (id: string, qty: number) => void;
  onUpdateOwnedQty?: (id: string, qty: number) => void;
  onRemove?: (id: string) => void;
  extraQty?: number;
  // Commander/format props
  format?: DeckFormat;
  commanderIds?: string[];
  commanderIdentity?: string[];
  partnerValidation?: { valid: boolean; warning?: string };
  existingCommanderHasPartner?: boolean;
  onAddCommander?: (id: string) => void;
  onRemoveCommander?: (id: string) => void;
  onReplaceCommander?: (slot: 0 | 1, id: string) => void;
  // Search mode props
  mode?: "deck" | "search";
  inDeck?: boolean;
  onAdd?: (card: ScryfallCard) => void;
  // Tile size for price badge scaling
  tileSize?: TileSizeKey;
}

export default function VisualCard({
  card,
  onSelect,
  onUpdateQuantity = () => {},
  onSetQuantity = () => {},
  onUpdateOwnedQty = () => {},
  onRemove = () => {},
  extraQty = 0,
  format = "freeform",
  commanderIds,
  commanderIdentity,
  partnerValidation,
  existingCommanderHasPartner = false,
  onAddCommander,
  onRemoveCommander,
  onReplaceCommander,
  mode = "deck",
  inDeck = false,
  onAdd,
  tileSize = "m",
}: VisualCardProps) {
  const badgeSize = PRICE_BADGE_SIZES[tileSize];

  // Search mode — simplified tile with "+ Add to Deck" overlay
  if (mode === "search") {
    const imgSrc = card.card_faces?.[0].image_uris?.normal || card.image_uris?.normal;
    const price = card.prices?.usd ? `$${card.prices.usd}` : null;
    return (
      <div
        className="relative group rounded-xl cursor-pointer aspect-[2.5/3.5]"
        onClick={() => onSelect(card)}
      >
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <img src={imgSrc} className={`w-full h-full object-cover${inDeck ? " opacity-40" : ""}`} alt={card.name} />
          {/* Slide-up overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-sm px-2 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out z-20 flex flex-col items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-semibold text-content-primary text-center leading-tight line-clamp-2">
              {card.name}
            </span>
            <span className="text-[10px] text-content-tertiary truncate w-full text-center">
              {card.type_line}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd?.(card);
              }}
              className="mt-0.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-full transition-colors"
            >
              + Add to Deck
            </button>
          </div>
        </div>
        {/* In-deck indicator */}
        {inDeck && (
          <div title="Already in deck" className="absolute top-1.5 left-1.5 z-20 w-2 h-2 rounded-full bg-green-500 ring-2 ring-neutral-950" />
        )}
        {/* Price pill — bottom-right corner, fades on hover */}
        <div
          className="absolute z-[22] group-hover:opacity-0 group-hover:pointer-events-none transition-opacity duration-150"
          style={{
            bottom: badgeSize.bottom,
            right: badgeSize.right,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: price ? '#e5e5e5' : undefined,
            opacity: price ? undefined : 0.45,
            fontSize: badgeSize.fontSize,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            padding: badgeSize.padding,
            borderRadius: badgeSize.borderRadius,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {price ?? '—'}
        </div>
      </div>
    );
  }
  const isExempt =
    card.type_line?.toLowerCase().includes("basic land") ||
    card.oracle_text?.includes("A deck can have any number");
  const combinedQty = card.quantity + extraQty;
  const atCopyLimit = combinedQty === 4 && !isExempt;
  const overCopyLimit = combinedQty >= 5 && !isExempt;

  const isCommander1 = format === "commander" && card.id === commanderIds?.[0];
  const isCommander2 = format === "commander" && card.id === commanderIds?.[1];
  const isCommander = isCommander1 || isCommander2;
  const commanderCount = commanderIds?.length ?? 0;
  const cardHasPartner = hasPartnerAbility(card);
  const partnerInvalid = isCommander2 && partnerValidation?.valid === false;
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

  const isFullyOwned = card.ownedQty >= card.quantity;

  const overlayQtyClass = overCopyLimit
    ? "text-red-400"
    : isFullyOwned
    ? "text-green-400"
    : "text-content-primary";

  const eligible = isEligibleCommander(card);
  const isVehicleOrSpacecraft = isVehicleOrSpacecraftCommander(card);
  const [showCrownTooltip, setShowCrownTooltip] = useState(false);
  const crownTooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Qty pill color (priority: warning > fully owned > neutral)
  const isFullyOwnedForPill = card.quantity > 0 && card.ownedQty >= card.quantity;
  const pillColorClass = warnings.length > 0
    ? "bg-red-900 text-red-400"
    : isFullyOwnedForPill
    ? "bg-green-800 text-green-400"
    : "";
  const pillNeutralStyle = !warnings.length && !isFullyOwnedForPill
    ? { background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: "#e5e5e5" } as React.CSSProperties
    : undefined;

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
          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-surface-base text-content-tertiary hover:text-red-400 hover:bg-red-900 opacity-0 group-hover:opacity-100 transition-all z-30"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Slide-up bottom overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-sm px-2 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out z-20 flex flex-col items-center gap-2.5"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Card name + type */}
        <span className="text-xs font-semibold text-content-primary text-center leading-tight line-clamp-2 w-full">
          {card.name}
        </span>
        <span className="text-[10px] text-content-tertiary truncate w-full text-center -mt-1.5">
          {card.type_line}
        </span>
        {/* Warning bar — top of overlay, grid view only */}
        {warnings.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '4px 8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              width: '100%',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" fill="#f87171" />
              <path d="M12 9v4" stroke="#171717" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <circle cx="12" cy="17" r="1" fill="#171717" />
            </svg>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#f87171', whiteSpace: 'nowrap' }}>
              {warnings[0]}
            </span>
          </div>
        )}

        {/* − qty + controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQuantity(card.id, -1);
            }}
            className="w-7 h-7 rounded-full bg-neutral-700/50 text-content-secondary hover:bg-surface-hover hover:text-content-primary flex items-center justify-center transition-colors"
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
              className="w-8 text-center text-sm font-bold bg-surface-raised border border-blue-500 rounded text-content-primary focus:outline-none tabular-nums"
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
            className="w-7 h-7 rounded-full bg-neutral-700/50 text-content-secondary hover:bg-surface-hover hover:text-content-primary flex items-center justify-center transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Owned counter — [− X/Y +] inline editable */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateOwnedQty(card.id, Math.max(0, card.ownedQty - 1));
            }}
            className="w-7 h-7 rounded-full bg-neutral-700/50 text-content-secondary hover:bg-surface-hover hover:text-content-primary flex items-center justify-center transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-0.5">
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
                className="w-6 text-center text-[10px] font-medium bg-surface-raised border border-blue-500 rounded text-green-400 focus:outline-none"
                autoFocus
              />
            ) : (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  startOwnedEdit();
                }}
                className={`text-[10px] tabular-nums cursor-pointer hover:underline ${
                  isFullyOwned ? "text-green-400" : "text-content-tertiary"
                }`}
              >
                {card.ownedQty}
              </span>
            )}
            <span
              className={`text-[10px] tabular-nums ${
                isFullyOwned ? "text-green-400" : "text-content-tertiary"
              }`}
            >
              /{card.quantity}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateOwnedQty(card.id, card.ownedQty + 1);
            }}
            className="w-7 h-7 rounded-full bg-neutral-700/50 text-content-secondary hover:bg-surface-hover hover:text-content-primary flex items-center justify-center transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* End art + overlay inner wrapper */}
      </div>

      {/* Crown badge — top-left, commander format only */}
      {format === "commander" && (onAddCommander || onRemoveCommander || onReplaceCommander) && (
        isCommander ? (
          // Active commander badge
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveCommander?.(card.id);
            }}
            title={partnerInvalid ? partnerValidation?.warning : isCommander2 ? "Partner ✓ — click to remove" : "Commander ✓ — click to remove"}
            className={`absolute -top-3.5 -left-3.5 z-20 w-7 h-7 rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform ${partnerInvalid ? "bg-red-500" : "bg-yellow-500"}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M3 18h18v2H3v-2zm0-2l3-8 4 3 2-6 2 6 4-3 3 8H3z" />
            </svg>
          </button>
        ) : (
          // Non-commander hover crown
          <div
            className="absolute -top-3.5 -left-3.5 z-20"
            onMouseEnter={() => {
              if (crownTooltipTimeout.current) {
                clearTimeout(crownTooltipTimeout.current);
                crownTooltipTimeout.current = null;
              }
              setShowCrownTooltip(true);
            }}
            onMouseLeave={() => {
              crownTooltipTimeout.current = setTimeout(() => setShowCrownTooltip(false), 150);
            }}
          >
            {(() => {
              // Determine crown label and action based on state machine
              let crownLabel = "Set as Commander";
              let crownAction: (() => void) | null = null;
              let canAct = eligible;

              if (commanderCount === 0) {
                crownLabel = "Set as Commander";
                crownAction = eligible ? () => onAddCommander?.(card.id) : null;
              } else if (commanderCount === 1) {
                if (cardHasPartner && existingCommanderHasPartner) {
                  crownLabel = "Set as Partner";
                  crownAction = () => onAddCommander?.(card.id);
                  canAct = true;
                } else {
                  crownLabel = "Set as Commander";
                  crownAction = eligible ? () => onReplaceCommander?.(0, card.id) : null;
                }
              } else {
                // commanderCount === 2
                if (cardHasPartner) {
                  crownLabel = "Set as Partner";
                  crownAction = () => onReplaceCommander?.(1, card.id);
                  canAct = true;
                } else {
                  crownLabel = "Set as Commander";
                  crownAction = eligible ? () => onReplaceCommander?.(0, card.id) : null;
                }
              }

              return (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (canAct && crownAction) crownAction(); }}
                    title={!eligible && commanderCount === 0 ? "Must be Legendary" : undefined}
                    className={`w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 border border-neutral-600 bg-neutral-900/70 shadow-md transition-all duration-150 ${canAct ? "hover:bg-yellow-500/20 hover:border-yellow-400 hover:scale-110 cursor-pointer group/crown" : "cursor-not-allowed"}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path
                        d="M3 18h18v2H3v-2zm0-2l3-8 4 3 2-6 2 6 4-3 3 8H3z"
                        className={canAct ? "fill-[#737373] group-hover/crown:fill-[#eab308] transition-colors" : "fill-[#737373]"}
                      />
                    </svg>
                  </button>

                  {/* Interactive tooltip — actionable cards only */}
                  {showCrownTooltip && canAct && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-[10px] text-neutral-200 whitespace-nowrap z-30 flex items-center gap-1.5"
                      onMouseEnter={() => {
                        if (crownTooltipTimeout.current) {
                          clearTimeout(crownTooltipTimeout.current);
                          crownTooltipTimeout.current = null;
                        }
                      }}
                      onMouseLeave={() => {
                        crownTooltipTimeout.current = setTimeout(() => setShowCrownTooltip(false), 150);
                      }}
                    >
                      <span>{crownLabel}</span>
                      {isVehicleOrSpacecraft && crownLabel === "Set as Commander" && (
                        <a
                          href="https://magic.wizards.com/en/news/feature/edge-of-eternities-mechanics"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-400 hover:text-blue-300 hover:underline"
                          title="Learn about Vehicle/Spacecraft commanders"
                        >
                          ⓘ
                        </a>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )
      )}

      {/* Qty pill — bottom center, straddling edge */}
      <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold tabular-nums shadow-md group-hover:opacity-0 group-hover:pointer-events-none transition-opacity duration-150 ${pillColorClass}`} style={pillNeutralStyle}>
        {card.quantity}
      </div>

      {/* Price pill — bottom-right corner, fades on hover */}
      {(() => {
        const price = card.prices?.usd ? `$${card.prices.usd}` : null;
        return (
          <div
            className="absolute z-[22] group-hover:opacity-0 group-hover:pointer-events-none transition-opacity duration-150"
            style={{
              bottom: badgeSize.bottom,
              right: badgeSize.right,
              background: 'rgba(0,0,0,0.82)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: '#e5e5e5',
              opacity: price ? undefined : 0.45,
              fontSize: badgeSize.fontSize,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              padding: badgeSize.padding,
              borderRadius: badgeSize.borderRadius,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {price ?? '—'}
          </div>
        );
      })()}

    </div>
  );
}
