import { Plus, Minus, Check, X } from 'lucide-react';
import { DeckCard, ScryfallCard } from '@/types';

interface VisualCardProps {
  card: DeckCard;
  onUpdateQuantity: (id: string, delta: number) => void;
  onToggleOwned: (id: string) => void;
  onRemove: (id: string) => void;
  onSelect: (card: ScryfallCard) => void;
}

export default function VisualCard({ card, onUpdateQuantity, onToggleOwned, onRemove, onSelect }: VisualCardProps) {
  const isDoubleFaced = !!card.card_faces && card.card_faces.length > 1;
  const isRoom = card.type_line?.includes('Room');
  const hasBackArt = isDoubleFaced && !!card.card_faces![1].image_uris && !isRoom;

  const imgStyles = `w-full h-full rounded-lg object-cover transition-opacity duration-300 ${
    card.quantity === 0 ? 'opacity-25 grayscale' : card.isOwned ? 'opacity-50' : ''
  }`;

  return (
    <div className="group/card flex flex-col p-1.5 rounded-xl border border-neutral-800 bg-neutral-900 transition-all hover:border-neutral-700">
      <div className="flex justify-between items-center px-0.5 mb-1.5 text-[10px]">
        <span className="text-neutral-400">${card.prices.usd || '0.00'}</span>
        <div className="flex gap-2">
          
          {/* Flipped Tooltip: Drops DOWN to avoid top frame clipping */}
          <div className="group relative flex items-center justify-center">
            <Check 
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleOwned(card.id); }} 
              className={`w-3 h-3 cursor-pointer transition-colors ${card.isOwned ? 'text-green-500' : 'text-neutral-600 hover:text-green-400'}`} 
            />
            <span className="absolute top-full mt-1.5 left-0 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {card.isOwned ? 'Unmark Owned' : 'Mark Owned'}
            </span>
          </div>

          {/* Flipped Tooltip: Drops DOWN to avoid top frame clipping */}
          <div className="group relative flex items-center justify-center">
            <X 
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRemove(card.id); }} 
              className="w-3 h-3 cursor-pointer text-neutral-600 hover:text-red-500 transition-colors" 
            />
            <span className="absolute top-full mt-1.5 right-0 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Remove Card
            </span>
          </div>

        </div>
      </div>
      
      <div className="relative aspect-[2.5/3.5] w-full cursor-pointer" style={{ perspective: '1000px' }} onClick={() => onSelect(card)}>
        <div className={`relative w-full h-full transition-transform duration-500 shadow-lg rounded-lg ${hasBackArt ? 'group-hover/card:[transform:rotateY(180deg)]' : 'hover:scale-105'}`} style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0 w-full h-full backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
            <img src={card.card_faces?.[0].image_uris?.normal || card.image_uris?.normal} className={imgStyles} alt={card.name} />
          </div>
          {hasBackArt && (
            <div className="absolute inset-0 w-full h-full backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <img src={card.card_faces![1].image_uris?.normal} className={imgStyles} alt={card.name} />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-1.5 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800">
        <div className="group relative flex items-center justify-center">
          <Minus 
            onClick={() => onUpdateQuantity(card.id, -1)} 
            className="w-4 h-4 p-0.5 cursor-pointer text-neutral-500 hover:text-white transition-colors" 
          />
          <span className="absolute top-full mt-1.5 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Decrease
          </span>
        </div>
        
        <span className="text-xs font-bold text-neutral-200">{card.quantity}</span>
        
        <div className="group relative flex items-center justify-center">
          <Plus 
            onClick={() => onUpdateQuantity(card.id, 1)} 
            className="w-4 h-4 p-0.5 cursor-pointer text-neutral-500 hover:text-white transition-colors" 
          />
          <span className="absolute top-full mt-1.5 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[9px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Increase
          </span>
        </div>
      </div>
    </div>
  );
}