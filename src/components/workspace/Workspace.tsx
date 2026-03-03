"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useDeckManager } from "@/hooks/useDeckManager";
import { useDeckImportExport } from "@/hooks/useDeckImportExport";
import {
  LayoutGrid,
  List,
  Plus,
  Trash2,
  Layout,
  ArrowUpDown,
  Dices,
  Download,
  Upload,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";

import CardModal from "../layout/CardModal";
import SampleHandModal from "../layout/SampleHandModal";
import VisualCard from "./VisualCard";
import ListCardTable from "./ListCardTable";
import ImportModal from "./ImportModal";
import { ScryfallCard, DeckCard } from "@/types";

type SortOption = "original" | "name-asc" | "name-desc";

export default function Workspace() {
  const {
    decks,
    activeDeck,
    setActiveDeckId,
    updateActiveDeck,
    createNewDeck,
    deleteDeck,
    isMounted,
  } = useDeckManager();
  const {
    isImporting,
    pendingImport,
    exportDeck,
    handleImportFile,
    processImport,
    cancelImport,
  } = useDeckImportExport();

  const [viewMode, setViewMode] = useState<"visual" | "list">("visual");
  const [isGrouped, setIsGrouped] = useState(false);
  const [sortMode, setSortMode] = useState<SortOption>("original");
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [isSampleHandOpen, setIsSampleHandOpen] = useState(false);
  const [hoveredCardList, setHoveredCardList] = useState<ScryfallCard | null>(
    null,
  );
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMounted && !activeDeck) {
      if (decks.length === 0) createNewDeck();
      else setActiveDeckId(decks[0].id);
    }
  }, [isMounted, activeDeck, decks, createNewDeck, setActiveDeckId]);

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

  const handleDeleteActiveDeck = () => deleteDeck(activeDeck.id);

  const buyOnTCGPlayer = () => {
    const list = activeDeck.cards
      .map((c) => `${c.quantity} ${c.name}`)
      .join("||");
    window.open(
      `https://www.tcgplayer.com/massentry?c=${encodeURIComponent(list)}`,
      "_blank",
    );
  };

  const buyOnCardKingdom = () => {
    const list = activeDeck.cards
      .map((c) => `${c.quantity} ${c.name}`)
      .join("\n");
    window.open(
      `https://www.cardkingdom.com/builder?main_deck=${encodeURIComponent(list)}`,
      "_blank",
    );
  };

  const totalCards = activeDeck.cards.reduce(
    (sum, card) => sum + card.quantity,
    0,
  );
  const totalValue = activeDeck.cards.reduce(
    (sum, card) => sum + parseFloat(card.prices.usd || "0") * card.quantity,
    0,
  );
  const remainingCost = activeDeck.cards.reduce(
    (sum, card) =>
      card.isOwned
        ? sum
        : sum + parseFloat(card.prices.usd || "0") * card.quantity,
    0,
  );
  const hasPriceData = activeDeck.cards.some(
    (card) => card.prices.usd !== null,
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
      else if (type.includes("planeswalker"))
        groups["Planeswalkers"].push(card);
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

  const toggleOwned = (cardId: string) => {
    updateActiveDeck((deck) => ({
      ...deck,
      cards: deck.cards.map((c) =>
        c.id === cardId ? { ...c, isOwned: !c.isOwned } : c,
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
    onToggleOwned: toggleOwned,
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
    <div className="w-full h-full flex flex-col relative text-sm">
      <div className="flex flex-col mb-4 pb-3 border-b border-neutral-800 gap-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <select
                  value={activeDeck.id}
                  onChange={(e) => setActiveDeckId(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 text-xs rounded-lg px-2 py-1 text-neutral-300 focus:outline-none focus:border-neutral-700"
                >
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={createNewDeck}
                  title="New Deck"
                  className="p-1 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400 hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDeleteActiveDeck}
                  title="Delete Deck"
                  className="p-1 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                value={activeDeck.name}
                onChange={(e) =>
                  updateActiveDeck((d) => ({ ...d, name: e.target.value }))
                }
                className="text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-blue-500 focus:outline-none transition-all px-0 w-auto flex-1 max-w-sm"
                placeholder="Enter deck name..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
                <div className="group relative flex items-center justify-center">
                  <button
                    onClick={exportDeck}
                    className="p-1 text-neutral-400 hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Export List
                  </span>
                </div>

                <div className="group relative flex items-center justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="p-1 text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {isImporting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Import List
                  </span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleImportFile(e, fileInputRef)}
                  className="hidden"
                  accept=".txt"
                />
              </div>

              <div className="group relative flex items-center justify-center">
                <button
                  onClick={buyOnTCGPlayer}
                  className="flex items-center gap-2 px-3 py-1.5 bg-orange-600/10 border border-orange-600/30 rounded-lg text-xs font-bold text-orange-400 hover:bg-orange-600/20 transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> TCGPlayer
                </button>
                <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Shop TCGPlayer
                </span>
              </div>

              <div className="group relative flex items-center justify-center">
                <button
                  onClick={buyOnCardKingdom}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-600/30 rounded-lg text-xs font-bold text-blue-400 hover:bg-blue-600/20 transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Card Kingdom
                </button>
                <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Shop Card Kingdom
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0 ml-auto h-8">
            <div className="group relative h-full flex items-center justify-center">
              <button
                onClick={() => setIsSampleHandOpen(true)}
                className="flex items-center gap-2 h-full px-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <Dices className="w-4 h-4" /> Test Deck
              </button>
              <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Simulate opening hand
              </span>
            </div>

            <div className="flex items-center h-full bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 space-x-0.5 shadow-sm">
              <div className="flex items-center px-2 border-r border-neutral-800 h-full">
                <ArrowUpDown className="w-3 h-3 text-neutral-500 mr-2" />
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortOption)}
                  className="bg-transparent text-xs text-neutral-300 focus:outline-none cursor-pointer h-full"
                >
                  <option value="original" className="bg-neutral-900">
                    Original
                  </option>
                  <option value="name-asc" className="bg-neutral-900">
                    Name (A-Z)
                  </option>
                  <option value="name-desc" className="bg-neutral-900">
                    Name (Z-A)
                  </option>
                </select>
              </div>

              <div className="group relative h-full flex items-center justify-center">
                <button
                  onClick={() => setIsGrouped(!isGrouped)}
                  className={`h-full px-2 flex items-center justify-center rounded-md transition-all ${isGrouped ? "bg-neutral-800 text-white border border-neutral-700/50" : "text-neutral-500 hover:text-neutral-300 border border-transparent"}`}
                >
                  <Layout className="w-3.5 h-3.5" />
                </button>
                <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Toggle Type Groups
                </span>
              </div>

              <div className="group relative h-full flex items-center justify-center">
                <button
                  onClick={() => setViewMode("visual")}
                  className={`h-full px-2 flex items-center justify-center rounded-md transition-all ${viewMode === "visual" ? "bg-neutral-800 text-white border border-neutral-700/50" : "text-neutral-500 hover:text-neutral-300 border border-transparent"}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Grid View
                </span>
              </div>

              <div className="group relative h-full flex items-center justify-center">
                <button
                  onClick={() => setViewMode("list")}
                  className={`h-full px-2 flex items-center justify-center rounded-md transition-all ${viewMode === "list" ? "bg-neutral-800 text-white border border-neutral-700/50" : "text-neutral-500 hover:text-neutral-300 border border-transparent"}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <span className="absolute top-full mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  List View
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-neutral-400 px-1 mt-1">
          <p>{totalCards} Cards</p>
          <p>
            Value:{" "}
            <span className="text-neutral-200 font-medium">
              {hasPriceData ? `$${totalValue.toFixed(2)}` : "N/A"}
            </span>
          </p>
          <p>
            To Buy:{" "}
            <span className="text-green-500 font-medium">
              {hasPriceData ? `$${remainingCost.toFixed(2)}` : "N/A"}
            </span>
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 pb-20">
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
                          <VisualCard
                            key={card.id}
                            card={card}
                            {...cardActionProps}
                          />
                        ))}
                      </div>
                    ) : (
                      <ListCardTable cards={cards} {...listActionProps} />
                    )}
                  </div>
                ),
            )}
          </div>
        ) : viewMode === "visual" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {sortedCards.map((card) => (
              <VisualCard key={card.id} card={card} {...cardActionProps} />
            ))}
          </div>
        ) : (
          <ListCardTable cards={sortedCards} {...listActionProps} />
        )}
      </div>

      <ImportModal
        pendingImport={pendingImport}
        activeDeckName={activeDeck.name}
        onProcess={processImport}
        onCancel={cancelImport}
      />

      {viewMode === "list" && hoveredCardList && (
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
                          isOwned: c.isOwned,
                        } as DeckCard)
                      : c,
                  ),
                }));
                setSelectedCard({
                  ...newCard,
                  quantity: (selectedCard as any).quantity,
                  isOwned: (selectedCard as any).isOwned,
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
