"use client";

import { useState, useEffect } from "react";
import { Search, Layers, PanelRightOpen, Coffee, Settings, ArrowUp, ArrowDown } from "lucide-react";
import { APP_VERSION, CURRENT_CHANGELOG } from "@/config/version";
import SidebarRail from "./SidebarRail";
import SidebarSearchTab from "./SidebarSearchTab";
import SidebarDecksTab from "./SidebarDecksTab";
import { useDeckManager, SortBy, SortDir } from "@/hooks/useDeckManager";
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
}

export default function Sidebar({ onImport, onExport, isImporting, activeTab, onTabChange, activeChipId, onChipSelect, sidebarFilters, onFiltersChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const { showThumbnail, setShowThumbnail, sortBy, setSortBy, sortDir, setSortDir } =
    useDeckManager();

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
  };

  const handleCollapse = () => {
    setCollapsed(true);
    localStorage.setItem("mtg-sidebar-collapsed", "true");
  };

  const isCollapsed = isDesktop && collapsed;

  return (
    <aside
      className={`h-[40vh] md:h-screen border-b md:border-b-0 md:border-r border-subtle bg-surface-base flex flex-col ${isCollapsed ? "overflow-visible" : "overflow-hidden"}`}
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
        <SidebarRail expandTo={expandTo} activeTab={activeTab} />
      ) : (
        <div className="flex flex-col h-full min-w-0">
          {/* Tab bar */}
          <div className="flex items-center border-b border-subtle shrink-0">
            <button
              onClick={() => onTabChange("search")}
              className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "search"
                  ? "text-blue-400 border-blue-500"
                  : "text-muted border-transparent hover:text-secondary"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Search
            </button>
            <button
              onClick={() => onTabChange("decks")}
              className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "decks"
                  ? "text-blue-400 border-blue-500"
                  : "text-muted border-transparent hover:text-secondary"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Decks
            </button>
            {/* Collapse icon — desktop only */}
            {isDesktop && (
              <button
                onClick={handleCollapse}
                className="px-2.5 py-2.5 text-muted hover:text-primary transition-colors shrink-0"
              >
                <PanelRightOpen className="w-4 h-4" />
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
              />
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto border-t border-subtle bg-neutral-900/50 shrink-0">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsChangelogOpen(!isChangelogOpen)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors ${
                    isChangelogOpen
                      ? "bg-blue-500/30 border-blue-400 text-blue-100"
                      : "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                  }`}
                >
                  v{APP_VERSION}
                </button>
                <a
                  href="https://www.buymeacoffee.com/itsmephi"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Support our Project"
                  className="p-1 text-muted hover:text-yellow-400 transition-colors"
                >
                  <Coffee className="w-3.5 h-3.5" />
                </a>
              </div>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-1 rounded transition-colors ${
                  isSettingsOpen ? "text-primary" : "text-faint hover:text-secondary"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            {isChangelogOpen && (
              <div className="px-3 pb-3 pt-1 border-t border-neutral-800/50">
                <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-2">
                  What&apos;s New in v{APP_VERSION}
                </p>
                <ul className="text-[10px] text-tertiary leading-relaxed max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                  {CURRENT_CHANGELOG.map((item, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="shrink-0 mt-px">–</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isSettingsOpen && (
              <div className="px-4 pb-3 pt-1 border-t border-neutral-800/50">
                <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-3">
                  Settings
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-tertiary">Card Preview</span>
                  <button
                    onClick={() => setShowThumbnail(!showThumbnail)}
                    className={`relative w-8 h-4 rounded-full transition-colors ${
                      showThumbnail ? "bg-blue-500" : "bg-surface-overlay"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                        showThumbnail ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-tertiary">Sort By</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="bg-surface-raised border border-default text-xs text-secondary rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                  >
                    <option value="original">Original</option>
                    <option value="name">Name</option>
                    <option value="color">Color</option>
                    <option value="mv">Mana Value</option>
                  </select>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-tertiary">Direction</span>
                  <button
                    onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
                    disabled={sortBy === "original"}
                    className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded border transition-colors ${
                      sortBy === "original"
                        ? "text-faint border-subtle cursor-not-allowed"
                        : "text-secondary border-default hover:text-primary hover:border-neutral-500"
                    }`}
                  >
                    {sortDir === "asc" ? (
                      <>
                        <ArrowUp className="w-3 h-3" /> Asc
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-3 h-3" /> Desc
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
