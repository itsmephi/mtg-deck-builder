"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useDeckManager } from "@/hooks/useDeckManager";
import { useDeckStats } from "@/hooks/useDeckStats";

import CardModal from "../layout/CardModal";
import SampleHandModal from "../layout/SampleHandModal";
import VisualCard from "./VisualCard";
import ListCardTable from "./ListCardTable";
import ImportModal from "./ImportModal";
import WorkspaceToolbar from "./WorkspaceToolbar";
import { ScryfallCard, DeckCard } from "@/types";
import { DeckFormat, getFormatRules } from "@/lib/formatRules";
import { backfillColorIdentity } from "@/lib/scryfall";

interface WorkspaceProps {
  pendingImport: { filename: string; lines: string[] } | null;
  processImport: (mode: "current" | "new") => Promise<void>;
  cancelImport: () => void;
}

// Color sort: WUBRG mono → multicolor (by combination) → colorless/missing
const COLOR_ORDER = ["W", "U", "B", "R", "G"] as const;
const COLOR_BITS: Record<string, number> = { W: 16, U: 8, B: 4, R: 2, G: 1 };

function colorSortKey(card: DeckCard): number {
  const mc =
    card.mana_cost ??
    (card.card_faces?.map((f) => f.mana_cost).join("") ?? "");
  if (!mc) return card.type_line?.includes("Land") ? 2000 : 1000;
  const colors = COLOR_ORDER.filter((c) => mc.includes(`{${c}}`));
  if (colors.length === 0) return card.type_line?.includes("Land") ? 2000 : 1000;
  if (colors.length === 1) return COLOR_ORDER.indexOf(colors[0]);
  const bitmask = colors.reduce(
    (acc, c) => acc | COLOR_BITS[c],
    0,
  );
  return 100 + (31 - bitmask);
}

interface ConfirmDialogState {
  deckId: string;
  sideboardCount: number;
  targetFormat: DeckFormat;
}

export default function Workspace({ pendingImport, processImport, cancelImport }: WorkspaceProps) {
  const {
    decks,
    activeDeck,
    setActiveDeckId,
    updateActiveDeck,
    updateOwnedQty,
    createNewDeck,
    deckViewMode,
    setDeckViewMode,
    isMounted,
    showThumbnail,
    lastAddedId,
    setLastAddedId,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    setCommanderId,
    setDeckFormat,
    mergeSideboardIntoDeck,
    deleteSideboardForFormat,
  } = useDeckManager();
  const { totalCards, totalValue, remainingCost, hasPriceData } =
    useDeckStats(activeDeck ?? null);

  const [viewMode, setViewModeState] = useState<"visual" | "list">("visual");
  const [isGrouped, setIsGroupedState] = useState(false);

  const setViewMode = (v: "visual" | "list") => {
    setViewModeState(v);
    localStorage.setItem("mtg-view-mode", v);
  };

  const setIsGrouped = (g: boolean) => {
    setIsGroupedState(g);
    localStorage.setItem("mtg-group-by-type", String(g));
  };

  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [isSampleHandOpen, setIsSampleHandOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [hoveredCardList, setHoveredCardList] = useState<ScryfallCard | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Confirmation dialog for sideboard → commander format switch (triggered from toolbar)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Escape closes confirm dialog
  useEffect(() => {
    if (!confirmDialog) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmDialog(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirmDialog]);

  // Restore view preferences on mount
  useEffect(() => {
    const storedView = localStorage.getItem("mtg-view-mode");
    if (storedView === "list" || storedView === "visual") setViewModeState(storedView);
    const storedGrouped = localStorage.getItem("mtg-group-by-type");
    if (storedGrouped === "true") setIsGroupedState(true);
  }, []);

  useEffect(() => {
    if (isMounted && !activeDeck) {
      if (decks.length === 0) createNewDeck();
      else setActiveDeckId(decks[0].id);
    }
  }, [isMounted, activeDeck, decks, createNewDeck, setActiveDeckId]);

  // If sideboard is deleted while in sideboard view, switch back to main
  useEffect(() => {
    if (deckViewMode === "sideboard" && activeDeck?.sideboard === undefined) {
      setDeckViewMode("main");
    }
  }, [activeDeck?.sideboard, deckViewMode, setDeckViewMode]);

  // Lazy backfill color_identity when active deck switches to Commander
  useEffect(() => {
    if (activeDeck?.format !== "commander") return;
    if (!activeDeck.cards.some((c) => c.color_identity === undefined)) return;
    backfillColorIdentity(activeDeck.cards).then((updated) => {
      if (updated !== activeDeck.cards) {
        updateActiveDeck((d) => ({ ...d, cards: updated }));
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDeck?.id, activeDeck?.format]);

  useEffect(() => {
    if (!lastAddedId) return;
    const el = cardRefs.current.get(lastAddedId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setHighlightedId(lastAddedId);
      setTimeout(() => {
        setHighlightedId(null);
        setLastAddedId(null);
      }, 1000);
    }
  }, [lastAddedId]);

  const activeCards = deckViewMode === "sideboard"
    ? (activeDeck?.sideboard ?? [])
    : (activeDeck?.cards ?? []);

  const format = activeDeck?.format ?? "freeform";
  const rules = getFormatRules(format);

  // Commander identity computed from designated commander card
  const commanderCard = useMemo(() => {
    if (!activeDeck?.commanderId) return null;
    return activeDeck.cards.find((c) => c.id === activeDeck.commanderId) ?? null;
  }, [activeDeck]);

  const commanderIdentity = commanderCard?.color_identity;

  const sortedCards = useMemo(() => {
    if (!activeDeck) return [];
    let cards: DeckCard[];
    if (sortBy === "original") {
      cards = [...activeCards];
    } else {
      cards = [...activeCards];
      cards.sort((a, b) => {
        let cmp = 0;
        if (sortBy === "name") {
          cmp = a.name.localeCompare(b.name);
        } else if (sortBy === "color") {
          cmp = colorSortKey(a) - colorSortKey(b);
        } else if (sortBy === "mv") {
          cmp = (a.cmc ?? Infinity) - (b.cmc ?? Infinity);
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    // Commander pinning — always first in main view
    if (
      format === "commander" &&
      activeDeck.commanderId &&
      deckViewMode === "main"
    ) {
      const cmdIdx = cards.findIndex((c) => c.id === activeDeck.commanderId);
      if (cmdIdx > 0) {
        const [cmd] = cards.splice(cmdIdx, 1);
        cards.unshift(cmd);
      }
    }

    return cards;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDeck, sortBy, sortDir, deckViewMode]);

  // Build qty maps for combined copy-rule check (format-aware threshold)
  const otherPoolQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!activeDeck) return map;
    const otherPool = deckViewMode === "sideboard"
      ? activeDeck.cards
      : (activeDeck.sideboard ?? []);
    for (const card of otherPool) {
      map.set(card.name.toLowerCase(), card.quantity);
    }
    return map;
  }, [activeDeck, deckViewMode]);

  const sideboardCardCount = useMemo(() => {
    return activeDeck?.sideboard?.reduce((sum, c) => sum + c.quantity, 0) ?? 0;
  }, [activeDeck?.sideboard]);

  if (!isMounted || !activeDeck)
    return (
      <div className="p-8 text-neutral-500 text-sm italic">
        Initializing workspace...
      </div>
    );

  const groupCardsByType = (cards: DeckCard[]) => {
    const groups: Record<string, DeckCard[]> = {
      Creatures: [],
      Planeswalkers: [],
      "Instants/Sorceries": [],
      Artifacts: [],
      Enchantments: [],
      Lands: [],
      Other: [],
    };
    cards.forEach((card) => {
      const type = (card.type_line || "").toLowerCase();
      if (type.includes("creature")) groups["Creatures"].push(card);
      else if (type.includes("planeswalker")) groups["Planeswalkers"].push(card);
      else if (type.includes("instant") || type.includes("sorcery"))
        groups["Instants/Sorceries"].push(card);
      else if (type.includes("artifact")) groups["Artifacts"].push(card);
      else if (type.includes("enchantment")) groups["Enchantments"].push(card);
      else if (type.includes("land")) groups["Lands"].push(card);
      else groups["Other"].push(card);
    });
    return groups;
  };

  // Main deck card actions
  const updateQuantity = (cardId: string, delta: number) => {
    updateActiveDeck((deck) => ({
      ...deck,
      cards: deck.cards.map((c) =>
        c.id === cardId
          ? { ...c, quantity: Math.max(0, c.quantity + delta) }
          : c,
      ),
    }));
  };

  const setQuantity = (cardId: string, qty: number) => {
    updateActiveDeck((deck) => ({
      ...deck,
      cards: deck.cards.map((c) =>
        c.id === cardId ? { ...c, quantity: Math.max(0, qty) } : c,
      ),
    }));
  };

  const removeCard = (cardId: string) => {
    updateActiveDeck((deck) => ({
      ...deck,
      cards: deck.cards.filter((c) => c.id !== cardId),
    }));
  };

  // Sideboard card actions
  const updateSideboardQuantity = (cardId: string, delta: number) => {
    updateActiveDeck((deck) => ({
      ...deck,
      sideboard: deck.sideboard?.map((c) =>
        c.id === cardId
          ? { ...c, quantity: Math.max(0, c.quantity + delta) }
          : c,
      ),
    }));
  };

  const setSideboardQuantity = (cardId: string, qty: number) => {
    updateActiveDeck((deck) => ({
      ...deck,
      sideboard: deck.sideboard?.map((c) =>
        c.id === cardId ? { ...c, quantity: Math.max(0, qty) } : c,
      ),
    }));
  };

  const removeSideboardCard = (cardId: string) => {
    updateActiveDeck((deck) => ({
      ...deck,
      sideboard: deck.sideboard?.filter((c) => c.id !== cardId),
    }));
  };

  const updateSideboardOwnedQty = (cardId: string, qty: number) => {
    updateActiveDeck((deck) => ({
      ...deck,
      sideboard: deck.sideboard?.map((c) =>
        c.id === cardId ? { ...c, ownedQty: Math.max(0, qty) } : c,
      ),
    }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({
      x: e.clientX + 20,
      y: Math.min(e.clientY + 20, window.innerHeight - 370),
    });
  };

  // Toolbar format change handler (includes sideboard confirmation)
  const handleRequestFormatChange = (newFormat: DeckFormat) => {
    if (newFormat === "commander") {
      const sideboardCount = activeDeck.sideboard?.reduce((s, c) => s + c.quantity, 0) ?? 0;
      if (sideboardCount > 0) {
        setConfirmDialog({ deckId: activeDeck.id, sideboardCount, targetFormat: newFormat });
        return;
      } else if (activeDeck.sideboard !== undefined) {
        deleteSideboardForFormat(activeDeck.id);
      }
    }
    setDeckFormat(activeDeck.id, newFormat);
  };

  const isSideboard = deckViewMode === "sideboard";

  const cardActionProps = isSideboard
    ? {
        onUpdateQuantity: updateSideboardQuantity,
        onSetQuantity: setSideboardQuantity,
        onUpdateOwnedQty: updateSideboardOwnedQty,
        onRemove: removeSideboardCard,
        onSelect: setSelectedCard,
      }
    : {
        onUpdateQuantity: updateQuantity,
        onSetQuantity: setQuantity,
        onUpdateOwnedQty: updateOwnedQty,
        onRemove: removeCard,
        onSelect: setSelectedCard,
      };

  const listActionProps = {
    ...cardActionProps,
    onHoverStart: setHoveredCardList,
    onHoverEnd: () => setHoveredCardList(null),
    onMouseMove: handleMouseMove,
  };

  const commanderProps = {
    format,
    commanderId: activeDeck.commanderId,
    commanderIdentity,
    onSetCommander: setCommanderId,
  };

  const groupedCards = groupCardsByType(sortedCards);

  const isPinnedCommander = (card: DeckCard, index: number) =>
    format === "commander" &&
    activeDeck.commanderId &&
    card.id === activeDeck.commanderId &&
    index === 0 &&
    deckViewMode === "main";

  return (
    <div className="w-full h-full flex flex-col relative text-sm bg-neutral-900">
      <WorkspaceToolbar
        activeDeck={activeDeck}
        onUpdateDeckName={(name) => updateActiveDeck((d) => ({ ...d, name }))}
        totalCards={totalCards}
        totalValue={totalValue}
        remainingCost={remainingCost}
        hasPriceData={hasPriceData}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDir={sortDir}
        setSortDir={setSortDir}
        isGrouped={isGrouped}
        setIsGrouped={setIsGrouped}
        deckViewMode={deckViewMode}
        setDeckViewMode={setDeckViewMode}
        activeDeckHasSideboard={activeDeck.sideboard !== undefined}
        sideboardCardCount={sideboardCardCount}
        onOpenSampleHand={() => setIsSampleHandOpen(true)}
        onRequestFormatChange={handleRequestFormatChange}
      />

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 pb-20"
      >
        {isGrouped ? (
          <div className="space-y-10">
            {Object.entries(groupedCards).map(
              ([cat, cards]) =>
                cards.length > 0 && (
                  <div key={cat}>
                    <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 ml-1">
                      {cat} ({cards.reduce((s, c) => s + c.quantity, 0)})
                    </h3>
                    {viewMode === "visual" ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-7">
                        {cards.map((card) => (
                          <div
                            key={card.id}
                            ref={(el) => {
                              if (el) cardRefs.current.set(card.id, el);
                              else cardRefs.current.delete(card.id);
                            }}
                            className={`rounded-xl transition-all duration-300 ${highlightedId === card.id ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-neutral-950" : ""}`}
                          >
                            <VisualCard
                              card={card}
                              {...cardActionProps}
                              {...commanderProps}
                              extraQty={otherPoolQtyMap.get(card.name.toLowerCase()) ?? 0}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ListCardTable
                        cards={cards}
                        highlightedId={highlightedId}
                        cardRefs={cardRefs}
                        sideboardQtyMap={otherPoolQtyMap}
                        sortBy={sortBy}
                        isGrouped={isGrouped}
                        {...listActionProps}
                        {...commanderProps}
                      />
                    )}
                  </div>
                ),
            )}
          </div>
        ) : viewMode === "visual" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-7">
            {sortedCards.map((card, index) => (
              <React.Fragment key={card.id}>
                <div
                  ref={(el) => {
                    if (el) cardRefs.current.set(card.id, el);
                    else cardRefs.current.delete(card.id);
                  }}
                  className={`rounded-xl transition-all duration-300 ${highlightedId === card.id ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-neutral-950" : ""}`}
                >
                  <VisualCard
                    card={card}
                    {...cardActionProps}
                    {...commanderProps}
                    extraQty={otherPoolQtyMap.get(card.name.toLowerCase()) ?? 0}
                  />
                </div>
                {/* Divider after pinned commander */}
                {isPinnedCommander(card, index) && (
                  <div className="col-span-full border-b border-neutral-700/30 my-1" />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <ListCardTable
            cards={sortedCards}
            highlightedId={highlightedId}
            cardRefs={cardRefs}
            sideboardQtyMap={otherPoolQtyMap}
            sortBy={sortBy}
            isGrouped={isGrouped}
            {...listActionProps}
            {...commanderProps}
          />
        )}
      </div>

      <ImportModal
        pendingImport={pendingImport}
        activeDeckName={activeDeck.name}
        onProcess={processImport}
        onCancel={cancelImport}
      />

      {viewMode === "list" && hoveredCardList && showThumbnail && (
        <div
          className="fixed z-50 pointer-events-none w-56 rounded-xl overflow-hidden shadow-2xl border border-neutral-700"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        >
          <img
            src={
              hoveredCardList.image_uris?.normal ||
              hoveredCardList.card_faces?.[0]?.image_uris?.normal
            }
            className="w-full h-auto"
            alt={hoveredCardList.name}
          />
        </div>
      )}

      {selectedCard &&
        (() => {
          const currentIndex = sortedCards.findIndex(
            (c) => c.id === selectedCard.id,
          );
          const hasNext =
            currentIndex >= 0 && currentIndex < sortedCards.length - 1;
          const hasPrev = currentIndex > 0;

          return (
            <CardModal
              card={selectedCard}
              onClose={() => setSelectedCard(null)}
              onSwap={(oldId, newCard) => {
                if (isSideboard) {
                  updateActiveDeck((deck) => ({
                    ...deck,
                    sideboard: deck.sideboard?.map((c) =>
                      c.id === oldId
                        ? ({
                            ...newCard,
                            quantity: c.quantity,
                            ownedQty: c.ownedQty,
                          } as DeckCard)
                        : c,
                    ),
                  }));
                } else {
                  updateActiveDeck((deck) => ({
                    ...deck,
                    cards: deck.cards.map((c) =>
                      c.id === oldId
                        ? ({
                            ...newCard,
                            quantity: c.quantity,
                            ownedQty: c.ownedQty,
                          } as DeckCard)
                        : c,
                    ),
                  }));
                }
                setSelectedCard({
                  ...newCard,
                  quantity: (selectedCard as any).quantity,
                  ownedQty: (selectedCard as any).ownedQty,
                } as any);
              }}
              onNext={
                hasNext
                  ? () => setSelectedCard(sortedCards[currentIndex + 1])
                  : undefined
              }
              onPrev={
                hasPrev
                  ? () => setSelectedCard(sortedCards[currentIndex - 1])
                  : undefined
              }
            />
          );
        })()}

      {/* Goldfish Simulator always uses main deck only */}
      {isSampleHandOpen && (
        <SampleHandModal
          deck={activeDeck.cards}
          onClose={() => setIsSampleHandOpen(false)}
          format={format}
          commanderId={activeDeck.commanderId}
        />
      )}

      {/* Sideboard → Commander confirmation dialog (triggered from toolbar) */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setConfirmDialog(null)}
          onKeyDown={(e) => { if (e.key === "Escape") setConfirmDialog(null); }}
          tabIndex={-1}
        >
          <div
            className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-6 w-80 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                Commander decks don&apos;t use sideboards
              </h3>
              <p className="text-xs text-neutral-400">
                Your sideboard has {confirmDialog.sideboardCount}{" "}
                {confirmDialog.sideboardCount === 1 ? "card" : "cards"}. What would you
                like to do?
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  mergeSideboardIntoDeck(confirmDialog.deckId);
                  setDeckFormat(confirmDialog.deckId, "commander");
                  setConfirmDialog(null);
                }}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-yellow-600 hover:bg-yellow-500 text-white transition-colors"
              >
                Merge into Main Deck
              </button>
              <button
                onClick={() => {
                  deleteSideboardForFormat(confirmDialog.deckId);
                  setDeckFormat(confirmDialog.deckId, "commander");
                  setConfirmDialog(null);
                }}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition-colors"
              >
                Delete Sideboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

