"use client";

import { useRef, useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Workspace from "@/components/workspace/Workspace";
import SearchWorkspace from "@/components/workspace/SearchWorkspace";
import SettingsView from "@/components/workspace/SettingsView";
import HomeScreen from "@/components/home/HomeScreen";
import { useDeckImportExport } from "@/hooks/useDeckImportExport";
import { useDeckManager } from "@/hooks/useDeckManager";
import { FilterState, DEFAULT_FILTERS, SIDEBAR_FILTERS_STORAGE_KEY, serializeFilters, deserializeFilters } from "@/components/layout/FilterPanel";
import { TILE_SIZE_STOPS, TileSizeKey, DEFAULT_TILE_SIZE, TILE_SIZE_STORAGE_KEY } from "@/config/gridConfig";

export default function Dashboard() {
  const {
    exportDeck,
    handleImportFile,
    isImporting,
    pendingImport,
    processImport,
    cancelImport,
  } = useDeckImportExport();

  const { activeDeck, decks, setActiveDeckId, createNewDeck } = useDeckManager();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"search" | "decks">("search");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"preferences" | "whatsnew" | "about" | "support">("preferences");

  const openSettings = (tab: "preferences" | "whatsnew" | "about" | "support") => {
    setSettingsTab(tab);
    setShowSettings(true);
  };
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const [activeChipQuery, setActiveChipQuery] = useState<string | null>(null);
  const [sidebarFilters, setSidebarFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [tileSize, setTileSizeState] = useState<TileSizeKey>(DEFAULT_TILE_SIZE);
  const [showSearchTakeover, setShowSearchTakeover] = useState(false);

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
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
