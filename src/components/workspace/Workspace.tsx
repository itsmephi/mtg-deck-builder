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
  ChevronDown,
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

  const [viewMode, setViewMode] = useState<"visual" | "list">("visual");
  const [isGrouped, setIsGrouped] = useState(false);
  const [sortMode, setSortMode] = useState<SortOption>("original");
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [isSampleHandOpen, setIsSampleHandOpen] = useState(false);
  const [isDeckDropdownOpen, setIsDeckDropdownOpen] = useState(false);
  const deckDropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        deckDropdownRef.current &&
        !deckDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDeckDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      .map(
        (c) =>
          `${c.quantity} ${c.name}${c.set ? ` [${c.set.toUpperCase()}]` : ""}`,
      )
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
    <div className="w-full h-full flex flex-col relative text-sm overflow-x-hidden">
      <div className="flex flex-col mb-4 pb-3 border-b border-neutral-800 gap-3">
        {/* Row 1: Deck Name */}
        <div className="flex items-center gap-2">
          <div
            className="relative flex items-center gap-2 min-w-0"
            ref={deckDropdownRef}
          >
            <button
              onClick={() => setIsDeckDropdownOpen(!isDeckDropdownOpen)}
              className="p-1 text-neutral-500 hover:text-white transition-colors shrink-0"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isDeckDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            <input
              value={activeDeck.name}
              onChange={(e) =>
                updateActiveDeck((d) => ({ ...d, name: e.target.value }))
              }
              size={Math.max(10, activeDeck.name.length)}
              className="text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-blue-500 focus:outline-none transition-all px-0 outline-none"
              placeholder="Enter deck name..."
            />
            {isDeckDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl overflow-hidden py-1 z-50">
                {decks.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setActiveDeckId(d.id);
                      setIsDeckDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full text-left px-3 py-2 text-xs transition-colors ${d.id === activeDeck.id ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"}`}
                  >
                    <span className="truncate">{d.name}</span>
                    {d.id === activeDeck.id && (
                      <span className="text-blue-400 text-[10px] font-bold ml-2">
                        ACTIVE
                      </span>
                    )}
                  </button>
                ))}
                <div className="border-t border-neutral-800 mt-1 pt-1">
                  <button
                    onClick={() => {
                      createNewDeck();
                      setIsDeckDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-colors"
                  >
                    <Plus className="w-3 h-3" /> New Deck
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteActiveDeck();
                      setIsDeckDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete Current Deck
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Stats */}
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <p className={totalCards >= 60 ? "text-yellow-400 font-bold" : ""}>
            {totalCards} Cards
          </p>
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

        {/* Row 3: Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-3 h-8">
            <div className="group relative h-full flex items-center justify-center">
              <button
                onClick={() => setIsSampleHandOpen(true)}
                className="flex items-center gap-2 h-full px-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <Dices className="w-4 h-4" />{" "}
                <span className="whitespace-nowrap">Test Deck</span>
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
      </div>

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
