"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn } from "lucide-react";
import { TILE_SIZE_STOPS, TileSizeKey } from "@/config/gridConfig";

interface TileSizeSliderProps {
  activeStop: TileSizeKey;
  onChangeStop: (stop: TileSizeKey) => void;
}

const TRACK_HEIGHT = 140;
const THUMB_SIZE = 16;
const DOT_SIZE = 7;
const STOP_COUNT = TILE_SIZE_STOPS.length;

// Returns the Y position (from bottom of track) for a given stop index (0 = bottom = smallest)
function stopToY(index: number): number {
  return (index / (STOP_COUNT - 1)) * TRACK_HEIGHT;
}

function yToStopIndex(y: number): number {
  const clamped = Math.max(0, Math.min(TRACK_HEIGHT, y));
  const raw = (clamped / TRACK_HEIGHT) * (STOP_COUNT - 1);
  return Math.round(raw);
}

// Card-shaped SVG hint
function CardHint({ size }: { size: "large" | "small" }) {
  const w = size === "large" ? 16 : 10;
  const h = size === "large" ? 22 : 14;
  return (
    <svg width={w} height={h} viewBox="0 0 16 22" fill="none">
      <rect x="0.5" y="0.5" width="15" height="21" rx="2" stroke="#555" strokeWidth="1" fill="#2a2a2e" />
      <rect x="2" y="2" width="12" height="8" rx="1" fill="#3a3a40" />
      <rect x="2" y="12" width="8" height="1.5" rx="0.75" fill="#444" />
      <rect x="2" y="15" width="6" height="1.5" rx="0.75" fill="#444" />
      <rect x="2" y="18" width="10" height="1.5" rx="0.75" fill="#444" />
    </svg>
  );
}

export default function TileSizeSlider({ activeStop, onChangeStop }: TileSizeSliderProps) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const activeIndex = TILE_SIZE_STOPS.findIndex((s) => s.key === activeStop);
  const thumbY = stopToY(activeIndex); // distance from bottom

  // Click outside closes popover
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  const getIndexFromEvent = useCallback((clientY: number): number => {
    if (!trackRef.current) return activeIndex;
    const rect = trackRef.current.getBoundingClientRect();
    // top of track = index STOP_COUNT-1 (XL), bottom = index 0 (XS)
    const relativeFromTop = clientY - rect.top;
    const relativeFromBottom = rect.height - relativeFromTop;
    return yToStopIndex(relativeFromBottom);
  }, [activeIndex]);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (dragging) return;
    const idx = getIndexFromEvent(e.clientY);
    onChangeStop(TILE_SIZE_STOPS[idx].key);
  }, [dragging, getIndexFromEvent, onChangeStop]);

  const handleThumbMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const idx = getIndexFromEvent(moveEvent.clientY);
      onChangeStop(TILE_SIZE_STOPS[idx].key);
    };

    const onMouseUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [getIndexFromEvent, onChangeStop]);

  const fillPercent = (thumbY / TRACK_HEIGHT) * 100;

  return (
    <div className="relative h-full flex items-center justify-center">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className={`h-full px-2 flex items-center justify-center rounded-md transition-all ${
          open
            ? "bg-neutral-800 text-white border border-neutral-700/50"
            : "text-neutral-500 hover:text-neutral-300 border border-transparent"
        }`}
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center py-4 px-4 rounded-[10px] border border-[#333]"
          style={{
            background: "#1a1a1e",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            animation: "tileSliderFadeIn 0.15s ease",
          }}
        >
          {/* Arrow */}
          <div
            className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-l border-t border-[#333]"
            style={{ background: "#1a1a1e" }}
          />

          {/* Top hint: large card */}
          <div className="mb-3 opacity-60">
            <CardHint size="large" />
          </div>

          {/* Track area */}
          <div
            ref={trackRef}
            className="relative flex items-center justify-center cursor-pointer"
            style={{ width: 24, height: TRACK_HEIGHT }}
            onClick={handleTrackClick}
          >
            {/* Track background */}
            <div
              className="absolute rounded-full"
              style={{
                width: 3,
                top: 0,
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#333",
              }}
            />

            {/* Blue fill — from bottom up to thumb */}
            <div
              className="absolute rounded-full bg-blue-500"
              style={{
                width: 3,
                bottom: 0,
                height: `${fillPercent}%`,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />

            {/* Stop dots */}
            {TILE_SIZE_STOPS.map((stop, idx) => {
              const fromBottom = stopToY(idx);
              const isActive = idx <= activeIndex;
              return (
                <div
                  key={stop.key}
                  className="absolute rounded-full"
                  style={{
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    bottom: fromBottom - DOT_SIZE / 2,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: isActive ? "#3b82f6" : "#404040",
                    transition: "background 0.1s",
                    zIndex: 1,
                  }}
                />
              );
            })}

            {/* Draggable thumb */}
            <div
              onMouseDown={handleThumbMouseDown}
              className="absolute rounded-full bg-blue-500 border-2 border-blue-400"
              style={{
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                bottom: thumbY - THUMB_SIZE / 2,
                left: "50%",
                transform: "translateX(-50%)",
                boxShadow: "0 2px 8px rgba(59,130,246,0.5)",
                cursor: dragging ? "grabbing" : "grab",
                transition: dragging ? "none" : "bottom 0.15s ease",
                zIndex: 2,
              }}
            />
          </div>

          {/* Bottom hint: small card */}
          <div className="mt-3 opacity-40">
            <CardHint size="small" />
          </div>
        </div>
      )}

      <style>{`
        @keyframes tileSliderFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
