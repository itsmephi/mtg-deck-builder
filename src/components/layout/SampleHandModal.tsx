"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  BarChart3,
  Star,
} from "lucide-react";
import { DeckCard } from "@/types";
import { DeckFormat, getFormatRules } from "@/lib/formatRules";

interface SampleHandModalProps {
  deck: DeckCard[];
  onClose: () => void;
  format?: DeckFormat;
  commanderId?: string;
}

export default function SampleHandModal({
  deck,
  onClose,
  format = "freeform",
  commanderId,
}: SampleHandModalProps) {
  const [hand, setHand] = useState<DeckCard[]>([]);
  const [library, setLibrary] = useState<DeckCard[]>([]);
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [showLands, setShowLands] = useState(true);
  const [mulliganCount, setMulliganCount] = useState(0);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  // Format-aware probability thresholds
  const rules = getFormatRules(format);
  const PROB_GREEN = rules.probGreen;
  const PROB_YELLOW = rules.probYellow;

  const isLand = (c: DeckCard) => c.type_line.toLowerCase().includes("land");

  const totalCards = deck.reduce((s, c) => s + c.quantity, 0);

  // Commander is excluded from library — sits in command zone
  const libraryCards = deck.filter(
    (c) => !(format === "commander" && c.id === commanderId)
  );

  const shuffleAndDraw = () => {
    const pool: DeckCard[] = [];
    libraryCards.forEach((card) => {
      for (let i = 0; i < card.quantity; i++) {
        pool.push(card);
      }
    });
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setMulliganCount((prev) => prev + 1);
    setMarked(new Set());
    setHand(pool.slice(0, 7));
    setLibrary(pool.slice(7));
  };

  const drawCard = () => {
    if (library.length === 0) return;
    setHand((prev) => [...prev, library[0]]);
    setLibrary((prev) => prev.slice(1));
  };

  const toggleMark = (cardId: string) => {
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  // Static — computed once from deck prop, never changes during simulation
  const curveBuckets = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    deck
      .filter((c) => !c.type_line.toLowerCase().includes("land"))
      .forEach((c) => {
        const cmc = c.cmc || 0;
        const bucket = cmc >= 7 ? 7 : Math.max(1, Math.floor(cmc));
        counts[bucket] = (counts[bucket] || 0) + c.quantity;
      });
    const landCount = deck
      .filter((c) => c.type_line.toLowerCase().includes("land"))
      .reduce((s, c) => s + c.quantity, 0);
    const landPct = totalCards > 0 ? (landCount / totalCards) * 100 : 0;
    const maxCount = Math.max(...Object.values(counts), 1);
    return { counts, maxCount, landCount, landPct };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Live — recomputes on every draw/mulligan
  const libraryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    library.forEach((c) => {
      counts[c.id] = (counts[c.id] || 0) + 1;
    });
    return counts;
  }, [library]);

  const drawOdds = useMemo(() => {
    const rows = libraryCards
      .filter((c) => showLands || !c.type_line.toLowerCase().includes("land"))
      .map((c) => {
        const copiesInLibrary = libraryCounts[c.id] || 0;
        const liveProb = library.length > 0 ? copiesInLibrary / library.length : 0;
        const maxProb = totalCards > 0 ? c.quantity / totalCards : 0;
        const barFill = maxProb > 0 ? liveProb / maxProb : 0;
        const isPinned = marked.has(c.id);
        return { card: c, copiesInLibrary, liveProb, barFill, isPinned };
      })
      .filter((r) => r.copiesInLibrary > 0);

    rows.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.liveProb - a.liveProb;
    });

    return rows;
  }, [library, libraryCounts, marked, showLands]); // eslint-disable-line react-hooks/exhaustive-deps

  const handStats = useMemo(() => {
    const lands = hand.filter((c) => c.type_line.toLowerCase().includes("land")).length;
    const spells = hand.filter((c) => !c.type_line.toLowerCase().includes("land"));
    const avgCMC =
      spells.length > 0
        ? spells.reduce((s, c) => s + (c.cmc || 0), 0) / spells.length
        : null;
    return { lands, avgCMC };
  }, [hand]);

  const getProbColor = (liveProb: number) => {
    if (liveProb >= PROB_GREEN) return "text-emerald-400";
    if (liveProb >= PROB_YELLOW) return "text-yellow-400";
    return "text-red-400";
  };

  const getBarColor = (liveProb: number) => {
    if (liveProb >= PROB_GREEN) return "bg-emerald-500";
    if (liveProb >= PROB_YELLOW) return "bg-yellow-500";
    return "bg-red-500";
  };

  useEffect(() => {
    if (hand.length > 7) {
      scrollEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [hand.length]);

  // Initial draw on mount — does not increment mulliganCount (starts at 0)
  useEffect(() => {
    const pool: DeckCard[] = [];
    libraryCards.forEach((card) => {
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
  }, [deck]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 md:p-10 bg-surface-backdrop backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[1600px] h-full flex flex-col bg-surface-base rounded-2xl border border-line-subtle shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line-subtle p-4 md:p-6 bg-surface-base z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg hidden sm:block">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-primary">
                Opening Hand Simulator
              </h2>
              <p className="text-muted text-[10px] md:text-xs uppercase tracking-widest font-bold">
                Hand: {hand.length} · Library: {library.length} · Mulligans: {mulliganCount}
              </p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={drawCard}
              disabled={library.length === 0}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 border border-blue-500 rounded-lg text-xs md:text-sm font-bold text-primary hover:bg-blue-500 disabled:opacity-30 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Draw
            </button>
            <button
              onClick={shuffleAndDraw}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-surface-raised border border-line-default rounded-lg text-xs md:text-sm font-bold text-primary hover:bg-surface-overlay transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Mulligan
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-surface-base border border-line-subtle rounded-full text-tertiary hover:text-primary transition-all hover:bg-surface-raised shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Stats Sidebar */}
          <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-line-subtle bg-surface-base overflow-y-auto shrink-0 custom-scrollbar">
            <div className="p-4 lg:p-5 flex flex-col gap-7">

              {/* Section 1 — Mana Curve */}
              <section>
                <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">
                  Mana Curve
                </h4>
                {/* Histogram bars */}
                <div className="flex items-end gap-1 mb-0.5" style={{ height: "64px" }}>
                  {[1, 2, 3, 4, 5, 6, 7].map((cmc) => {
                    const count = curveBuckets.counts[cmc] || 0;
                    const heightPct =
                      count > 0 ? (count / curveBuckets.maxCount) * 100 : 0;
                    return (
                      <div
                        key={cmc}
                        className="flex-1 flex flex-col items-center justify-end h-full gap-0.5"
                      >
                        <span className="text-[9px] text-tertiary font-bold leading-none">
                          {count > 0 ? count : ""}
                        </span>
                        <div
                          className="w-full bg-blue-500 rounded-t-sm"
                          style={{
                            height: count > 0 ? `${heightPct}%` : "0",
                            minHeight: count > 0 ? "4px" : "0",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* CMC labels */}
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((cmc) => (
                    <div key={cmc} className="flex-1 text-center">
                      <span className="text-[9px] text-faint font-bold">
                        {cmc === 7 ? "7+" : cmc}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Lands strip */}
                <div className="flex items-center gap-2 pt-2.5 border-t border-line-subtle">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />
                  <span className="text-[11px] text-tertiary">Lands</span>
                  <span className="ml-auto text-[11px] font-bold text-secondary">
                    {curveBuckets.landCount} / {totalCards}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400">
                    {curveBuckets.landPct.toFixed(0)}%
                  </span>
                </div>
              </section>

              {/* Section 2 — Current Hand */}
              <section>
                <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">
                  Current Hand
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tertiary">Cards in hand</span>
                    <span className="text-sm font-bold text-primary">{hand.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tertiary">Lands</span>
                    <span className="text-sm font-bold text-primary">{handStats.lands}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tertiary">Avg. CMC</span>
                    <span className="text-sm font-bold text-primary">
                      {handStats.avgCMC !== null ? handStats.avgCMC.toFixed(1) : "—"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Section 3 — Draw Odds */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest">
                    Draw Odds
                  </h4>
                  <button
                    onClick={() => setShowLands((prev) => !prev)}
                    className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border transition-colors ${
                      showLands
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                        : "bg-surface-raised border-line-default text-muted hover:text-tertiary"
                    }`}
                  >
                    Lands
                  </button>
                </div>
                <div className="space-y-1.5">
                  {drawOdds.length === 0 && (
                    <p className="text-[11px] text-faint italic">
                      No cards remaining in library.
                    </p>
                  )}
                  {drawOdds.map(({ card, copiesInLibrary, liveProb, barFill, isPinned }) => (
                    <div
                      key={card.id}
                      onClick={() => toggleMark(card.id)}
                      className={`rounded-lg px-2.5 py-2 cursor-pointer transition-all border ${
                        isPinned
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-surface-base border-transparent hover:border-line-default"
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1.5">
                        {isPinned && (
                          <Star className="w-3 h-3 text-blue-400 fill-blue-400 shrink-0" />
                        )}
                        <span
                          className={`text-[11px] font-medium truncate flex-1 ${
                            isPinned ? "text-blue-300" : "text-secondary"
                          }`}
                        >
                          {card.name}
                        </span>
                        <span className="text-[10px] text-faint shrink-0 ml-1">
                          ×{copiesInLibrary}
                        </span>
                        <span
                          className={`text-[11px] font-bold shrink-0 ml-1 ${getProbColor(liveProb)}`}
                        >
                          {(liveProb * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-1 bg-surface-raised rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${getBarColor(liveProb)}`}
                          style={{ width: `${Math.min(barFill * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>

          {/* Card Grid Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface-base custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 md:gap-5 pb-20 justify-items-center max-w-full mx-auto">
              {hand.map((card, i) => {
                const isPinned = marked.has(card.id);
                return (
                  <div
                    key={`${card.id}-${i}`}
                    className="w-full max-w-[180px] animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="relative">
                      <img
                        src={
                          card.image_uris?.normal ||
                          card.card_faces?.[0]?.image_uris?.normal
                        }
                        className={`w-full rounded-lg shadow-xl border transition-all cursor-pointer hover:scale-105 ${
                          isPinned
                            ? "border-blue-500 ring-2 ring-blue-500"
                            : "border-line-subtle hover:border-blue-500/50"
                        }`}
                        alt={card.name}
                        onClick={() => toggleMark(card.id)}
                      />
                      {isPinned && (
                        <div className="absolute top-1.5 right-1.5 bg-blue-600 rounded-full p-0.5 shadow-md">
                          <Star className="w-2.5 h-2.5 text-primary fill-white" />
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-[9px] text-muted font-bold truncate text-center uppercase tracking-tight">
                      {card.name}
                    </p>
                  </div>
                );
              })}
              <div ref={scrollEndRef} className="col-span-full h-1 w-full" />

              {library.length === 0 && (
                <div className="col-span-full mt-10 flex flex-col items-center justify-center p-12 border border-dashed border-line-subtle rounded-2xl bg-neutral-900/30 w-full max-w-2xl mx-auto">
                  <AlertCircle className="w-10 h-10 text-neutral-700 mb-3" />
                  <p className="text-muted font-medium text-sm">
                    Library depleted.
                  </p>
                  <button
                    onClick={shuffleAndDraw}
                    className="mt-4 px-6 py-2 bg-surface-raised hover:bg-surface-overlay text-primary rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Reshuffle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
