"use client";

import { APP_VERSION, CURRENT_CHANGELOG } from "@/config/version";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Flame,
  Coins,
  Mountain,
  Swords,
  Hexagon,
  ChevronDown,
  Coffee,
  Github,
  Settings,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { searchCards } from "@/lib/scryfall";
import { ScryfallCard } from "@/types";
import { useDeckManager, SortBy, SortDir } from "@/hooks/useDeckManager";

const CATEGORIES = [
  {
    id: "top",
    label: "Top 50 Trending",
    query: "f:commander order:edhrec",
    icon: Flame,
  },
  {
    id: "creatures",
    label: "Top Creatures",
    query: "f:commander t:creature order:edhrec",
    icon: Swords,
  },
  {
    id: "lands",
    label: "Popular Lands",
    query: "f:commander t:land order:edhrec",
    icon: Mountain,
  },
  {
    id: "artifacts",
    label: "Top Artifacts",
    query: "f:commander t:artifact order:edhrec",
    icon: Hexagon,
  },
  {
    id: "budget",
    label: "Budget Staples (<$2)",
    query: "f:commander usd<2 order:edhrec",
    icon: Coins,
  },
];

export default function Sidebar() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Hover tracking states
  const [hoveredCard, setHoveredCard] = useState<ScryfallCard | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const {
    activeDeck,
    updateActiveDeck,
    showThumbnail,
    setShowThumbnail,
    setLastAddedId,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    deckViewMode,
  } = useDeckManager();
  const [isFooterOpen, setIsFooterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
        setResults(data.slice(0, 50));
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

  const handleAddCard = async (card: ScryfallCard) => {
    if (!activeDeck) return;

    // Rescue $0.00 or missing price before adding
    let cardToAdd = card;
    if (!card.prices.usd || card.prices.usd === "0.00") {
      const results = await searchCards(`!"${card.name}"`);
      if (
        results.length > 0 &&
        results[0].prices.usd &&
        results[0].prices.usd !== "0.00"
      ) {
        cardToAdd = { ...results[0], id: card.id }; // keep original id for dedup
      }
    }

    if (deckViewMode === "sideboard") {
      // Add to sideboard (only if sideboard is enabled)
      updateActiveDeck((deck) => {
        if (deck.sideboard === undefined) return deck;
        const existing = deck.sideboard.find((c) => c.id === cardToAdd.id);
        if (existing) {
          return {
            ...deck,
            sideboard: deck.sideboard.map((c) =>
              c.id === cardToAdd.id ? { ...c, quantity: c.quantity + 1 } : c,
            ),
          };
        }
        return {
          ...deck,
          sideboard: [...deck.sideboard, { ...cardToAdd, quantity: 1, ownedQty: 0 }],
        };
      });
    } else {
      // Add to main deck
      updateActiveDeck((deck) => {
        const existing = deck.cards.find((c) => c.id === cardToAdd.id);
        if (existing) {
          return {
            ...deck,
            cards: deck.cards.map((c) =>
              c.id === cardToAdd.id ? { ...c, quantity: c.quantity + 1 } : c,
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

    if (y + cardHeight > window.innerHeight) {
      y = window.innerHeight - cardHeight - 10;
    }
    if (y < 10) y = 10;

    setMousePos({ x, y });
  };

  const ActiveIcon = activeCategory.icon;

  return (
    <>
      <div className="flex flex-col h-full bg-neutral-900 border-r border-neutral-800 relative z-40">
        <div
          className="p-3 border-b border-neutral-800 space-y-3 relative"
          ref={dropdownRef}
        >
          <div className="relative z-20">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            />
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
              <div className="w-5 h-5 border-2 border-neutral-600 border-t-neutral-400 rounded-full animate-spin"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-xs text-neutral-500 text-center p-4">
              No cards found.
            </div>
          ) : (
            <ul className="space-y-0 relative" onMouseMove={handleMouseMove}>
              {results.map((card) => (
                <li
                  key={card.id}
                  onClick={() => handleAddCard(card)}
                  onMouseEnter={() => setHoveredCard(card)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="text-xs text-neutral-300 hover:text-white cursor-pointer truncate flex items-center justify-between group p-1.5 -mx-1.5 rounded hover:bg-neutral-800/50 transition-colors"
                >
                  <span className="truncate pr-2">{card.name}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded-[4px] text-[10px] shrink-0 font-bold">
                    +
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* FOOTER SECTION */}
        <div className="mt-auto border-t border-neutral-800 bg-neutral-900/50">
          {/* Always-visible collapsed bar */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              {/* Version badge - click for changelog */}
              <button
                onClick={() => alert(`v${APP_VERSION}: ${CURRENT_CHANGELOG}`)}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-bold text-blue-400 uppercase tracking-wider hover:bg-blue-500/20 transition-colors"
              >
                v{APP_VERSION}
              </button>
              {/* Coffee icon */}
              <a
                href="https://www.buymeacoffee.com/itsmephi"
                target="_blank"
                rel="noopener noreferrer"
                title="Support our Project"
                className="p-1 text-neutral-500 hover:text-yellow-400 transition-colors"
              >
                <Coffee className="w-3.5 h-3.5" />
              </a>
              {/* GitHub icon */}
              <a
                href="https://github.com/itsmephi/mtg-deck-builder"
                target="_blank"
                rel="noopener noreferrer"
                title="View on GitHub"
                className="p-1 text-neutral-500 hover:text-white transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            </div>
            {/* Right side: settings + expand toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setIsFooterOpen(false);
                }}
                className={`p-1 rounded transition-colors ${isSettingsOpen ? "text-white" : "text-neutral-600 hover:text-neutral-300"}`}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsFooterOpen(!isFooterOpen);
                  setIsSettingsOpen(false);
                }}
                className="p-1 text-neutral-600 hover:text-neutral-300 transition-colors"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isFooterOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {isSettingsOpen && (
            <div className="px-4 pb-3 pt-1 border-t border-neutral-800/50">
              <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-3">
                Settings
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Card Preview</span>
                <button
                  onClick={() => setShowThumbnail(!showThumbnail)}
                  className={`relative w-8 h-4 rounded-full transition-colors ${showThumbnail ? "bg-blue-500" : "bg-neutral-700"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${showThumbnail ? "translate-x-4" : "translate-x-0"}`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-neutral-400">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                >
                  <option value="original">Original</option>
                  <option value="name">Name</option>
                  <option value="color">Color</option>
                  <option value="mv">Mana Value</option>
                </select>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-neutral-400">Direction</span>
                <button
                  onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
                  disabled={sortBy === "original"}
                  className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded border transition-colors ${sortBy === "original" ? "text-neutral-600 border-neutral-800 cursor-not-allowed" : "text-neutral-300 border-neutral-700 hover:text-white hover:border-neutral-500"}`}
                >
                  {sortDir === "asc" ? (
                    <><ArrowUp className="w-3 h-3" /> Asc</>
                  ) : (
                    <><ArrowDown className="w-3 h-3" /> Desc</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Expandable content */}
          {isFooterOpen && (
            <div className="flex flex-col gap-3 px-4 pb-4">
              <a
                href="https://www.buymeacoffee.com/itsmephi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-[#FFDD00] hover:bg-[#FFEA00] text-black rounded-lg text-[10px] font-bold transition-all shadow-sm active:scale-95"
              >
                <Coffee className="w-3 h-3" />
                Support our Project
              </a>
              <p className="text-[8px] text-neutral-700 leading-relaxed">
                MTG Deck Builder is unofficial Fan Content permitted under the
                Fan Content Policy. Not approved/endorsed by Wizards. Portions
                of the materials used are property of Wizards of the Coast.
                ©Wizards of the Coast LLC.
              </p>
              <p className="text-[9px] text-neutral-600 font-medium">
                Phi &amp; Thurgood © 2026
              </p>
            </div>
          )}
        </div>
      </div>

      {hoveredCard &&
        showThumbnail &&
        (hoveredCard.image_uris?.normal ||
          hoveredCard.card_faces?.[0]?.image_uris?.normal) && (
          <div
            className="hidden md:block fixed z-[100] pointer-events-none w-64 rounded-xl overflow-hidden shadow-2xl border border-neutral-700 animate-in fade-in zoom-in-95 duration-200"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
            }}
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
