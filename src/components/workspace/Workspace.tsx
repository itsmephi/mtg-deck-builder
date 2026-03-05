"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useDeckManager } from "@/hooks/useDeckManager";
import { useDeckImportExport } from "@/hooks/useDeckImportExport";
import { useDeckStats } from "@/hooks/useDeckStats";

import CardModal from "../layout/CardModal";
import SampleHandModal from "../layout/SampleHandModal";
import VisualCard from "./VisualCard";
import ListCardTable from "./ListCardTable";
import ImportModal from "./ImportModal";
import WorkspaceToolbar from "./WorkspaceToolbar";
import { ScryfallCard, DeckCard } from "@/types";

type SortOption = "original" | "name-asc" | "name-desc";

export default function Workspace() {
  const {
    decks,
    activeDeck,
    setActiveDeckId,
    updateActiveDeck,
    updateOwnedQty,
    createNewDeck,
    deleteDeck,
    isMounted,
    showThumbnail,
    lastAddedId,
    setLastAddedId,
  } = useDeckManager();
  const {
    isImporting,
    pendingImport,
    exportDeck,
    handleImportFile,
    processImport,
    cancelImport,
  } = useDeckImportExport();
  const { totalCards, totalValue, remainingCost, hasPriceData, buyOnTCGPlayer, buyOnCardKingdom } =
    useDeckStats(activeDeck ?? null);

  const [viewMode, setViewMode] = useState<"visual" | "list">("visual");
  const [isGrouped, setIsGrouped] = useState(false);
  const [sortMode, setSortMode] = useState<SortOption>("original");
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [isSampleHandOpen, setIsSampleHandOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [hoveredCardList, setHoveredCardList] = useState<ScryfallCard | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isMounted && !activeDeck) {
      if (decks.length === 0) createNewDeck();
      else setActiveDeckId(decks[0].id);
    }
  }, [isMounted, activeDeck, decks, createNewDeck, setActiveDeckId]);

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

  const sortedCards = useMemo(() => {
    if (!activeDeck) return [];
    const cards = [...activeDeck.cards];
    if (sortMode === "name-asc")
      return cards.sort((a, b) => a.name.localeCompare(b.name));
    if (sortMode === "name-desc")
      return cards.sort((a, b) => b.name.localeCompare(a.name));
    return cards;
  }, [activeDeck, sortMode]);

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


  const removeCard = (cardId: string) => {
    updateActiveDeck((deck) => ({
      ...deck,
      cards: deck.cards.filter((c) => c.id !== cardId),
    }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({
      x: e.clientX + 20,
      y: Math.min(e.clientY + 20, window.innerHeight - 370),
    });
  };

  const groupedCards = groupCardsByType(sortedCards);

  const cardActionProps = {
    onUpdateQuantity: updateQuantity,
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

  return (
    <div className="w-full h-full flex flex-col relative text-sm overflow-x-hidden">
      <WorkspaceToolbar
        activeDeck={activeDeck}
        decks={decks}
        setActiveDeckId={setActiveDeckId}
        createNewDeck={createNewDeck}
        onDeleteDeck={() => deleteDeck(activeDeck.id)}
        onUpdateDeckName={(name) => updateActiveDeck((d) => ({ ...d, name }))}
        totalCards={totalCards}
        totalValue={totalValue}
        remainingCost={remainingCost}
        hasPriceData={hasPriceData}
        buyOnTCGPlayer={buyOnTCGPlayer}
        buyOnCardKingdom={buyOnCardKingdom}
        exportDeck={exportDeck}
        handleImportFile={handleImportFile}
        isImporting={isImporting}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortMode={sortMode}
        setSortMode={setSortMode}
        isGrouped={isGrouped}
        setIsGrouped={setIsGrouped}
        onOpenSampleHand={() => setIsSampleHandOpen(true)}
      />

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden pr-1 pb-20"
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {cards.map((card) => (
                          <div
                            key={card.id}
                            ref={(el) => {
                              if (el) cardRefs.current.set(card.id, el);
                              else cardRefs.current.delete(card.id);
                            }}
                            className={`rounded-xl transition-all duration-300 ${highlightedId === card.id ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-neutral-950" : ""}`}
                          >
                            <VisualCard card={card} {...cardActionProps} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ListCardTable
                        cards={cards}
                        highlightedId={highlightedId}
                        cardRefs={cardRefs}
                        {...listActionProps}
                      />
                    )}
                  </div>
                ),
            )}
          </div>
        ) : viewMode === "visual" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {sortedCards.map((card) => (
              <div
                key={card.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(card.id, el);
                  else cardRefs.current.delete(card.id);
                }}
                className={`rounded-xl transition-all duration-300 ${highlightedId === card.id ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-neutral-950" : ""}`}
              >
                <VisualCard key={card.id} card={card} {...cardActionProps} />
              </div>
            ))}
          </div>
        ) : (
          <ListCardTable
            cards={sortedCards}
            highlightedId={highlightedId}
            cardRefs={cardRefs}
            {...listActionProps}
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

      {isSampleHandOpen && (
        <SampleHandModal
          deck={activeDeck.cards}
          onClose={() => setIsSampleHandOpen(false)}
        />
      )}
    </div>
  );
}
