interface Deck {
  id: string;
  name: string;
  cards: { quantity: number }[];
  format?: string;
}

interface DeckCoverCardProps {
  deck: Deck;
  onClick: () => void;
}

export default function DeckCoverCard({ deck, onClick }: DeckCoverCardProps) {
  // Deterministic gradient tint per deck — cycles through a small set
  const tints = [
    "from-[#2a2035] to-[#1a1525]",
    "from-[#1a2535] to-[#0f1825]",
    "from-[#2a1510] to-[#1a0d08]",
    "from-[#1a2520] to-[#0f1a14]",
    "from-[#252015] to-[#1a150d]",
  ];
  const tintIndex =
    deck.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % tints.length;
  const tint = tints[tintIndex];

  return (
    <div
      onClick={onClick}
      className="
        w-[100px] h-[140px] rounded-lg cursor-pointer
        border border-line-default bg-surface-raised
        flex flex-col items-end justify-end
        pb-2.5 gap-1
        relative overflow-hidden shrink-0
        hover:border-surface-hover transition-colors
      "
    >
      {/* Placeholder art */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tint} opacity-50`} />
      {/* Text — above gradient */}
      <div className="relative z-10 flex flex-col items-center w-full gap-0.5 px-1.5">
        <span className="text-[10px] font-medium text-content-heading text-center leading-tight line-clamp-2">
          {deck.name || "Untitled"}
        </span>
        <span className="text-[9px] text-content-muted">
          {deck.cards.reduce((sum, c) => sum + c.quantity, 0)} cards
        </span>
      </div>
    </div>
  );
}
