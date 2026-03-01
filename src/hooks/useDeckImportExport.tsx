import { useState, useEffect } from 'react';
import { useDeckManager } from '@/hooks/useDeckManager';
import { ScryfallCard, DeckCard } from '@/types';

export function useDeckImportExport() {
  const { decks, activeDeck, updateActiveDeck, createNewDeck } = useDeckManager();
  const [isImporting, setIsImporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ filename: string, lines: string[] } | null>(null);
  const [pendingNewDeckData, setPendingNewDeckData] = useState<{ name: string, cards: DeckCard[] } | null>(null);

  // Listener to populate a newly created deck with imported cards
  useEffect(() => {
    if (pendingNewDeckData && activeDeck && activeDeck.cards.length === 0) {
      updateActiveDeck(deck => ({
        ...deck,
        name: pendingNewDeckData.name,
        cards: pendingNewDeckData.cards
      }));
      setPendingNewDeckData(null);
      setIsImporting(false);
    }
  }, [activeDeck, pendingNewDeckData, updateActiveDeck]);

  const exportDeck = () => {
    if (!activeDeck) return;
    const content = activeDeck.cards.map(c => `${c.quantity} ${c.name}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDeck.name.replace(/\s+/g, '_')}_decklist.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>, fileInputRef: React.RefObject<HTMLInputElement | null>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim() !== '');
      const filename = file.name.replace(/\.txt$/i, '').replace(/_/g, ' ');
      setPendingImport({ filename, lines });
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const getUniqueDeckName = (baseName: string) => {
    let newName = baseName;
    let counter = 1;
    while (decks.some(d => d.name.toLowerCase() === newName.toLowerCase())) {
      newName = `${baseName} (${counter})`;
      counter++;
    }
    return newName;
  };

  const processImport = async (mode: 'current' | 'new') => {
    if (!pendingImport) return;
    const { filename, lines } = pendingImport;
    setPendingImport(null);
    setIsImporting(true);

    const parsedCards: { name: string, quantity: number }[] = [];
    for (const line of lines) {
      if (line.trim().startsWith('//')) continue; 
      const match = line.trim().match(/^(\d+)[xX]?\s+([^(]+)/);
      if (match) {
        parsedCards.push({ quantity: parseInt(match[1], 10), name: match[2].trim() });
      } else if (line.trim()) {
        parsedCards.push({ quantity: 1, name: line.trim() });
      }
    }

    const fetchedDeckCards: DeckCard[] = [];
    const chunkSize = 75; // Scryfall limit

    for (let i = 0; i < parsedCards.length; i += chunkSize) {
      const chunk = parsedCards.slice(i, i + chunkSize);
      const identifiers = chunk.map(c => ({ name: c.name }));
      try {
        const response = await fetch('https://api.scryfall.com/cards/collection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifiers })
        });
        const data = await response.json();
        if (data.data) {
          data.data.forEach((scryfallCard: ScryfallCard) => {
            const parsed = chunk.find(c => scryfallCard.name.toLowerCase().includes(c.name.toLowerCase()));
            const quantity = parsed ? parsed.quantity : 1;
            fetchedDeckCards.push({ ...scryfallCard, quantity, isOwned: false });
          });
        }
      } catch (err) {
        console.error("Error fetching from Scryfall:", err);
      }
    }

    if (mode === 'new') {
      const uniqueName = getUniqueDeckName(filename);
      setPendingNewDeckData({ name: uniqueName, cards: fetchedDeckCards });
      createNewDeck();
    } else {
      updateActiveDeck(deck => {
        const newCards = [...deck.cards];
        fetchedDeckCards.forEach(fetchedCard => {
          const existingIndex = newCards.findIndex(c => c.name === fetchedCard.name);
          if (existingIndex >= 0) {
            newCards[existingIndex] = { ...newCards[existingIndex], quantity: newCards[existingIndex].quantity + fetchedCard.quantity };
          } else {
            newCards.push(fetchedCard);
          }
        });
        return { ...deck, cards: newCards };
      });
      setIsImporting(false);
    }
  };

  const cancelImport = () => setPendingImport(null);

  return {
    isImporting,
    pendingImport,
    exportDeck,
    handleImportFile,
    processImport,
    cancelImport
  };
}