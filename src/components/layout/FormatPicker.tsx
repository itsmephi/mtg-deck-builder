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
      icon: <span className="text-[9px] font-bold text-muted bg-neutral-500/10 px-0.5 rounded leading-none">FF</span>,
      label: "Freeform",
      description: "No rules. Build anything.",
    },
    {
      value: "standard",
      icon: <span className="text-[9px] font-bold text-blue-400 bg-blue-400/10 px-0.5 rounded leading-none">STD</span>,
      label: "Standard",
      description: "60 cards · 4-copy limit · 15-card sideboard",
    },
    {
      value: "commander",
      icon: <span className="text-[9px] font-bold text-yellow-400 bg-yellow-400/10 px-0.5 rounded leading-none">CMD</span>,
      label: "Commander",
      description: "100 cards · Singleton · Commander + color identity",
    },
  ];

  return (
    <div className="py-1">
      <div className="px-3 py-1.5 text-[9px] font-bold text-muted uppercase tracking-widest">
        Choose Format
      </div>
      {formats.map(({ value, icon, label, description }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-raised cursor-pointer transition-colors text-left ${
            currentFormat === value ? "bg-neutral-800/50" : ""
          }`}
        >
          <span className="flex items-center justify-center w-6 shrink-0">
            {icon}
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-heading">{label}</span>
            <span className="text-[10px] text-muted">{description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
