"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Flame,
  Coins,
  Mountain,
  Swords,
  Hexagon,
  ChevronDown,
  X,
} from "lucide-react";
import { searchCards } from "@/lib/scryfall";
import { ScryfallCard } from "@/types";
import { useDeckManager } from "@/hooks/useDeckManager";

const CATEGORIES = [
  { id: "top", label: "Top 50 Trending", query: "f:commander order:edhrec", icon: Flame },
  { id: "creatures", label: "Top Creatures", query: "f:commander t:creature order:edhrec", icon: Swords },
  { id: "lands", label: "Popular Lands", query: "f:commander t:land order:edhrec", icon: Mountain },
  { id: "artifacts", label: "Top Artifacts", query: "f:commander t:artifact order:edhrec", icon: Hexagon },
  { id: "budget", label: "Budget Staples (<$2)", query: "f:commander usd<2 order:edhrec", icon: Coins },
];

function ManaSymbols({ manaCost }: { manaCost?: string }) {
  if (!manaCost) return null;
  const symbols = manaCost.match(/\{[^}]+\}/g);
  if (!symbols || symbols.length === 0) return null;
  return (
    <span className="flex items-center gap-0.5 shrink-0">
      {symbols.map((s, i) => (
        <img
          key={i}
          src={`https://svgs.scryfall.io/card-symbols/${s.replace(/\{|\}/g, "").replace(/\//g, "")}.svg`}
          className="w-3.5 h-3.5"
          alt={s}
        />
      ))}
    </span>
  );
}

export default function SidebarSearchTab() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<ScryfallCard | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const cachedCategoryResults = useRef<ScryfallCard[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    activeDeck,
    updateActiveDeck,
    showThumbnail,
    setLastAddedId,
    deckViewMode,
  } = useDeckManager();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadCategory() {
      if (query.trim() === "") {
        setIsSearching(true);
        const data = await searchCards(activeCategory.query);
        const sliced = data.slice(0, 50);
        setResults(sliced);
        cachedCategoryResults.current = sliced;
        setIsSearching(false);
      }
    }
    loadCategory();
  }, [query, activeCategory]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim() !== "") {
        setIsSearching(true);
        const searchResults = await searchCards(query);
        setResults(searchResults);
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleClearQuery = () => {
    setQuery("");
    setResults(cachedCategoryResults.current);
  };

  const handleAddCard = async (card: ScryfallCard) => {
    if (!activeDeck) return;

    let cardToAdd = card;
    if (!card.prices.usd || card.prices.usd === "0.00") {
      const rescueResults = await searchCards(`!"${card.name}"`);
      if (
        rescueResults.length > 0 &&
        rescueResults[0].prices.usd &&
        rescueResults[0].prices.usd !== "0.00"
      ) {
        cardToAdd = { ...rescueResults[0], id: card.id };
      }
    }

    if (deckViewMode === "sideboard") {
      updateActiveDeck((deck) => {
        if (deck.sideboard === undefined) return deck;
        const existing = deck.sideboard.find((c) => c.id === cardToAdd.id);
        if (existing) {
          return {
            ...deck,
            sideboard: deck.sideboard.map((c) =>
              c.id === cardToAdd.id ? { ...c, quantity: c.quantity + 1 } : c
            ),
          };
        }
        return {
          ...deck,
          sideboard: [...deck.sideboard, { ...cardToAdd, quantity: 1, ownedQty: 0 }],
        };
      });
    } else {
      updateActiveDeck((deck) => {
        const existing = deck.cards.find((c) => c.id === cardToAdd.id);
        if (existing) {
          return {
            ...deck,
            cards: deck.cards.map((c) =>
              c.id === cardToAdd.id ? { ...c, quantity: c.quantity + 1 } : c
            ),
          };
        }
        return {
          ...deck,
          cards: [...deck.cards, { ...cardToAdd, quantity: 1, ownedQty: 0 }],
        };
      });
    }
    setLastAddedId(cardToAdd.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const cardHeight = 358;
    const offsetX = 20;
    const offsetY = -150;
    let x = e.clientX + offsetX;
    let y = e.clientY + offsetY;
    if (y + cardHeight > window.innerHeight) y = window.innerHeight - cardHeight - 10;
    if (y < 10) y = 10;
    setMousePos({ x, y });
  };

  const ActiveIcon = activeCategory.icon;

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="p-3 border-b border-neutral-800 space-y-3 relative" ref={dropdownRef}>
          <div className="relative z-20">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="w-full pl-9 pr-8 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            />
            {query && (
              <button
                onClick={handleClearQuery}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="relative z-10">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full px-3 py-1.5 bg-neutral-950/50 border border-neutral-800/80 rounded-lg text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <ActiveIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">
                  {query.trim() !== "" ? "Results" : activeCategory.label}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-500 transition-transform shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl overflow-hidden py-1 z-50">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat);
                        setQuery("");
                        setIsDropdownOpen(false);
                      }}
                      className={`flex items-center w-full text-left gap-2 px-3 py-2 text-xs transition-colors ${
                        isActive
                          ? "bg-neutral-800 text-white"
                          : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-neutral-500"}`}
                      />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">
            {query.trim() === "" ? activeCategory.label : "Results"}
          </h2>

          {isSearching ? (
            <div className="flex justify-center p-8">
              <div className="w-5 h-5 border-2 border-neutral-600 border-t-neutral-400 rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-xs text-neutral-500 text-center p-4">No cards found.</div>
          ) : (
            <ul className="space-y-0 relative" onMouseMove={handleMouseMove}>
              {results.map((card) => (
                <li
                  key={card.id}
                  onClick={() => handleAddCard(card)}
                  onMouseEnter={() => setHoveredCard(card)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="text-xs text-neutral-300 hover:text-white cursor-pointer flex items-center justify-between group p-1.5 -mx-1.5 rounded hover:bg-neutral-800/50 transition-colors"
                >
                  <span className="truncate pr-2">{card.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <ManaSymbols manaCost={card.mana_cost || card.card_faces?.[0]?.mana_cost} />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddCard(card); }}
                      className="w-5 h-5 rounded-full bg-neutral-800 opacity-0 group-hover:opacity-100 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {hoveredCard &&
        showThumbnail &&
        (hoveredCard.image_uris?.normal || hoveredCard.card_faces?.[0]?.image_uris?.normal) && (
          <div
            className="hidden md:block fixed z-[100] pointer-events-none w-64 rounded-xl overflow-hidden shadow-2xl border border-neutral-700 animate-in fade-in zoom-in-95 duration-200"
            style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
          >
            <img
              src={
                hoveredCard.image_uris?.normal ||
                hoveredCard.card_faces?.[0]?.image_uris?.normal
              }
              alt={hoveredCard.name}
              className="w-full h-auto object-cover"
            />
          </div>
        )}
    </>
  );
}
