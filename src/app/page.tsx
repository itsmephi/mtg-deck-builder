"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Workspace from "@/components/workspace/Workspace";
import SettingsView from "@/components/workspace/SettingsView";
import HomeScreen from "@/components/home/HomeScreen";
import DropOverlay from "@/components/layout/DropOverlay";
import { useDeckImportExport, parseDroppedText } from "@/hooks/useDeckImportExport";
import { useDeckManager } from "@/hooks/useDeckManager";
import { TILE_SIZE_STOPS, TileSizeKey, DEFAULT_TILE_SIZE, TILE_SIZE_STORAGE_KEY } from "@/config/gridConfig";
import { searchCardsForDrop, lookupSetCode, lookupCardFuzzy, searchCards, getCardByTcgplayerId } from "@/lib/scryfall";

// TCGPlayer appends variant/treatment words to slugs that are NOT part of the card name.
const SLUG_TREATMENT_SINGLES = new Set([
  "borderless", "foil", "showcase", "etched", "promo", "serialized",
  "retro", "bundle", "prerelease", "galaxy", "halo", "surge", "gilded",
  "confetti", "textured", "collector",
]);
const SLUG_TREATMENT_PAIRS = new Set([
  "extended art", "full art", "alt art", "surge foil", "gilded foil",
  "textured foil", "halo foil", "galaxy foil", "step compleat",
]);

export default function Dashboard() {
  const {
    exportDeck,
    handleImportFile,
    isImporting,
    pendingImport,
    processImport,
    cancelImport,
    directImportToCurrent,
  } = useDeckImportExport();

  const {
    activeDeck,
    decks,
    setActiveDeckId,
    createNewDeck,
    createNamedDeck,
    addCardToSpecificDeck,
    removeCardFromDeckById,
    deleteDeck,
    setLastAddedId,
    deckViewMode,
    updateActiveDeck,
  } = useDeckManager();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardPreviewFnRef = useRef<((name: string, setCode?: string) => void) | null>(null);
  const isFindBarActiveRef = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastAction, setToastAction] = useState<{ label: string; onAction: () => void } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"preferences" | "whatsnew" | "about" | "support">("preferences");
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepthRef = useRef(0);
  const [tileSize, setTileSizeState] = useState<TileSizeKey>(DEFAULT_TILE_SIZE);

  const showToast = useCallback((message: string, durationMs = 2000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    setToastAction(null);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), durationMs);
  }, []);

  const showUndoToast = useCallback((message: string, onUndo: () => void) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    setToastAction({ label: "Undo", onAction: onUndo });
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      setToastAction(null);
    }, 4000);
  }, []);

  const openSettings = (tab: "preferences" | "whatsnew" | "about" | "support") => {
    setSettingsTab(tab);
    setShowSettings(true);
  };

  // Restore persisted preferences + clean up stale search-workspace keys
  useEffect(() => {
    const storedTile = localStorage.getItem(TILE_SIZE_STORAGE_KEY) as TileSizeKey | null;
    if (storedTile && TILE_SIZE_STOPS.some((s) => s.key === storedTile)) setTileSizeState(storedTile);

    // Remove stale keys from the old search workspace
    const staleKeys = [
      "mtg-search-view-mode",
      "mtg-search-sort-direction",
      "mtg-sidebar-active-tab",
      "mtg-sidebar-filters",
      "mtg-search-filter-active",
    ];
    staleKeys.forEach((k) => localStorage.removeItem(k));
    // Per-deck filter active keys
    const perDeckKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("mtg-search-filter-active-")) perDeckKeys.push(k);
    }
    perDeckKeys.forEach((k) => localStorage.removeItem(k));
  }, []);

  const addDroppedCardToDeck = useCallback(async (initialCard: import("@/types").ScryfallCard) => {
    let card = initialCard;
    if (!card.prices.usd || card.prices.usd === "0.00") {
      const rescueResults = await searchCards(`!"${card.name}" order:usd`);
      if (rescueResults.length > 0 && rescueResults[0].prices.usd && rescueResults[0].prices.usd !== "0.00") {
        card = { ...rescueResults[0], id: initialCard.id };
      }
    }

    const currentActiveDeck = activeDeck;
    let targetDeckId: string;
    let wasAutoCreatedDeck = false;

    if (currentActiveDeck) {
      targetDeckId = currentActiveDeck.id;
    } else {
      targetDeckId = createNamedDeck(`${card.name} Deck`, "freeform");
      wasAutoCreatedDeck = true;
    }

    const targetPool: "main" | "sideboard" = deckViewMode === "sideboard" ? "sideboard" : "main";
    const targetDeck = decks.find((d) => d.id === targetDeckId);
    const poolCards = targetPool === "sideboard" ? (targetDeck?.sideboard ?? []) : (targetDeck?.cards ?? []);
    const wasExistingCard = poolCards.some((c) => c.id === card.id);

    addCardToSpecificDeck(targetDeckId, card, targetPool);
    setLastAddedId(card.id);

    const cardNameDisplay = card.name;
    showUndoToast(`Added ${cardNameDisplay}`, () => {
      if (wasAutoCreatedDeck) {
        deleteDeck(targetDeckId);
        setActiveDeckId(null);
      } else {
        removeCardFromDeckById(targetDeckId, card.id, targetPool, wasExistingCard);
      }
      showToast(`Removed ${cardNameDisplay}`);
    });
  }, [
    activeDeck,
    decks,
    deckViewMode,
    showToast,
    showUndoToast,
    createNamedDeck,
    addCardToSpecificDeck,
    removeCardFromDeckById,
    deleteDeck,
    setActiveDeckId,
    setLastAddedId,
  ]);

  const handleTCGPlayerDrop = useCallback(async (url: string) => {
    // Phase 1: try exact variant via TCGPlayer product ID
    const productIdMatch = url.match(/tcgplayer\.com\/product\/(\d+)\//);
    if (productIdMatch) {
      const card = await getCardByTcgplayerId(productIdMatch[1]);
      if (card) {
        await addDroppedCardToDeck(card);
        return;
      }
      // null = 404 or network error — fall through to slug-based resolution
    }

    const tcgMatch = url.match(/tcgplayer\.com\/product\/\d+\/([^?#/]+)/);
    if (!tcgMatch) {
      showToast("Card not found from dropped URL");
      return;
    }

    const slug = tcgMatch[1];
    if (!slug.startsWith("magic-")) {
      showToast("Card not found from dropped URL");
      return;
    }

    const rest = slug.slice("magic-".length);
    const parts = rest.split("-").filter(Boolean);
    if (parts.length === 0) {
      showToast("Card not found from dropped URL");
      return;
    }

    let setCode: string | null = null;
    let cardNameParts: string[] = parts;
    for (let i = 1; i < parts.length; i++) {
      const candidateSetName = parts.slice(0, i).join(" ");
      const setResult = await lookupSetCode(candidateSetName);
      if (setResult) {
        setCode = setResult.code;
        cardNameParts = parts.slice(i);
      }
    }

    if (cardNameParts.length === 0) {
      showToast("Card not found from dropped URL");
      return;
    }

    const toTitleCase = (words: string[]) =>
      words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    let strippedParts = [...cardNameParts];
    let stripped = true;
    while (stripped && strippedParts.length > 1) {
      stripped = false;
      const last = strippedParts[strippedParts.length - 1];
      if (SLUG_TREATMENT_SINGLES.has(last)) {
        strippedParts = strippedParts.slice(0, -1);
        stripped = true;
        continue;
      }
      if (strippedParts.length >= 2) {
        const lastTwo = strippedParts.slice(-2).join(" ");
        if (SLUG_TREATMENT_PAIRS.has(lastTwo)) {
          strippedParts = strippedParts.slice(0, -2);
          stripped = true;
        }
      }
    }
    const cardName = toTitleCase(strippedParts);

    let results;
    try {
      results = setCode
        ? await searchCardsForDrop(`!"${cardName}" set:${setCode}`)
        : await searchCardsForDrop(`!"${cardName}"`);
      if (results.length === 0 && setCode) {
        results = await searchCardsForDrop(`!"${cardName}"`);
      }
      if (results.length === 0 && !setCode && cardNameParts.length > 1) {
        for (let n = cardNameParts.length - 1; n >= 1 && results.length === 0; n--) {
          const shortName = toTitleCase(cardNameParts.slice(cardNameParts.length - n));
          results = await searchCardsForDrop(`!"${shortName}"`);
        }
      }
      if (results.length === 0) {
        const fuzzy = await lookupCardFuzzy(cardName);
        if (fuzzy) results = [fuzzy];
      }
    } catch {
      showToast("Could not reach Scryfall. Try again.");
      return;
    }

    if (results.length === 0) {
      showToast(`Card not found: ${cardName}`);
      return;
    }

    const card = results.find((c) => c.name.toLowerCase() === cardName.toLowerCase()) ?? results[0];
    await addDroppedCardToDeck(card);
  }, [addDroppedCardToDeck, showToast]);

  const handleTextCapture = useCallback(async (text: string) => {
    const parsed = parseDroppedText(text);
    if (parsed.type === "unknown") {
      showToast("Couldn't read that as a card or decklist.");
      return;
    }
    if (parsed.type === "decklist") {
      if (!activeDeck) { showToast("Open a deck first to add cards."); return; }
      const count = await directImportToCurrent(parsed.rawLines);
      showToast(count > 0 ? `Added ${count} card${count === 1 ? "" : "s"} to deck` : "No cards found in that decklist.");
      return;
    }
    if (parsed.type === "direct-add") {
      if (!activeDeck) {
        showToast("Open a deck first to add cards.");
        return;
      }
      let card;
      try {
        const results = await searchCards(`!"${parsed.name}"`);
        if (!results.length) {
          const fuzzy = await lookupCardFuzzy(parsed.name);
          if (!fuzzy) { showToast(`Couldn't find "${parsed.name}".`); return; }
          card = fuzzy;
        } else {
          card = results[0];
        }
        if (!card.prices.usd || card.prices.usd === "0.00") {
          const rescue = await searchCards(`!"${card.name}" order:usd`);
          if (rescue.length > 0 && rescue[0].prices.usd && rescue[0].prices.usd !== "0.00") {
            card = { ...rescue[0], id: card.id };
          }
        }
      } catch {
        showToast("Could not reach Scryfall. Try again.");
        return;
      }
      const { qty } = parsed;
      const existing = activeDeck.cards.find((c) => c.id === card.id);
      const prevQty = existing?.quantity ?? 0;
      updateActiveDeck((deck) => ({
        ...deck,
        cards: existing
          ? deck.cards.map((c) => c.id === card.id ? { ...c, quantity: c.quantity + qty } : c)
          : [...deck.cards, { ...card, quantity: qty, ownedQty: 0, isOwned: false }],
      }));
      setLastAddedId(card.id);
      showUndoToast(`Added ${qty > 1 ? `${qty}× ` : ""}${card.name}`, () => {
        updateActiveDeck((deck) => ({
          ...deck,
          cards: prevQty === 0
            ? deck.cards.filter((c) => c.id !== card.id)
            : deck.cards.map((c) => c.id === card.id ? { ...c, quantity: prevQty } : c),
        }));
        showToast(`Removed ${card.name}`);
      });
      return;
    }
    // single → FindByNameBar preview
    if (!cardPreviewFnRef.current) {
      showToast(`Couldn't find "${parsed.name}".`);
      return;
    }
    cardPreviewFnRef.current(parsed.name, parsed.setCode);
  }, [showToast, directImportToCurrent, activeDeck, updateActiveDeck, setLastAddedId, showUndoToast]);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      const types = e.dataTransfer?.types ?? [];
      if (!types.includes("text/uri-list") && !types.includes("text/plain")) return;
      dragDepthRef.current += 1;
      if (dragDepthRef.current === 1) setIsDragActive(true);
    };
    const handleDragLeave = () => {
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) setIsDragActive(false);
    };
    const handleDragOver = (e: DragEvent) => { e.preventDefault(); };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragDepthRef.current = 0;
      setIsDragActive(false);
      const uriList = e.dataTransfer?.getData("text/uri-list") ?? "";
      const plainText = e.dataTransfer?.getData("text/plain") ?? "";
      if (uriList.trim()) {
        handleTCGPlayerDrop(uriList.trim());
      } else if (plainText.trim()) {
        handleTextCapture(plainText.trim());
      } else {
        showToast("Card not found from dropped URL");
      }
    };
    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleTCGPlayerDrop, handleTextCapture, showToast]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (pendingImport !== null) return;
      if (isFindBarActiveRef.current) return;
      const el = document.activeElement as HTMLElement | null;
      if (!el) return;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (el.isContentEditable) return;
      const text = e.clipboardData?.getData("text/plain") ?? "";
      if (!text.trim()) return;
      e.preventDefault();
      handleTextCapture(text.trim());
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handleTextCapture, pendingImport]);

  const setTileSize = (s: TileSizeKey) => {
    setTileSizeState(s);
    localStorage.setItem(TILE_SIZE_STORAGE_KEY, s);
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-heading flex flex-col md:flex-row overflow-hidden font-sans">
      <Sidebar
        onImport={() => fileInputRef.current?.click()}
        onExport={exportDeck}
        isImporting={isImporting}
        onOpenSettings={openSettings}
        showSettings={showSettings}
        onCloseSettings={() => setShowSettings(false)}
        onGoHome={() => { setActiveDeckId(null); setShowSettings(false); }}
        isOnHomeScreen={!activeDeck && !showSettings}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleImportFile(e, fileInputRef)}
        className="hidden"
        accept=".txt"
      />

      <main className="flex-1 h-[60vh] md:h-screen flex flex-col overflow-hidden">
        {showSettings ? (
          <SettingsView
            activeTab={settingsTab}
            onTabChange={setSettingsTab}
            onClose={() => setShowSettings(false)}
            showToast={showToast}
          />
        ) : !activeDeck ? (
          <HomeScreen
            decks={decks}
            onDeckSelect={(id) => { setActiveDeckId(id); }}
            onCreateDeck={(format) => { createNewDeck(format); }}
          />
        ) : (
          <div className="flex-1 overflow-hidden p-4">
            <Workspace
              pendingImport={pendingImport}
              processImport={processImport}
              cancelImport={cancelImport}
              tileSize={tileSize}
              onTileSizeChange={setTileSize}
              showToast={showToast}
              registerCardPreviewFn={(fn) => { cardPreviewFnRef.current = fn; }}
              onFindBarActiveChange={(active) => { isFindBarActiveRef.current = active; }}
            />
          </div>
        )}
      </main>

      <DropOverlay visible={isDragActive} />

      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-surface-raised border border-line-default rounded-full text-xs text-content-heading shadow-lg flex items-center gap-3">
          <span>{toastMessage}</span>
          {toastAction && (
            <button
              onClick={() => {
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                setToastMessage(null);
                setToastAction(null);
                toastAction.onAction();
              }}
              className="text-blue-400 font-semibold hover:opacity-75 transition-opacity"
            >
              {toastAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
