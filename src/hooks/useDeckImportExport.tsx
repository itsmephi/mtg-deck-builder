import { useState, useEffect } from "react";
import { useDeckManager } from "@/hooks/useDeckManager";
import { ScryfallCard, DeckCard } from "@/types";
import { searchCards } from "@/lib/scryfall";

export function useDeckImportExport() {
  const { decks, activeDeck, updateActiveDeck, createNewDeck } =
    useDeckManager();
  const [isImporting, setIsImporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    filename: string;
    lines: string[];
  } | null>(null);
  const [pendingNewDeckData, setPendingNewDeckData] = useState<{
    name: string;
    cards: DeckCard[];
  } | null>(null);

  useEffect(() => {
    if (pendingNewDeckData && activeDeck && activeDeck.cards.length === 0) {
      updateActiveDeck((deck) => ({
        ...deck,
        name: pendingNewDeckData.name,
        cards: pendingNewDeckData.cards,
      }));
      setPendingNewDeckData(null);
      setIsImporting(false);
    }
  }, [activeDeck, pendingNewDeckData, updateActiveDeck]);

  const exportDeck = () => {
    if (!activeDeck) return;
    const content = activeDeck.cards
      .map((c) => {
        let line = `${c.quantity} ${c.name}`;
        if (c.set && c.collector_number)
          line += ` [${c.set.toUpperCase()}] #${c.collector_number}`;
        if (c.ownedQty > 0) line += ` [owned:${c.ownedQty}]`;
        return line;
      })
      .join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeDeck.name.replace(/\s+/g, "_")}_decklist.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileInputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split("\n").filter((line) => line.trim() !== "");
      const filename = file.name.replace(/\.txt$/i, "").replace(/_/g, " ");
      setPendingImport({ filename, lines });
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const getUniqueDeckName = (baseName: string) => {
    let newName = baseName;
    let counter = 1;
    while (decks.some((d) => d.name.toLowerCase() === newName.toLowerCase())) {
      newName = `${baseName} (${counter})`;
      counter++;
    }
    return newName;
  };

  const processImport = async (mode: "current" | "new") => {
    if (!pendingImport) return;
    const { filename, lines } = pendingImport;
    setPendingImport(null);
    setIsImporting(true);

    const parsedCards: {
      name: string;
      quantity: number;
      set?: string;
      collector_number?: string;
      ownedQty: number;
    }[] = [];
    for (const line of lines) {
      if (line.trim().startsWith("//")) continue;
      const match = line.trim().match(/^(\d+)[xX]?\s+([^\[\(]+)/);
      if (match) {
        const quantity = parseInt(match[1], 10);
        const name = match[2].trim();
        const setMatch = line.match(/\[([A-Z0-9]+)\]/i);
        const numMatch = line.match(/#(\d+)/);
        const ownedNumMatch = line.match(/\[owned:(\d+)\]/i);
        const ownedQty = ownedNumMatch
          ? parseInt(ownedNumMatch[1], 10)
          : line.includes("[owned]")
          ? quantity
          : 0;
        parsedCards.push({
          quantity,
          name,
          set: setMatch ? setMatch[1].toLowerCase() : undefined,
          collector_number: numMatch ? numMatch[1] : undefined,
          ownedQty,
        });
      } else if (line.trim()) {
        parsedCards.push({ quantity: 1, name: line.trim(), ownedQty: 0 });
      }
    }

    const fetchedDeckCards: DeckCard[] = [];
    const chunkSize = 75;

    for (let i = 0; i < parsedCards.length; i += chunkSize) {
      const chunk = parsedCards.slice(i, i + chunkSize);
      const identifiers = chunk.map((c) =>
        c.set && c.collector_number
          ? { set: c.set, collector_number: c.collector_number }
          : { name: c.name },
      );
      try {
        const response = await fetch(
          "https://api.scryfall.com/cards/collection",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifiers }),
          },
        );
        const data = await response.json();
        if (data.data) {
          // Fix: for any card missing or $0.00 USD price, do a follow-up search
          // using order:usd to find a printing that has pricing data
          const rescuePromises = data.data.map(
            async (scryfallCard: ScryfallCard) => {
              const parsed = chunk.find((c) =>
                scryfallCard.name.toLowerCase().includes(c.name.toLowerCase()),
              );
              const quantity = parsed?.quantity ?? 1;

              let cardToUse = scryfallCard;
              if (
                !scryfallCard.prices.usd ||
                scryfallCard.prices.usd === "0.00"
              ) {
                const results = await searchCards(`!"${scryfallCard.name}"`);
                if (
                  results.length > 0 &&
                  results[0].prices.usd &&
                  results[0].prices.usd !== "0.00"
                ) {
                  cardToUse = results[0];
                }
              }

              fetchedDeckCards.push({
                ...cardToUse,
                quantity,
                ownedQty: parsed?.ownedQty ?? 0,
              });
            },
          );

          await Promise.all(rescuePromises);
        }
      } catch (err) {
        console.error("Error fetching from Scryfall:", err);
      }
    }

    if (mode === "new") {
      const uniqueName = getUniqueDeckName(filename);
      setPendingNewDeckData({ name: uniqueName, cards: fetchedDeckCards });
      createNewDeck();
    } else {
      updateActiveDeck((deck) => {
        const newCards = [...deck.cards];
        fetchedDeckCards.forEach((fetchedCard) => {
          const existingIndex = newCards.findIndex(
            (c) => c.name === fetchedCard.name,
          );
          if (existingIndex >= 0) {
            newCards[existingIndex] = {
              ...newCards[existingIndex],
              quantity: newCards[existingIndex].quantity + fetchedCard.quantity,
            };
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
    cancelImport,
  };
}
