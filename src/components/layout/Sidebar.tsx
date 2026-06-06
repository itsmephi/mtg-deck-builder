"use client";

import { useState, useEffect } from "react";
import { Layers, PanelRightOpen, Settings, Home, PanelLeftClose } from "lucide-react";
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
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ onImport, onExport, isImporting, onOpenSettings, onCloseSettings, onGoHome, isOnHomeScreen, mobileOpen, onMobileClose }: Props) {
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
    <>
      {/* Mobile backdrop — only rendered below md, fades with the drawer.
          z-[80] clears the persistent workspace chrome (search bar z-[60],
          price badges z-[50]) but stays below the z-[100] modals/dialogs. */}
      <div
        className={`fixed inset-0 z-[80] bg-black/50 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />
      <aside
        className={`
          bg-surface-panel border-line-panel flex flex-col overflow-hidden
          fixed inset-y-0 left-0 z-[90] w-[82vw] max-w-[320px] border-r shadow-2xl
          transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:z-auto md:h-screen md:w-auto md:max-w-none md:translate-x-0 md:shadow-none
          ${isCollapsed ? "md:overflow-visible" : "md:overflow-hidden"}
        `}
        style={
          isDesktop
            ? {
                width: isCollapsed ? 48 : 256,
                transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              }
            : undefined
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
                onClick={onMobileClose}
                aria-label="Close menu"
                className="w-9 h-9 flex items-center justify-center bg-surface-deep border-b border-line-subtle text-content-muted hover:text-content-primary transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <SidebarDecksTab
              onImport={onImport}
              onExport={onExport}
              isImporting={isImporting}
              onCloseSettings={onCloseSettings}
              onNavigate={onMobileClose}
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
              {!isDesktop && (
                <button
                  onClick={() => onOpenSettings("preferences")}
                  className="ml-auto w-7 h-7 rounded-md flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface-raised transition-colors"
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </aside>
    </>
  );
}
