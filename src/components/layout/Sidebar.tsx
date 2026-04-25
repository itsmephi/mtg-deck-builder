"use client";

import { useState, useEffect } from "react";
import { Layers, PanelRightOpen, Settings, Home } from "lucide-react";
import { APP_VERSION } from "@/config/version";
import SidebarRail from "./SidebarRail";
import SidebarDecksTab from "./SidebarDecksTab";

interface Props {
  onImport: () => void;
  onExport: () => void;
  isImporting: boolean;
  onOpenSettings: (tab: "preferences" | "whatsnew" | "about" | "support") => void;
  showSettings?: boolean;
  onCloseSettings?: () => void;
  onGoHome: () => void;
  isOnHomeScreen: boolean;
}

export default function Sidebar({ onImport, onExport, isImporting, onOpenSettings, onCloseSettings, onGoHome, isOnHomeScreen }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("mtg-sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const expandTo = () => {
    setCollapsed(false);
    localStorage.setItem("mtg-sidebar-collapsed", "false");
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
        <SidebarRail expandTo={expandTo} onOpenSettings={onOpenSettings} onGoHome={onGoHome} isOnHomeScreen={isOnHomeScreen} />
      ) : (
        <div className="flex flex-col h-full min-w-0">
          {/* Tab bar — Decks only */}
          <div className="flex items-center shrink-0">
            <div className="flex items-center gap-1.5 flex-1 justify-center px-3 py-2.5 text-xs font-medium border-b border-transparent bg-surface-panel text-content-primary">
              <Layers className="w-3.5 h-3.5" />
              Decks
            </div>
            {isDesktop && (
              <button
                onClick={handleCollapse}
                className="px-2.5 py-2.5 bg-surface-deep border-b border-line-subtle text-content-muted hover:text-content-primary transition-colors shrink-0"
              >
                <PanelRightOpen className="w-4 h-4" />
              </button>
            )}
            {!isDesktop && (
              <button
                onClick={() => onOpenSettings("preferences")}
                className="w-9 h-9 flex items-center justify-center bg-surface-deep border-b border-line-subtle text-content-muted hover:text-content-primary transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <SidebarDecksTab
              onImport={onImport}
              onExport={onExport}
              isImporting={isImporting}
              onCloseSettings={onCloseSettings}
            />
          </div>

          <div className="mt-auto border-t border-line-subtle shrink-0">
            <div className="flex items-center gap-2 px-3 py-2">
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
