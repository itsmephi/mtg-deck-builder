"use client";

import { Search, Layers, Coffee, Settings } from "lucide-react";

interface Props {
  expandTo: (tab: "search" | "decks") => void;
}

export default function SidebarRail({ expandTo }: Props) {
  return (
    <div className="flex flex-col items-center py-2 h-full gap-1">
      <button
        onClick={() => expandTo("search")}
        className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
      >
        <Search className="w-4 h-4" />
      </button>
      <button
        onClick={() => expandTo("decks")}
        className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
      >
        <Layers className="w-4 h-4" />
      </button>
      <div className="flex-1" />
      <a
        href="https://www.buymeacoffee.com/itsmephi"
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-yellow-400 transition-colors"
      >
        <Coffee className="w-4 h-4" />
      </a>
      <button
        onClick={() => expandTo("search")}
        className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}
