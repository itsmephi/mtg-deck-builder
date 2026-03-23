"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Coffee } from "lucide-react";
import { APP_VERSION, CHANGELOG } from "@/config/version";
import { useDeckManager } from "@/hooks/useDeckManager";

type SettingsTab = "preferences" | "whatsnew" | "about" | "support";

interface Props {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onClose: () => void;
}

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "preferences", label: "Preferences" },
  { id: "whatsnew", label: "What's New" },
  { id: "about", label: "About" },
  { id: "support", label: "Support" },
];

// ─── Preferences ─────────────────────────────────────────────────────────────

function PreferencesTab() {
  const { showThumbnail, setShowThumbnail } = useDeckManager();
  const [activeTheme, setActiveTheme] = useState<"warm-stone" | "zed-dark">(
    "warm-stone",
  );

  useEffect(() => {
    const stored = localStorage.getItem("mtg-theme");
    setActiveTheme(stored === "zed-dark" ? "zed-dark" : "warm-stone");
  }, []);

  const handleThemeSelect = (theme: "warm-stone" | "zed-dark") => {
    setActiveTheme(theme);
    if (theme === "zed-dark") {
      document.documentElement.dataset.theme = "zed-dark";
      localStorage.setItem("mtg-theme", "zed-dark");
    } else {
      delete document.documentElement.dataset.theme;
      localStorage.removeItem("mtg-theme");
    }
  };

  return (
    <div>
      {/* Card Preview */}
      <div className="flex items-center justify-between border-b border-line-subtle py-3">
        <div>
          <p className="text-sm text-content-heading">Card Preview</p>
          <p className="text-xs text-content-muted mt-0.5">
            Show card image on hover in search results
          </p>
        </div>
        <div
          onClick={() => setShowThumbnail(!showThumbnail)}
          className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${
            showThumbnail ? "bg-blue-500" : "bg-surface-overlay"
          }`}
        >
          <span
            className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
              showThumbnail ? "translate-x-[16px]" : "translate-x-0"
            }`}
          />
        </div>
      </div>

      {/* Theme picker */}
      <div className="py-3 border-b border-line-subtle">
        <p className="text-sm text-content-heading">Theme</p>
        <p className="text-xs text-content-muted mt-0.5">
          Choose your color palette
        </p>
        <div className="flex gap-3 mt-3">
          {/* Warm Stone */}
          <button
            onClick={() => handleThemeSelect("warm-stone")}
            className={`w-[110px] h-16 rounded-lg overflow-hidden relative cursor-pointer border-2 transition-all ${
              activeTheme === "warm-stone"
                ? "border-line-focus"
                : "border-line-default hover:border-line-hover"
            }`}
            style={{
              background:
                "linear-gradient(135deg, #1c1917, #292524 50%, #3f3a36)",
            }}
          >
            <span className="absolute bottom-0 inset-x-0 px-2 py-1 bg-black/50 text-[9px] font-bold uppercase tracking-wide text-content-secondary text-left">
              Warm Stone
            </span>
          </button>

          {/* Zed Dark */}
          <button
            onClick={() => handleThemeSelect("zed-dark")}
            className={`w-[110px] h-16 rounded-lg overflow-hidden relative cursor-pointer border-2 transition-all ${
              activeTheme === "zed-dark"
                ? "border-line-focus"
                : "border-line-default hover:border-line-hover"
            }`}
            style={{
              background:
                "linear-gradient(135deg, #282c34, #2c313a 50%, #3a3f47)",
            }}
          >
            <span className="absolute bottom-0 inset-x-0 px-2 py-1 bg-black/50 text-[9px] font-bold uppercase tracking-wide text-content-secondary text-left">
              Zed Dark
            </span>
          </button>
        </div>
      </div>

      {/* Future placeholder */}
      <div className="border border-dashed border-line-default rounded-lg p-6 text-center mt-6">
        <p className="text-xs text-content-disabled">
          More preferences coming soon
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-content-faint mt-1.5">
          Animations · Token Gallery · Display density
        </p>
      </div>
    </div>
  );
}

// ─── What's New ───────────────────────────────────────────────────────────────

function WhatsNewTab() {
  const entries = Object.entries(CHANGELOG).slice(0, 5);

  return (
    <div>
      {entries.map(([version, items], index) => (
        <div key={version}>
          {index > 0 && <div className="border-b border-line-subtle my-5" />}
          <div className="mb-2">
            {index === 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-wider rounded-full">
                v{version}
              </span>
            ) : (
              <p className="text-[10px] font-bold text-content-disabled">
                v{version}
              </p>
            )}
          </div>
          <ul className="text-xs text-content-secondary leading-relaxed space-y-1">
            {items.map((item, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="shrink-0 text-content-disabled">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────

interface MonogramRowProps {
  letter: string;
  name: string;
  role: string;
}

function MonogramRow({ letter, name, role }: MonogramRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-surface-raised border border-line-subtle flex items-center justify-center text-xs font-bold text-content-tertiary shrink-0">
        {letter}
      </div>
      <div>
        <p className="text-sm text-content-heading">{name}</p>
        <p className="text-xs text-content-muted">{role}</p>
      </div>
    </div>
  );
}

function AboutTab() {
  return (
    <div>
      <p className="text-sm text-content-heading leading-relaxed mb-5">
        The Brew Lab is a minimal, visual deck builder and goldfish simulator
        for Magic: The Gathering. A father-son project for teaching, learning,
        and experimentation built for players who love the craft of brewing.
      </p>

      {/* Team */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">
        Team
      </p>
      <MonogramRow
        letter="PT"
        name="Phi & Thurgood Nguyen"
        role="Design, UX, and product direction"
      />
      <MonogramRow
        letter="A"
        name="Claude · Anthropic"
        role="AI implementation partner"
      />

      <div className="border-b border-line-subtle my-5" />

      {/* Powered By */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">
        Powered By
      </p>
      <MonogramRow
        letter="S"
        name="Scryfall"
        role="Card data, images, and search API"
      />
      <MonogramRow
        letter="▲"
        name="Next.js + Vercel"
        role="React framework and hosting"
      />
      <MonogramRow
        letter="T"
        name="Tailwind CSS"
        role="Utility-first styling"
      />

      <div className="border-b border-line-subtle my-5" />

      {/* Legal */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">
        Legal
      </p>
      <p className="text-[10px] text-content-disabled leading-relaxed mb-3">
        The Brew Lab is unofficial Fan Content permitted under the Fan Content
        Policy. Not approved/endorsed by Wizards. Portions of the materials used
        are property of Wizards of the Coast. ©Wizards of the Coast LLC.
      </p>
      <p className="text-[10px] text-content-disabled leading-relaxed mb-3">
        Card data and images provided by Scryfall. The Brew Lab is not produced
        by or endorsed by Scryfall.
      </p>
      <p className="text-[10px] text-content-disabled leading-relaxed mb-3">
        Magic: The Gathering is a trademark of Wizards of the Coast LLC.
      </p>
    </div>
  );
}

// ─── Support ──────────────────────────────────────────────────────────────────

function SupportTab() {
  return (
    <div>
      <p className="text-sm text-content-muted leading-relaxed mb-5">
        The Brew Lab is free and open source. Here&apos;s how to connect and
        contribute.
      </p>

      {/* Buy Me a Coffee */}
      <a
        href="https://www.buymeacoffee.com/itsmephi"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-3 rounded-lg border border-transparent hover:bg-surface-raised hover:border-line-subtle transition-colors mb-1"
      >
        <Coffee className="w-[18px] h-[18px] text-yellow-400 shrink-0" />
        <div>
          <p className="text-sm text-content-heading">Buy Me a Coffee</p>
          <p className="text-xs text-content-muted">
            Support development with a small tip
          </p>
        </div>
        <span className="ml-auto text-content-disabled text-base">›</span>
      </a>

      {/* GitHub */}
      <a
        href="https://github.com/itsmephi/mtg-deck-builder"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-3 rounded-lg border border-transparent hover:bg-surface-raised hover:border-line-subtle transition-colors"
      >
        <svg
          className="w-[18px] h-[18px] text-content-tertiary shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
        <div>
          <p className="text-sm text-content-heading">GitHub</p>
          <p className="text-xs text-content-muted">
            itsmephi/mtg-deck-builder
          </p>
        </div>
        <span className="ml-auto text-content-disabled text-base">›</span>
      </a>

      {/* Future placeholder */}
      <div className="border border-dashed border-line-default rounded-lg p-6 text-center mt-6">
        <p className="text-xs text-content-disabled">
          Bug reports, feature requests, and feedback
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-content-faint mt-1.5">
          Coming soon
        </p>
      </div>
    </div>
  );
}

// ─── SettingsView ─────────────────────────────────────────────────────────────

export default function SettingsView({
  activeTab,
  onTabChange,
  onClose,
}: Props) {
  // Escape key closes settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface-base">
      {/* Header */}
      <div className="px-5 md:px-7 pt-5 md:pt-6 pb-3 shrink-0">
        <div className="max-w-[560px] mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface-raised transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-extrabold text-content-primary tracking-tight">
              The Brew Lab
            </h1>
            <span className="ml-auto inline-flex items-center px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-wider rounded-full shrink-0">
              v{APP_VERSION}
            </span>
          </div>
          <p className="text-xs text-content-muted pl-10 mt-0.5">
            Settings, info, and more
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-line-subtle shrink-0 overflow-x-auto">
        <div className="max-w-[560px] mx-auto flex gap-0 px-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-content-primary border-line-focus"
                  : "text-content-muted hover:text-content-secondary border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 md:p-7">
        <div className="max-w-[560px] mx-auto">
          {activeTab === "preferences" && <PreferencesTab />}
          {activeTab === "whatsnew" && <WhatsNewTab />}
          {activeTab === "about" && <AboutTab />}
          {activeTab === "support" && <SupportTab />}
        </div>
      </div>
    </div>
  );
}
