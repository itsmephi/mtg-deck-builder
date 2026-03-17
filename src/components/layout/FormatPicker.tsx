"use client";

import { DeckFormat } from "@/lib/formatRules";

interface FormatPickerProps {
  onSelect: (format: DeckFormat) => void;
  currentFormat?: DeckFormat;
}

export function FormatPicker({ onSelect, currentFormat }: FormatPickerProps) {
  const formats: {
    value: DeckFormat;
    icon: React.ReactNode;
    label: string;
    description: string;
  }[] = [
    {
      value: "freeform",
      icon: <span className="text-neutral-400 text-sm font-bold leading-none">—</span>,
      label: "Freeform",
      description: "No rules. Build anything.",
    },
    {
      value: "standard",
      icon: (
        <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-0.5 rounded leading-none">
          60
        </span>
      ),
      label: "Standard",
      description: "60 cards · 4-copy limit · 15-card sideboard",
    },
    {
      value: "commander",
      icon: (
        <span className="text-[9px] font-bold text-yellow-400 bg-yellow-400/10 px-0.5 rounded leading-none">
          100
        </span>
      ),
      label: "Commander",
      description: "100 cards · Singleton · Commander + color identity",
    },
  ];

  return (
    <div className="py-1">
      <div className="px-3 py-1.5 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
        Choose Format
      </div>
      {formats.map(({ value, icon, label, description }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-neutral-800 cursor-pointer transition-colors text-left ${
            currentFormat === value ? "bg-neutral-800/50" : ""
          }`}
        >
          <span className="flex items-center justify-center w-6 shrink-0">
            {icon}
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-neutral-200">{label}</span>
            <span className="text-[10px] text-neutral-500">{description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
