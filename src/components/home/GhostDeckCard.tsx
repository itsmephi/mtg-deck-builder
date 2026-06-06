import { Plus } from "lucide-react";

interface GhostDeckCardProps {
  onClick: () => void;
}

export default function GhostDeckCard({ onClick }: GhostDeckCardProps) {
  return (
    <div
      onClick={onClick}
      className="w-[120px] h-[168px] rounded-lg cursor-pointer border border-dashed border-input-edge-focus flex flex-col items-center justify-center gap-1.5 opacity-50 hover:opacity-100 hover:bg-[color:var(--input-edge-focus)]/5 transition-opacity transition-colors text-[color:var(--input-edge-focus)] shrink-0"
    >
      <Plus className="w-6 h-6" />
      <span className="text-xs text-center leading-tight px-2">New Deck</span>
    </div>
  );
}
