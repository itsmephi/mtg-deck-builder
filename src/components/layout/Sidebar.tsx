'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Flame, Coins, Mountain, Swords, Hexagon, ChevronDown } from 'lucide-react';
import { searchCards } from '@/lib/scryfall';
import { ScryfallCard } from '@/types';
import { useDeckManager } from '@/hooks/useDeckManager';

const CATEGORIES = [
  { id: 'top', label: 'Top 50 Trending', query: 'f:commander order:edhrec', icon: Flame },
  { id: 'creatures', label: 'Top Creatures', query: 'f:commander t:creature order:edhrec', icon: Swords },
  { id: 'lands', label: 'Popular Lands', query: 'f:commander t:land order:edhrec', icon: Mountain },
  { id: 'artifacts', label: 'Top Artifacts', query: 'f:commander t:artifact order:edhrec', icon: Hexagon },
  { id: 'budget', label: 'Budget Staples (<$2)', query: 'f:commander usd<2 order:edhrec', icon: Coins },
];

export default function Sidebar() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Hover tracking states
  const [hoveredCard, setHoveredCard] = useState<ScryfallCard | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const { activeDeck, updateActiveDeck } = useDeckManager();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (query.trim() === '') {
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
      if (query.trim() !== '') {
        setIsSearching(true);
        const searchResults = await searchCards(query);
        setResults(searchResults);
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleAddCard = (card: ScryfallCard) => {
    if (!activeDeck) return;
    updateActiveDeck(deck => {
      const existing = deck.cards.find(c => c.id === card.id);
      if (existing) {
        return {
          ...deck,
          cards: deck.cards.map(c => 
            c.id === card.id ? { ...c, quantity: c.quantity + 1 } : c
          )
        };
      }
      return {
        ...deck,
        cards: [...deck.cards, { ...card, quantity: 1, isOwned: false }]
      };
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const cardWidth = 256; 
    const cardHeight = 358;
    const offsetX = 20;
    const offsetY = -150; // Offset adjusted to center the preview vertically to the mouse

    let x = e.clientX + offsetX;
    let y = e.clientY + offsetY;

    // Prevent clipping off the bottom or top of the window
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
        <div className="p-3 border-b border-neutral-800 space-y-3 relative" ref={dropdownRef}>
          <div className="relative z-20">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
                <span className="truncate">{query.trim() !== '' ? 'Search Results' : activeCategory.label}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl overflow-hidden py-1 z-50">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isActive = activeCategory.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat);
                        setQuery('');
                        setIsDropdownOpen(false);
                      }}
                      className={`flex items-center w-full text-left gap-2 px-3 py-2 text-xs transition-colors ${
                        isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
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
            {query.trim() === '' ? activeCategory.label : 'Results'}
          </h2>
          
          {isSearching ? (
            <div className="flex justify-center p-8">
              <div className="w-5 h-5 border-2 border-neutral-600 border-t-neutral-400 rounded-full animate-spin"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-xs text-neutral-500 text-center p-4">No cards found.</div>
          ) : (
            <ul className="space-y-0.5 relative" onMouseMove={handleMouseMove}>
              {results.map((card) => (
                <li 
                  key={card.id} 
                  onClick={() => handleAddCard(card)}
                  onMouseEnter={() => setHoveredCard(card)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="text-xs text-neutral-300 hover:text-white cursor-pointer truncate flex items-center justify-between group p-1.5 -mx-1.5 rounded hover:bg-neutral-800/50 transition-colors"
                >
                  <span className="truncate pr-2">{card.name}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded-[4px] text-[10px] shrink-0 font-bold">+</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Floating Dynamic Card Preview */}
      {hoveredCard && (hoveredCard.image_uris?.normal || hoveredCard.card_faces?.[0]?.image_uris?.normal) && (
        <div 
          className="hidden md:block fixed z-[100] pointer-events-none w-64 rounded-xl overflow-hidden shadow-2xl border border-neutral-700 animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`
          }}
        >
          <img 
            src={hoveredCard.image_uris?.normal || hoveredCard.card_faces?.[0]?.image_uris?.normal} 
            alt={hoveredCard.name} 
            className="w-full h-auto object-cover" 
          />
        </div>
      )}
    </>
  );
}