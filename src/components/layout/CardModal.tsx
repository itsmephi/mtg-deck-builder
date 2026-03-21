"use client";

import { useState, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  Info,
  RotateCw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ScryfallCard } from "@/types";
import { getCardRulings, getCardPrintings } from "@/lib/scryfall";

interface CardModalProps {
  card: ScryfallCard;
  onClose: () => void;
  onSwap?: (oldCardId: string, newCard: ScryfallCard) => void;
  onNext?: () => void;
  onPrev?: () => void;
  context?: "search" | "deck";
  onAddToDeck?: (card: ScryfallCard) => void;
}

export default function CardModal({
  card,
  onClose,
  onSwap,
  onNext,
  onPrev,
  context = "deck",
  onAddToDeck,
}: CardModalProps) {
  if (!card) return null;

  const [view, setView] = useState<"details" | "prints">("details");
  const [rulings, setRulings] = useState<
    { source: string; published_at: string; comment: string }[]
  >([]);
  const [variants, setVariants] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewCard, setPreviewCard] = useState<ScryfallCard>(card);
  const [faceIndex, setFaceIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (card.id === previewCard.id) return;
    setPreviewCard(card);
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setView("details");
      setFaceIndex(0);
      setRulings([]);
      setVariants([]);
      setIsTransitioning(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [card.id]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (view === "details" && rulings.length === 0) {
        const data = await getCardRulings(previewCard.id);
        setRulings(data);
      } else if (view === "prints" && variants.length === 0) {
        const data = await getCardPrintings(previewCard.oracle_id);
        setVariants(data);
      }
      setLoading(false);
    }
    fetchData();
  }, [previewCard.id, view]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrev, onClose]);

  const isDoubleFaced =
    !!previewCard.card_faces && previewCard.card_faces.length > 0;
  const isRoom = previewCard.type_line?.includes("Room");
  const hasBackArt =
    isDoubleFaced && !!previewCard.card_faces![1].image_uris && !isRoom;
  const currentFace = isDoubleFaced
    ? previewCard.card_faces![faceIndex]
    : previewCard;

  const renderManaSymbols = (manaCost: string | undefined) => {
    if (!manaCost) return null;
    const symbols = manaCost.match(/\{[^}]+\}/g) || [];
    return (
      <div className="flex gap-0.5 ml-1">
        {symbols.map((s, i) => (
          <img
            key={i}
            src={`https://svgs.scryfall.io/card-symbols/${s.replace(/\{|\}/g, "").replace(/\//g, "")}.svg`}
            className="w-3.5 h-3.5"
            alt={s}
          />
        ))}
      </div>
    );
  };

  const renderOracleText = (text: string | undefined) => {
    if (!text)
      return (
        <span className="text-muted italic">
          No rules text available.
        </span>
      );
    const paragraphs = text.split("\n");
    return (
      <div className="space-y-2">
        {paragraphs.map((paragraph, pi) => {
          const tokens = paragraph.split(/(\{[^}]+\})/g);
          return (
            <p key={pi} className="leading-relaxed">
              {tokens.map((token, ti) => {
                if (token.match(/^\{[^}]+\}$/)) {
                  const symbol = token.replace(/\{|\}/g, "").replace(/\//g, "");
                  return (
                    <img
                      key={ti}
                      src={`https://svgs.scryfall.io/card-symbols/${symbol}.svg`}
                      className="w-4 h-4 inline-block mx-0.5 align-middle"
                      alt={token}
                    />
                  );
                }
                return <span key={ti}>{token}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  const formatLegality = (status: string) => {
    if (status === "legal")
      return "bg-green-900/50 text-green-400 border-green-800";
    if (status === "not_legal")
      return "bg-surface-raised text-muted border-default";
    if (status === "banned") return "bg-red-900/50 text-red-400 border-red-800";
    return "bg-surface-raised text-muted border-default";
  };

  const formats = [
    "standard",
    "pioneer",
    "modern",
    "legacy",
    "vintage",
    "commander",
    "pauper",
  ];

  // Handle the specialized transform for landscape Room cards vs 3D DFCs
  const getArtTransform = () => {
    if (hasBackArt)
      return faceIndex === 1 ? "rotateY(180deg)" : "rotateY(0deg)";
    if (isRoom) {
      // 1. Rotate 90deg to landscape
      // 2. Scale up so a single door fills the frame
      // 3. TranslateY: -18% moves the BOTTOM door into view, 18% moves the TOP door.
      const rotate = "rotate(90deg)";
      const slide = faceIndex === 0 ? "translateY(-18%)" : "translateY(18%)"; // Swapped these values
      return `${rotate} scale(1.4) ${slide}`;
    }
    return "none";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-backdrop backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative flex items-center justify-center w-full max-w-5xl">
        {onPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-2 md:-left-16 p-3 bg-surface-base border border-default rounded-full text-primary hover:bg-surface-overlay hover:scale-110 transition-all z-50 shadow-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div
          className="bg-surface-base border border-subtle rounded-xl w-full h-[700px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-surface-base border border-subtle rounded-full text-tertiary hover:text-primary z-20 shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className={`flex flex-col md:flex-row w-full h-full transition-all duration-150 ease-in-out ${isTransitioning ? "opacity-0 blur-sm scale-[0.98]" : "opacity-100 blur-0 scale-100"}`}
          >
            <div className="w-full md:w-2/5 p-6 bg-surface-base flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-subtle shrink-0">
              <div
                className="relative w-full flex-1 group cursor-pointer overflow-hidden rounded-xl shadow-lg mb-4"
                style={{ perspective: "1000px" }}
                onClick={() =>
                  isDoubleFaced && setFaceIndex(faceIndex === 0 ? 1 : 0)
                }
              >
                <div
                  className="relative w-full h-full transition-all duration-700 ease-in-out preserve-3d"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: getArtTransform(),
                  }}
                >
                  <div
                    className="absolute inset-0 w-full h-full backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <img
                      src={
                        previewCard.image_uris?.large ||
                        previewCard.card_faces?.[0]?.image_uris?.large
                      }
                      alt="Front Art"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {hasBackArt && (
                    <div
                      className="absolute inset-0 w-full h-full backface-hidden"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <img
                        src={previewCard.card_faces![1].image_uris?.large}
                        alt="Back Art"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
                {isDoubleFaced && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/90 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest border border-default opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {isRoom ? (
                      <Maximize2 className="w-3 h-3" />
                    ) : (
                      <RotateCw className="w-3 h-3" />
                    )}
                    {isRoom
                      ? `Switch to ${faceIndex === 0 ? "Right Door" : "Left Door"}`
                      : "Click to Flip"}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full max-w-xs">
                <div className="flex bg-surface-base border border-subtle rounded-lg p-1 w-full">
                  <button
                    onClick={() => {
                      setView("details");
                      setFaceIndex(0);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md transition-colors ${view === "details" ? "bg-surface-raised text-primary" : "text-muted hover:text-secondary"}`}
                  >
                    <Info className="w-4 h-4" /> Details
                  </button>
                  <button
                    onClick={() => setView("prints")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md transition-colors ${view === "prints" ? "bg-surface-raised text-primary" : "text-muted hover:text-secondary"}`}
                  >
                    <ImageIcon className="w-4 h-4" /> Swap Art
                  </button>
                </div>
                {context === "search" ? (
                  <button
                    onClick={() => { onAddToDeck?.(previewCard); setView("details"); }}
                    disabled={!onAddToDeck}
                    title={!onAddToDeck ? "No deck selected" : undefined}
                    className="w-full py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-500 text-primary disabled:bg-surface-raised disabled:text-muted disabled:cursor-not-allowed"
                  >
                    + Add to Deck
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onSwap && onSwap(card.id, previewCard);
                      setView("details");
                    }}
                    disabled={previewCard.id === card.id}
                    className="w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-primary disabled:bg-surface-raised disabled:text-faint"
                  >
                    Confirm Art Swap
                  </button>
                )}
              </div>
            </div>

            <div className="w-full md:w-3/5 p-8 overflow-y-auto bg-surface-base text-heading">
              {view === "details" ? (
                <div className="space-y-8">
                  <section>
                    <h2 className="text-3xl font-bold text-primary leading-tight">
                      {isDoubleFaced
                        ? `${previewCard.card_faces![0].name} // ${previewCard.card_faces![1].name}`
                        : previewCard.name}
                    </h2>
                    <p className="text-sm text-muted">
                      {previewCard.set_name || previewCard.set.toUpperCase()}
                    </p>
                  </section>

                  <section className="bg-surface-base border border-subtle rounded-xl p-6 space-y-4 shadow-inner">
                    {isDoubleFaced && (
                      <div className="flex justify-end border-b border-subtle pb-2">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                          Viewing:{" "}
                          {isRoom
                            ? faceIndex === 0
                              ? "Left"
                              : "Right"
                            : faceIndex === 0
                              ? "Front"
                              : "Back"}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-primary">
                        {currentFace.type_line}
                      </span>
                      {renderManaSymbols(currentFace.mana_cost)}
                    </div>
                    <div className="text-sm text-secondary">
                      {renderOracleText(currentFace.oracle_text)}
                    </div>
                    {currentFace.flavor_text && (
                      <div className="text-sm leading-relaxed text-muted italic border-t border-subtle pt-3 mt-1">
                        {currentFace.flavor_text}
                      </div>
                    )}
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3 px-1">
                      Product Details
                    </h3>
                    <div className="space-y-1 text-sm px-1">
                      <p>
                        <span className="font-bold text-primary">Artist:</span>{" "}
                        <span className="text-blue-400">
                          {currentFace.artist}
                        </span>
                      </p>
                      <p>
                        <span className="font-bold text-primary">Rarity:</span>{" "}
                        <span className="capitalize">{previewCard.rarity}</span>
                      </p>
                      <p>
                        <span className="font-bold text-primary">
                          Collector #:
                        </span>{" "}
                        {previewCard.collector_number}
                      </p>
                      <p>
                        <span className="font-bold text-primary">Price:</span>{" "}
                        <span className="text-green-400">
                          {previewCard.prices.usd
                            ? `$${previewCard.prices.usd}`
                            : "N/A"}
                        </span>
                      </p>
                      {previewCard.released_at && (
                        <p>
                          <span className="font-bold text-primary">Released:</span>{" "}
                          {previewCard.released_at}
                        </p>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3 px-1">
                      Legalities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formats.map((format) => (
                        <div
                          key={format}
                          className={`px-2 py-1 rounded border text-[10px] font-bold uppercase ${formatLegality(previewCard.legalities[format])}`}
                        >
                          {format}:{" "}
                          {previewCard.legalities[format]?.replace("_", " ")}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3 px-1">
                      Oracle Rulings
                    </h3>
                    {loading ? (
                      <p className="text-xs text-muted italic px-1">
                        Loading...
                      </p>
                    ) : rulings.length === 0 ? (
                      <p className="text-xs text-muted italic px-1">
                        No rulings available.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {rulings.map((r, i) => (
                          <li
                            key={i}
                            className="text-xs text-tertiary bg-neutral-900/50 p-3 rounded-lg border border-subtle"
                          >
                            <span className="text-[10px] text-faint font-bold block mb-1">
                              {r.published_at}
                            </span>
                            {r.comment}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              ) : loading && variants.length === 0 ? (
                <div className="flex justify-center p-12">
                  <div className="w-5 h-5 border-2 border-neutral-600 border-t-tertiary rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {variants.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setPreviewCard(v)}
                      className={`p-2 rounded-xl border cursor-pointer transition-all ${previewCard.id === v.id ? "border-blue-500 bg-blue-500/10" : "border-subtle bg-surface-base hover:border-default"}`}
                    >
                      <img
                        src={
                          v.image_uris?.normal ||
                          v.card_faces?.[0]?.image_uris?.normal
                        }
                        className="rounded-lg mb-1"
                        alt={v.name}
                      />
                      <div className="flex justify-between text-[10px] uppercase font-bold text-muted">
                        <span>{v.set}</span>
                        <span className="text-secondary">
                          {v.prices.usd ? `$${v.prices.usd}` : "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {onNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-2 md:-right-16 p-3 bg-neutral-900 border border-neutral-700 rounded-full text-primary hover:bg-neutral-700 hover:scale-110 transition-all z-50 shadow-xl"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
