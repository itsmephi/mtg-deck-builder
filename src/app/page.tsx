"use client";

import { useRef, useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Workspace from "@/components/workspace/Workspace";
import SearchWorkspace from "@/components/workspace/SearchWorkspace";
import { useDeckImportExport } from "@/hooks/useDeckImportExport";
import { FilterState, DEFAULT_FILTERS } from "@/components/layout/FilterPanel";

export default function Dashboard() {
  const {
    exportDeck,
    handleImportFile,
    isImporting,
    pendingImport,
    processImport,
    cancelImport,
  } = useDeckImportExport();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"search" | "decks">("search");
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const [activeChipQuery, setActiveChipQuery] = useState<string | null>(null);
  const [sidebarFilters, setSidebarFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    const stored = localStorage.getItem("mtg-sidebar-active-tab");
    if (stored === "search" || stored === "decks") setActiveTab(stored);
  }, []);

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
    <div className="min-h-screen bg-neutral-900 text-neutral-200 flex flex-col md:flex-row overflow-hidden font-sans">
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
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleImportFile(e, fileInputRef)}
        className="hidden"
        accept=".txt"
      />

      <main className="flex-1 h-[60vh] md:h-screen flex flex-col overflow-hidden">
        <div className={activeTab === "search" ? "flex-1 flex flex-col overflow-hidden" : "hidden"}>
          <SearchWorkspace
            isActive={activeTab === "search"}
            activeChipQuery={activeChipQuery}
            onDeactivateChip={handleDeactivateChip}
            sidebarFilters={sidebarFilters}
          />
        </div>
        <div className={activeTab === "decks" ? "flex-1 overflow-hidden p-4 md:p-8" : "hidden"}>
          <Workspace
            pendingImport={pendingImport}
            processImport={processImport}
            cancelImport={cancelImport}
          />
        </div>
      </main>
    </div>
  );
}
