"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Workspace from "@/components/workspace/Workspace";
import SearchWorkspace from "@/components/workspace/SearchWorkspace";
import SettingsView from "@/components/workspace/SettingsView";
import HomeScreen from "@/components/home/HomeScreen";
import DropOverlay from "@/components/layout/DropOverlay";
import { useDeckImportExport } from "@/hooks/useDeckImportExport";
import { useDeckManager } from "@/hooks/useDeckManager";
import { FilterState, DEFAULT_FILTERS, SIDEBAR_FILTERS_STORAGE_KEY, serializeFilters, deserializeFilters } from "@/components/layout/FilterPanel";
import { TILE_SIZE_STOPS, TileSizeKey, DEFAULT_TILE_SIZE, TILE_SIZE_STORAGE_KEY } from "@/config/gridConfig";
import { searchCardsForDrop, lookupSetCode, lookupCardFuzzy, searchCards } from "@/lib/scryfall";

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
  } = useDeckManager();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastAction, setToastAction] = useState<{ label: string; onAction: () => void } | null>(null);
  const [activeTab, setActiveTab] = useState<"search" | "decks">("search");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"preferences" | "whatsnew" | "about" | "support">("preferences");
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepthRef = useRef(0);

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
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const [activeChipQuery, setActiveChipQuery] = useState<string | null>(null);
  const [sidebarFilters, setSidebarFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [tileSize, setTileSizeState] = useState<TileSizeKey>(DEFAULT_TILE_SIZE);
  const [showSearchTakeover, setShowSearchTakeover] = useState(false);
  const [pendingSearch, setPendingSearch] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("mtg-sidebar-active-tab");
    if (stored === "search" || stored === "decks") setActiveTab(stored);
    const storedTile = localStorage.getItem(TILE_SIZE_STORAGE_KEY) as TileSizeKey | null;
    if (storedTile && TILE_SIZE_STOPS.some((s) => s.key === storedTile)) setTileSizeState(storedTile);
    const storedFilters = localStorage.getItem(SIDEBAR_FILTERS_STORAGE_KEY);
    if (storedFilters) setSidebarFilters(deserializeFilters(storedFilters));
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_FILTERS_STORAGE_KEY, serializeFilters(sidebarFilters));
  }, [sidebarFilters]);

  useEffect(() => {
    setShowSearchTakeover(false);
  }, [activeDeck?.id]);

  const handleTCGPlayerDrop = useCallback(async (url: string) => {
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

    // Greedy set identification: try progressively longer prefixes
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

    // Strip trailing TCGPlayer variant/treatment words (e.g. "borderless", "foil", "extended art")
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
      // Fallback: if set-specific search returned nothing, try without set
      if (results.length === 0 && setCode) {
        results = await searchCardsForDrop(`!"${cardName}"`);
      }
      // Fallback: if no set match and exact name failed, try shorter card name guesses
      if (results.length === 0 && !setCode && cardNameParts.length > 1) {
        for (let n = cardNameParts.length - 1; n >= 1 && results.length === 0; n--) {
          const shortName = toTitleCase(cardNameParts.slice(cardNameParts.length - n));
          results = await searchCardsForDrop(`!"${shortName}"`);
        }
      }
      // Final fallback: fuzzy name search — handles article differences ("The X" vs "X"),
      // minor name discrepancies, and slugs where set detection produced a slightly wrong split
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

    // Prefer exact name match, then first result
    let card = results.find((c) => c.name.toLowerCase() === cardName.toLowerCase()) ?? results[0];

    // Price rescue
    if (!card.prices.usd || card.prices.usd === "0.00") {
      const rescueResults = await searchCards(`!"${card.name}" order:usd`);
      if (rescueResults.length > 0 && rescueResults[0].prices.usd && rescueResults[0].prices.usd !== "0.00") {
        card = { ...rescueResults[0], id: card.id };
      }
    }

    // Determine target deck
    const currentActiveDeck = activeDeck;
    let targetDeckId: string;
    let wasAutoCreatedDeck = false;

    if (currentActiveDeck) {
      targetDeckId = currentActiveDeck.id;
    } else {
      targetDeckId = createNamedDeck(`${card.name} Deck`, "freeform");
      wasAutoCreatedDeck = true;
    }

    // Determine pool
    const targetPool: "main" | "sideboard" = deckViewMode === "sideboard" ? "sideboard" : "main";

    // Check if card already exists in the pool (for undo logic)
    const targetDeck = decks.find((d) => d.id === targetDeckId);
    const poolCards = targetPool === "sideboard"
      ? (targetDeck?.sideboard ?? [])
      : (targetDeck?.cards ?? []);
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

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragDepthRef.current = 0;
      setIsDragActive(false);

      const url =
        e.dataTransfer?.getData("text/uri-list") ||
        e.dataTransfer?.getData("text/plain") ||
        "";

      if (!url.trim()) {
        showToast("Card not found from dropped URL");
        return;
      }

      handleTCGPlayerDrop(url.trim());
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
  }, [handleTCGPlayerDrop, showToast]);

  const setTileSize = (s: TileSizeKey) => {
    setTileSizeState(s);
    localStorage.setItem(TILE_SIZE_STORAGE_KEY, s);
  };

  const handleTabChange = (tab: "search" | "decks") => {
    setActiveTab(tab);
    localStorage.setItem("mtg-sidebar-active-tab", tab);
  };

  const handleChipSelect = (id: string, query: string) => {
    if (activeChipId === id) {
      setActiveChipId(null);
      setActiveChipQuery(null);
    } else {
      setActiveChipId(id);
      setActiveChipQuery(query);
    }
  };

  const handleDeactivateChip = () => {
    setActiveChipId(null);
    setActiveChipQuery(null);
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-heading flex flex-col md:flex-row overflow-hidden font-sans">
      <Sidebar
        onImport={() => fileInputRef.current?.click()}
        onExport={exportDeck}
        isImporting={isImporting}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeChipId={activeChipId}
        onChipSelect={handleChipSelect}
        sidebarFilters={sidebarFilters}
        onFiltersChange={setSidebarFilters}
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
            onDeckSelect={(id) => { setActiveDeckId(id); handleTabChange("decks"); }}
            onCreateDeck={(format) => { createNewDeck(format); handleTabChange("decks"); }}
          />
        ) : (
          <>
            <div className={activeTab === "search" ? "flex-1 flex flex-col overflow-hidden" : "hidden"}>
              <SearchWorkspace
                isActive={activeTab === "search"}
                activeChipQuery={activeChipQuery}
                onDeactivateChip={handleDeactivateChip}
                sidebarFilters={sidebarFilters}
                tileSize={tileSize}
                onTileSizeChange={setTileSize}
                showSearchTakeover={showSearchTakeover}
                onDismissTakeover={() => setShowSearchTakeover(false)}
                triggerSearch={pendingSearch}
                onTriggerSearchConsumed={() => setPendingSearch(null)}
                showToast={showToast}
              />
            </div>
            <div className={activeTab === "decks" ? "flex-1 overflow-hidden p-4" : "hidden"}>
              <Workspace
                pendingImport={pendingImport}
                processImport={processImport}
                cancelImport={cancelImport}
                tileSize={tileSize}
                onTileSizeChange={setTileSize}
                onAddFirstCard={() => {
                  handleTabChange("search");
                  setShowSearchTakeover(true);
                }}
                onSearchQuery={(q) => {
                  setPendingSearch(q);
                  handleTabChange("search");
                }}
              />
            </div>
          </>
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
