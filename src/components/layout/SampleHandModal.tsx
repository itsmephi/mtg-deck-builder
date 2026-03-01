'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, RefreshCw, PlusCircle, AlertCircle, BarChart3, HelpCircle } from 'lucide-react';
import { DeckCard } from '@/types';

interface SampleHandModalProps {
  deck: DeckCard[];
  onClose: () => void;
}

export default function SampleHandModal({ deck, onClose }: SampleHandModalProps) {
  const [hand, setHand] = useState<DeckCard[]>([]);
  const [library, setLibrary] = useState<DeckCard[]>([]);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  const shuffleAndDraw = () => {
    const pool: DeckCard[] = [];
    deck.forEach(card => {
      for (let i = 0; i < card.quantity; i++) {
        pool.push(card);
      }
    });

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    setHand(pool.slice(0, 7));
    setLibrary(pool.slice(7));
  };

  const drawCard = () => {
    if (library.length === 0) return;
    const nextCard = library[0];
    setHand(prev => [...prev, nextCard]);
    setLibrary(prev => prev.slice(1));
  };

  const stats = useMemo(() => {
    const handLands = hand.filter(c => c.type_line.toLowerCase().includes('land')).length;
    const libraryLands = library.filter(c => c.type_line.toLowerCase().includes('land')).length;
    const drawLandProb = library.length > 0 ? (libraryLands / library.length) * 100 : 0;
    
    // Safety check for CMC property
    const totalCMCValue = hand.reduce((acc, card: any) => acc + (card.cmc || 0), 0);
    const avgCMC = totalCMCValue / (hand.length || 1);

    return { handLands, drawLandProb, avgCMC };
  }, [hand, library]);

  useEffect(() => {
    if (hand.length > 7) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [hand.length]);

  useEffect(() => {
    shuffleAndDraw();
  }, [deck]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 md:p-10 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div className="w-full max-w-[1600px] h-full flex flex-col bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 p-4 md:p-6 bg-neutral-950 z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg hidden sm:block">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white">Simulation: Goldfish</h2>
              <p className="text-neutral-500 text-[10px] md:text-xs uppercase tracking-widest font-bold">
                Library: {library.length} | Hand: {hand.length}
              </p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3">
            <button onClick={drawCard} disabled={library.length === 0} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 border border-blue-500 rounded-lg text-xs md:text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-30 transition-all">
              <PlusCircle className="w-4 h-4" /> Draw
            </button>
            <button onClick={shuffleAndDraw} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-xs md:text-sm font-bold text-white hover:bg-neutral-700 transition-colors">
              <RefreshCw className="w-4 h-4" /> Mulligan
            </button>
            <button onClick={onClose} className="p-2 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 hover:text-white transition-all hover:bg-neutral-800 shadow-sm">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Stats Header (Mobile/Tablet) / Sidebar (Desktop) */}
          <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-neutral-800 bg-neutral-950 p-4 lg:p-6 flex flex-row lg:flex-col gap-6 lg:gap-8 overflow-x-auto shrink-0 custom-scrollbar">
            <section className="shrink-0 lg:shrink">
              <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 lg:mb-4">Current Hand</h4>
              <div className="flex lg:flex-col gap-4 lg:space-y-4">
                <div className="flex items-center lg:justify-between gap-2 lg:gap-0">
                  <span className="text-xs lg:text-sm text-neutral-400">Lands</span>
                  <span className="text-xs lg:text-sm font-bold text-white">{stats.handLands}</span>
                </div>
                <div className="flex items-center lg:justify-between gap-2 lg:gap-0">
                  <span className="text-xs lg:text-sm text-neutral-400">Avg. CMC</span>
                  <span className="text-xs lg:text-sm font-bold text-white">{stats.avgCMC.toFixed(1)}</span>
                </div>
              </div>
            </section>

            <section className="shrink-0 lg:shrink">
              <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 lg:mb-4">Probability</h4>
              <div className="p-2 lg:p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg lg:rounded-xl flex items-center lg:block gap-3">
                <p className="text-[9px] lg:text-[10px] text-blue-400 font-bold uppercase lg:mb-1">Draw Land</p>
                <p className="text-lg lg:text-2xl font-bold text-white">{stats.drawLandProb.toFixed(1)}%</p>
              </div>
            </section>
          </div>

          {/* Card Grid Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-neutral-900 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 md:gap-5 pb-20 justify-items-center max-w-full mx-auto">
              {hand.map((card, i) => (
                <div 
                  key={`${card.id}-${i}`} 
                  className="w-full max-w-[180px] animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" 
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <img 
                    src={card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal} 
                    className="w-full rounded-lg shadow-xl border border-neutral-800 hover:scale-105 hover:border-blue-500/50 transition-all cursor-pointer" 
                    alt={card.name} 
                  />
                  <p className="mt-2 text-[9px] text-neutral-500 font-bold truncate text-center uppercase tracking-tight">
                    {card.name}
                  </p>
                </div>
              ))}
              <div ref={scrollEndRef} className="col-span-full h-1 w-full" />
              
              {library.length === 0 && (
                <div className="col-span-full mt-10 flex flex-col items-center justify-center p-12 border border-dashed border-neutral-800 rounded-2xl bg-neutral-950/30 w-full max-w-2xl mx-auto">
                  <AlertCircle className="w-10 h-10 text-neutral-700 mb-3" />
                  <p className="text-neutral-500 font-medium text-sm">Library depleted.</p>
                  <button onClick={shuffleAndDraw} className="mt-4 px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">Reshuffle</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}