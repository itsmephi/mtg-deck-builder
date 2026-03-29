"use client";

import { useState, useEffect } from "react";
import { Search, Layers, PanelRightOpen, Settings, Home } from "lucide-react";
import { APP_VERSION } from "@/config/version";
import SidebarRail from "./SidebarRail";
import SidebarSearchTab from "./SidebarSearchTab";
import SidebarDecksTab from "./SidebarDecksTab";
import { FilterState } from "./FilterPanel";

interface Props {
  onImport: () => void;
  onExport: () => void;
  isImporting: boolean;
  activeTab: "search" | "decks";
  onTabChange: (tab: "search" | "decks") => void;
  activeChipId: string | null;
  onChipSelect: (id: string, query: string) => void;
  sidebarFilters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onOpenSettings: (tab: "preferences" | "whatsnew" | "about" | "support") => void;
  showSettings?: boolean;
  onCloseSettings?: () => void;
  onGoHome: () => void;
  isOnHomeScreen: boolean;
}

export default function Sidebar({ onImport, onExport, isImporting, activeTab, onTabChange, activeChipId, onChipSelect, sidebarFilters, onFiltersChange, onOpenSettings, onCloseSettings, onGoHome, isOnHomeScreen }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Responsive detection
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load persisted state
  useEffect(() => {
    const stored = localStorage.getItem("mtg-sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const expandTo = (tab: "search" | "decks") => {
    setCollapsed(false);
    onTabChange(tab);
    localStorage.setItem("mtg-sidebar-collapsed", "false");
    onCloseSettings?.();
  };

  const handleTabClick = (tab: "search" | "decks") => {
    onTabChange(tab);
    onCloseSettings?.();
  };

  const handleCollapse = () => {
    setCollapsed(true);
    localStorage.setItem("mtg-sidebar-collapsed", "true");
  };

  const isCollapsed = isDesktop && collapsed;

  return (
    <aside
      className={`h-[40vh] md:h-screen border-b md:border-b-0 md:border-r border-line-panel bg-surface-panel flex flex-col ${isCollapsed ? "overflow-visible" : "overflow-hidden"}`}
      style={
        isDesktop
          ? {
              width: isCollapsed ? 48 : 256,
              transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            }
          : { width: "100%" }
      }
    >
      {isCollapsed ? (
        <SidebarRail expandTo={expandTo} onTabChange={onTabChange} activeTab={activeTab} onOpenSettings={onOpenSettings} onGoHome={onGoHome} isOnHomeScreen={isOnHomeScreen} />
      ) : (
        <div className="flex flex-col h-full min-w-0">
          {/* Tab bar */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => handleTabClick("search")}
              className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2.5 text-xs font-medium border-b transition-colors ${
                activeTab === "search"
                  ? "bg-surface-panel text-content-primary border-transparent"
                  : "bg-surface-deep text-content-muted border-line-subtle hover:bg-surface-panel hover:text-content-secondary"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Search
            </button>
            <button
              onClick={() => handleTabClick("decks")}
              className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2.5 text-xs font-medium border-b transition-colors ${
                activeTab === "decks"
                  ? "bg-surface-panel text-content-primary border-transparent"
                  : "bg-surface-deep text-content-muted border-line-subtle hover:bg-surface-panel hover:text-content-secondary"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Decks
            </button>
            {/* Collapse icon — desktop only */}
            {isDesktop && (
              <button
                onClick={handleCollapse}
                className="px-2.5 py-2.5 bg-surface-deep border-b border-line-subtle text-content-muted hover:text-content-primary transition-colors shrink-0"
              >
                <PanelRightOpen className="w-4 h-4" />
              </button>
            )}
            {/* Settings gear — mobile only */}
            {!isDesktop && (
              <button
                onClick={() => onOpenSettings("preferences")}
                className="w-9 h-9 flex items-center justify-center bg-surface-deep border-b border-line-subtle text-content-muted hover:text-content-primary transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "search" ? (
              <SidebarSearchTab
                activeChipId={activeChipId}
                onSelectChip={onChipSelect}
                filters={sidebarFilters}
                onFiltersChange={onFiltersChange}
              />
            ) : (
              <SidebarDecksTab
                onImport={onImport}
                onExport={onExport}
                isImporting={isImporting}
                onCloseSettings={onCloseSettings}
              />
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto border-t border-line-subtle shrink-0">
            <div className="flex items-center gap-2 px-3 py-2">

              {/* Home icon */}
              <button
                onClick={isOnHomeScreen ? undefined : onGoHome}
                className={`
                  w-7 h-7 rounded-md flex items-center justify-center transition-colors
                  ${isOnHomeScreen
                    ? "text-content-disabled cursor-default"
                    : "text-content-muted hover:text-content-primary hover:bg-surface-raised"
                  }
                `}
                title="Home"
              >
                <Home className="w-3.5 h-3.5" />
              </button>

              {/* Version badge */}
              <button
                onClick={() => onOpenSettings("whatsnew")}
                className="flex items-center gap-1.5 px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
              >
                v{APP_VERSION}
              </button>

            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
