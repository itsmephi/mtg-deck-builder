"use client";

import { Search, Layers, Coffee, Settings, Plus, PanelLeftOpen } from "lucide-react";
import { useDeckManager } from "@/hooks/useDeckManager";

interface Props {
  expandTo: (tab: "search" | "decks") => void;
  activeTab: "search" | "decks";
}

function RailTooltip({ label }: { label: string }) {
  return (
    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-200 text-[10px] font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
      {label}
    </span>
  );
}

export default function SidebarRail({ expandTo, activeTab }: Props) {
  const { createNewDeck, setDeckViewMode } = useDeckManager();

  const handleNewDeck = (e: React.MouseEvent) => {
    e.stopPropagation();
    createNewDeck();
    setDeckViewMode("main");
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      expandTo(activeTab);
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
          onClick={(e) => { e.stopPropagation(); expandTo(activeTab); }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
        <RailTooltip label="Expand Sidebar" />
      </div>

      {/* Search */}
      <div className="group relative flex items-center">
        <button
          onClick={(e) => { e.stopPropagation(); expandTo("search"); }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
        <RailTooltip label="Search" />
      </div>

      {/* Decks */}
      <div className="group relative flex items-center">
        <button
          onClick={(e) => { e.stopPropagation(); expandTo("decks"); }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <Layers className="w-4 h-4" />
        </button>
        <RailTooltip label="Decks" />
      </div>

      {/* New Deck */}
      <div className="group relative flex items-center">
        <button
          onClick={handleNewDeck}
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <RailTooltip label="New Deck" />
      </div>

      <div className="flex-1" />

      {/* Buy Me a Coffee */}
      <div className="group relative flex items-center">
        <a
          href="https://www.buymeacoffee.com/itsmephi"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-yellow-400 transition-colors"
        >
          <Coffee className="w-4 h-4" />
        </a>
        <RailTooltip label="Buy Me a Coffee" />
      </div>

      {/* Settings */}
      <div className="group relative flex items-center">
        <button
          onClick={(e) => { e.stopPropagation(); expandTo("search"); }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
        <RailTooltip label="Settings" />
      </div>
    </div>
  );
}
