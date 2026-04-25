import { useState, useEffect } from "react";
import { useDeckManager } from "@/hooks/useDeckManager";
import { ScryfallCard, DeckCard } from "@/types";
import { searchCards } from "@/lib/scryfall";
import { DeckFormat } from "@/lib/formatRules";

export type TextCaptureResult =
  | { type: "single"; name: string; setCode?: string }
  | { type: "direct-add"; name: string; qty: number; setCode?: string }
  | { type: "decklist"; rawLines: string[] }
  | { type: "unknown" };

export function parseDroppedText(text: string): TextCaptureResult {
  const trimmed = text.trim();
  if (!trimmed) return { type: "unknown" };

  const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
  const nonComment = lines.filter((l) => !l.startsWith("//"));
  const decklistPattern = /^\d+[xX]?\s+.+/;

  const matchCount = nonComment.slice(0, 5).filter((l) => decklistPattern.test(l)).length;
  if (matchCount >= 2) return { type: "decklist", rawLines: lines };

  // Single line with a quantity prefix ("3 Ba Sing Se") → direct add, no modal
  if (lines.length === 1 && decklistPattern.test(lines[0])) {
    const m = lines[0].match(/^(\d+)[xX]?\s+([^\[]+)/);
    if (m) {
      const qty = parseInt(m[1], 10);
      const rest = m[2].trim().replace(/\([^)]*\)/g, "").trim();
      const setMatch = lines[0].match(/\[([A-Z0-9]{2,5})\]/i);
      const name = rest.replace(/\[[^\]]*\]/g, "").trim();
      if (name) return { type: "direct-add", name, qty, setCode: setMatch?.[1].toUpperCase() };
    }
    return { type: "unknown" };
  }

  if (lines.length === 1 && !decklistPattern.test(lines[0])) {
    let line = lines[0];
    let setCode: string | undefined;

    // Set code in trailing parens: "Jumbo Cactuar (Borderless) - FINAL FANTASY (FIN)"
    const trailingParenCode = line.match(/\(([A-Z0-9]{2,5})\)\s*$/i);
    if (trailingParenCode) {
      setCode = trailingParenCode[1].toUpperCase();
      line = line.slice(0, trailingParenCode.index).trim();
    }

    // Set code in brackets: "Jumbo Cactuar [FIN]"
    if (!setCode) {
      const bracketCode = line.match(/\[([A-Z0-9]{2,5})\]/i);
      if (bracketCode) {
        setCode = bracketCode[1].toUpperCase();
        line = line.replace(/\[[^\]]*\]/g, "").trim();
      }
    }

    // Strip " - Set Name" suffix (common on MTG sites)
    line = line.replace(/\s*-\s*[^-]+$/, "").trim();

    // Strip remaining parentheticals (treatments like "Borderless", "Showcase")
    line = line.replace(/\([^)]*\)/g, "").trim();

    if (!line) return { type: "unknown" };
    return { type: "single", name: line, setCode };
  }

  return { type: "unknown" };
}

type ParsedLine = {
  name: string;
  quantity: number;
  set?: string;
  collector_number?: string;
  ownedQty: number;
};

function parseLines(rawLines: string[]): ParsedLine[] {
  const parsed: ParsedLine[] = [];
  for (const line of rawLines) {
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
        : line.includes("[owned]") ? quantity : 0;
      parsed.push({
        quantity,
        name,
        set: setMatch ? setMatch[1].toLowerCase() : undefined,
        collector_number: numMatch ? numMatch[1] : undefined,
        ownedQty,
      });
    } else if (line.trim()) {
      parsed.push({ quantity: 1, name: line.trim(), ownedQty: 0 });
    }
  }
  return parsed;
}

async function fetchCards(parsedCards: ParsedLine[]): Promise<DeckCard[]> {
  const fetched: DeckCard[] = [];
  const chunkSize = 75;
  for (let i = 0; i < parsedCards.length; i += chunkSize) {
    const chunk = parsedCards.slice(i, i + chunkSize);
    const identifiers = chunk.map((c) =>
      c.set && c.collector_number
        ? { set: c.set, collector_number: c.collector_number }
        : { name: c.name },
    );
    try {
      const response = await fetch("https://api.scryfall.com/cards/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiers }),
      });
      const data = await response.json();
      if (data.data) {
        await Promise.all(data.data.map(async (scryfallCard: ScryfallCard) => {
          const parsed = chunk.find((c) =>
            scryfallCard.name.toLowerCase().includes(c.name.toLowerCase()),
          );
          const quantity = parsed?.quantity ?? 1;
          let cardToUse = scryfallCard;
          if (!scryfallCard.prices.usd || scryfallCard.prices.usd === "0.00") {
            const results = await searchCards(`!"${scryfallCard.name}"`);
            if (results.length > 0 && results[0].prices.usd && results[0].prices.usd !== "0.00") {
              cardToUse = results[0];
            }
          }
          const ownedQty = parsed?.ownedQty ?? 0;
          fetched.push({ ...cardToUse, quantity, ownedQty, isOwned: ownedQty > 0 });
        }));
      }
    } catch (err) {
      console.error("Error fetching from Scryfall:", err);
    }
  }
  return fetched;
}

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
    sideboard?: DeckCard[];
    format: DeckFormat;
    commanderIds?: string[];
  } | null>(null);

  useEffect(() => {
    if (pendingNewDeckData && activeDeck && activeDeck.cards.length === 0) {
      updateActiveDeck((deck) => ({
        ...deck,
        name: pendingNewDeckData.name,
        cards: pendingNewDeckData.cards,
        sideboard: pendingNewDeckData.sideboard,
        format: pendingNewDeckData.format,
        commanderIds: pendingNewDeckData.commanderIds,
      }));
      setPendingNewDeckData(null);
      setIsImporting(false);
    }
  }, [activeDeck, pendingNewDeckData, updateActiveDeck]);

  const exportDeck = () => {
    if (!activeDeck) return;

    const formatCard = (c: DeckCard) => {
      let line = `${c.quantity} ${c.name}`;
      if (c.set && c.collector_number)
        line += ` [${c.set.toUpperCase()}] #${c.collector_number}`;
      if (c.ownedQty > 0) line += ` [owned:${c.ownedQty}]`;
      return line;
    };

    let content = activeDeck.cards.map(formatCard).join("\n");

    if (activeDeck.sideboard && activeDeck.sideboard.length > 0) {
      content += "\nSideboard\n" + activeDeck.sideboard.map(formatCard).join("\n");
    }

    if (activeDeck.format !== "freeform") {
      content =
        `// Format: ${activeDeck.format === "standard" ? "Standard" : "Commander"}\n` +
        content;
    }
    if (activeDeck.format === "commander" && activeDeck.commanderIds?.length) {
      const commanderLines = activeDeck.commanderIds
        .map((id) => activeDeck.cards.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => `// Commander: ${c!.name}`)
        .join("\n");
      if (commanderLines) {
        content = content.replace(
          /^(\/\/ Format:.*)$/m,
          `$1\n${commanderLines}`,
        );
      }
    }

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
    if (!decks.some((d) => d.name.toLowerCase() === baseName.toLowerCase())) {
      return baseName;
    }
    let n = 2;
    while (decks.some((d) => d.name.toLowerCase() === `${baseName} (${n})`.toLowerCase())) n++;
    return `${baseName} (${n})`;
  };

  const processImport = async (mode: "current" | "new") => {
    if (!pendingImport) return;
    const { filename, lines } = pendingImport;
    setPendingImport(null);
    setIsImporting(true);

    // Parse format headers from comment lines
    let importFormat: DeckFormat = "freeform";
    const commanderNames: string[] = [];

    for (const line of lines) {
      if (line.startsWith("// Format: Standard")) importFormat = "standard";
      else if (line.startsWith("// Format: Commander")) importFormat = "commander";
      else if (line.startsWith("// Commander: "))
        commanderNames.push(line.replace("// Commander: ", "").trim());
    }

    // Split lines into main deck and sideboard sections
    let inSideboard = false;
    const mainLines: string[] = [];
    const sideboardLines: string[] = [];

    for (const line of lines) {
      if (line.trim().toLowerCase() === "sideboard") {
        inSideboard = true;
        continue;
      }
      if (inSideboard) {
        sideboardLines.push(line);
      } else {
        mainLines.push(line);
      }
    }

    const parsedMain = parseLines(mainLines);
    const parsedSideboard = parseLines(sideboardLines);

    const fetchedDeckCards = await fetchCards(parsedMain);
    const fetchedSideboardCards =
      parsedSideboard.length > 0 ? await fetchCards(parsedSideboard) : [];

    if (mode === "new") {
      const uniqueName = getUniqueDeckName(filename);
      const commanderIds = commanderNames.length
        ? commanderNames
            .map((name) => fetchedDeckCards.find((c) => c.name === name)?.id)
            .filter(Boolean) as string[]
        : undefined;
      setPendingNewDeckData({
        name: uniqueName,
        cards: fetchedDeckCards,
        sideboard: fetchedSideboardCards.length > 0 ? fetchedSideboardCards : undefined,
        format: importFormat,
        commanderIds: commanderIds?.length ? commanderIds : undefined,
      });
      createNewDeck(importFormat);
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

        let newSideboard = deck.sideboard;
        if (fetchedSideboardCards.length > 0) {
          newSideboard = [...(deck.sideboard ?? [])];
          fetchedSideboardCards.forEach((fetchedCard) => {
            const existingIndex = newSideboard!.findIndex(
              (c) => c.name === fetchedCard.name,
            );
            if (existingIndex >= 0) {
              newSideboard![existingIndex] = {
                ...newSideboard![existingIndex],
                quantity:
                  newSideboard![existingIndex].quantity + fetchedCard.quantity,
              };
            } else {
              newSideboard!.push(fetchedCard);
            }
          });
        }

        return { ...deck, cards: newCards, sideboard: newSideboard };
      });
      setIsImporting(false);
    }
  };

  const cancelImport = () => setPendingImport(null);

  const directImportToCurrent = async (rawLines: string[]): Promise<number> => {
    if (!activeDeck) return 0;
    setIsImporting(true);
    let inSideboard = false;
    const mainLines: string[] = [];
    const sideboardLines: string[] = [];
    for (const line of rawLines) {
      if (line.trim().toLowerCase() === "sideboard") { inSideboard = true; continue; }
      if (inSideboard) sideboardLines.push(line);
      else mainLines.push(line);
    }
    const fetchedMain = await fetchCards(parseLines(mainLines));
    const fetchedSide = sideboardLines.length > 0 ? await fetchCards(parseLines(sideboardLines)) : [];
    updateActiveDeck((deck) => {
      const newCards = [...deck.cards];
      fetchedMain.forEach((fc) => {
        const idx = newCards.findIndex((c) => c.name === fc.name);
        if (idx >= 0) newCards[idx] = { ...newCards[idx], quantity: newCards[idx].quantity + fc.quantity };
        else newCards.push(fc);
      });
      let newSideboard = deck.sideboard;
      if (fetchedSide.length > 0) {
        newSideboard = [...(deck.sideboard ?? [])];
        fetchedSide.forEach((fc) => {
          const idx = newSideboard!.findIndex((c) => c.name === fc.name);
          if (idx >= 0) newSideboard![idx] = { ...newSideboard![idx], quantity: newSideboard![idx].quantity + fc.quantity };
          else newSideboard!.push(fc);
        });
      }
      return { ...deck, cards: newCards, sideboard: newSideboard };
    });
    setIsImporting(false);
    return fetchedMain.length + fetchedSide.length;
  };

  return {
    isImporting,
    pendingImport,
    exportDeck,
    handleImportFile,
    processImport,
    cancelImport,
    directImportToCurrent,
  };
}
