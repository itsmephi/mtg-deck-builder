"use client";

import { useRef, useState, useEffect } from "react";
import { Layers, Coffee, Settings, Plus, PanelLeftOpen, Home } from "lucide-react";
import { useDeckManager } from "@/hooks/useDeckManager";
import { FormatPicker } from "@/components/layout/FormatPicker";
import { DeckFormat } from "@/lib/formatRules";

interface Props {
  expandTo: () => void;
  onOpenSettings: (tab: "preferences" | "whatsnew" | "about" | "support") => void;
  onGoHome: () => void;
  isOnHomeScreen: boolean;
}

function RailTooltip({ label }: { label: string }) {
  return (
    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-surface-raised border border-line-default text-content-heading text-[10px] font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
      {label}
    </span>
  );
}

export default function SidebarRail({ expandTo, onOpenSettings, onGoHome, isOnHomeScreen }: Props) {
  const { createNewDeck, setDeckViewMode } = useDeckManager();
  const [railPickerOpen, setRailPickerOpen] = useState(false);
  const railPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!railPickerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (railPickerRef.current && !railPickerRef.current.contains(e.target as Node)) {
        setRailPickerOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setRailPickerOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [railPickerOpen]);

  const handleNewDeck = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRailPickerOpen(true);
  };

  const handleRailFormatSelect = (format: DeckFormat) => {
    createNewDeck(format);
    setDeckViewMode("main");
    setRailPickerOpen(false);
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      expandTo();
    }
  };

  return (
    <div
      className="flex flex-col items-center py-2 h-full gap-1 cursor-pointer"
      onClick={handleBackgroundClick}
    >
      {/* PanelLeftOpen — expand sidebar */}
      <div className="group relative flex items-center">
        <button
          onClick={(e) => { e.stopPropagation(); expandTo(); }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface-raised transition-colors"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
        <RailTooltip label="Expand Sidebar" />
      </div>

      {/* Decks */}
      <div className="group relative flex items-center">
        <button
          onClick={(e) => { e.stopPropagation(); expandTo(); }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface-raised transition-colors"
        >
          <Layers className="w-4 h-4" />
        </button>
        <RailTooltip label="Decks" />
      </div>

      {/* New Deck */}
      <div className="group relative flex items-center">
        <button
          onClick={handleNewDeck}
          className="w-9 h-9 rounded-full flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface-raised transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        {!railPickerOpen && <RailTooltip label="New Deck" />}
        {railPickerOpen && (
          <div
            ref={railPickerRef}
            className="absolute left-full ml-2 top-0 w-52 bg-surface-base border border-line-default rounded-lg shadow-xl z-50"
          >
            <FormatPicker onSelect={handleRailFormatSelect} />
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Buy Me a Coffee */}
      <div className="group relative flex items-center">
        <a
          href="https://www.buymeacoffee.com/itsmephi"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-content-muted hover:text-yellow-400 transition-colors"
        >
          <Coffee className="w-4 h-4" />
        </a>
        <RailTooltip label="Buy Me a Coffee" />
      </div>

      {/* Settings */}
      <div className="group relative flex items-center">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenSettings("preferences"); }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface-raised transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
        <RailTooltip label="Settings" />
      </div>

      {/* Home */}
      <div className="group relative flex items-center">
        <button
          onClick={isOnHomeScreen ? undefined : (e) => { e.stopPropagation(); onGoHome(); }}
          className={`
            w-9 h-9 rounded-full flex items-center justify-center transition-colors
            ${isOnHomeScreen
              ? "text-content-disabled cursor-not-allowed"
              : "text-content-muted hover:text-content-primary hover:bg-surface-raised"
            }
          `}
        >
          <Home className="w-4 h-4" />
        </button>
        {!isOnHomeScreen && <RailTooltip label="Home" />}
      </div>
    </div>
  );
}
