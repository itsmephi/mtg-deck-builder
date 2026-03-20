# Tile Size Parity + Snap Slider — Design Spec

**Milestone:** v1.8.0 (pending triage promotion)
**Prototype:** `docs/tile-size-slider-v4.html` (open in browser for visual reference)
**Status:** DESIGNED — approved by Phi

---

## Overview

Unify card tile sizing between deck grid view and search grid view by extracting a shared grid configuration. Add a vertical snap-slider popover in both toolbars so users can control tile size across 5 presets. Primary goal: let users see card art as large as possible and read card name/text directly off the art without hovering or opening the modal.

**Closes Pipeline items:**
- "Card tile size parity — match tile sizes between search and deck grid views"
- "Grid view column size presets — small/medium/large; bonus: auto-set based on screen size"

---

## 1. New File: `src/config/gridConfig.ts`

Shared grid configuration consumed by both `Workspace.tsx` and `SearchWorkspace.tsx`.

```ts
export const TILE_SIZE_STOPS = [
  { key: "xs", minWidth: 130, gap: 10 },
  { key: "s",  minWidth: 148, gap: 12 },
  { key: "m",  minWidth: 185, gap: 16 },
  { key: "l",  minWidth: 258, gap: 18 },
  { key: "xl", minWidth: 395, gap: 20 },
] as const;

export type TileSizeKey = (typeof TILE_SIZE_STOPS)[number]["key"];
export const DEFAULT_TILE_SIZE: TileSizeKey = "m";
export const TILE_SIZE_STORAGE_KEY = "mtg-tile-size";
```

Both views apply the active stop's values via inline style:
```
grid-template-columns: repeat(auto-fill, minmax(${minWidth}px, 1fr));
gap: ${gap}px;
```

---

## 2. New Component: `src/components/workspace/TileSizeSlider.tsx`

A toolbar button that opens a vertical popover slider.

### Button
- 30×30px toolbar icon button using a "zoom-in" icon (magnifying glass with +, from lucide-react `ZoomIn` or equivalent)
- Positioned in both toolbars between the group-by-type toggle and the grid/list view toggle, separated by `toolbar-divider` on each side
- Shows `active` style (bg-neutral-800, white text, border) while popover is open

### Popover
Opens below the button, centered horizontally. Contains (top to bottom):
- **Top hint:** Small card-shaped SVG icon (larger size, ~16×12) — visual affordance for "big"
- **Vertical slider track:** 140px tall, 3px wide, `bg-[#333]` rounded
- **Blue fill:** From bottom up to current stop position, `bg-blue-500`
- **5 snap stop dots:** 7×7px circles on the track, evenly spaced. Filled blue (`bg-blue-500`) up to and including active stop, gray (`bg-[#404040]`) above
- **Draggable thumb:** 16×16px circle, `bg-blue-500` with `border-2 border-blue-400`, `box-shadow`, centered on active stop position
- **Bottom hint:** Small card-shaped SVG icon (smaller size, ~10×8) — visual affordance for "small"
- **No text labels** — the interaction is self-explanatory

### Popover styling
- `bg-[#1a1a1e] border border-[#333] rounded-[10px]`
- `box-shadow: 0 12px 40px rgba(0,0,0,0.6)`
- Arrow triangle pointing up at top center (CSS pseudo-element)
- Open animation: fade in + slight translateY transition (0.15s)

### Interaction
- **Click button** → toggle popover open/close
- **Drag thumb** → snaps to nearest stop as you drag, grid updates in real-time
- **Click on track** → jumps to nearest stop
- **Click outside** (invisible backdrop) → closes popover
- Thumb shows `cursor: grab` (normal) / `cursor: grabbing` (dragging)
- Dragging thumb has no transition on `bottom` (instant follow), non-dragging has 0.15s ease

### Props
```ts
interface TileSizeSliderProps {
  activeStop: TileSizeKey;
  onChangeStop: (stop: TileSizeKey) => void;
}
```

---

## 3. Workspace.tsx Changes

### Remove
The current responsive Tailwind grid classes on the visual card grid:
```
grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-7
```

This appears in two places:
1. Inside the grouped view (each type group's grid)
2. The ungrouped flat grid

### Replace with
Inline style using the active tile size stop from `gridConfig.ts`:
```tsx
style={{
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill, minmax(${activeStop.minWidth}px, 1fr))`,
  gap: `${activeStop.gap}px`,
  alignContent: "start",
}}
```

Both grouped and ungrouped grids use the same inline style.

### State management
- Read initial value from `localStorage.getItem("mtg-tile-size")` with fallback to `"m"`
- Store in component state (or lift to context if cleaner)
- On change, write to `localStorage` and update state
- The `TileSizeSlider` component receives the active stop and a setter

---

## 4. WorkspaceToolbar.tsx Changes

Add `TileSizeSlider` to the toolbar controls row (row 2):

**Insertion point:** After the group-by-type toggle button, before the grid/list view buttons.

```
[Sort dropdown] [Sort direction] | [Group by type] | [TileSizeSlider] | [Grid view] [List view]
```

Dividers (`|`) are the existing `toolbar-divider` elements.

### Props threading
WorkspaceToolbar needs to receive `tileSize` and `onTileSizeChange` props from Workspace.tsx, then pass them to TileSizeSlider.

---

## 5. SearchWorkspace.tsx Changes

### Remove
The hardcoded inline grid style:
```tsx
style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
  gap: "12px",
  alignContent: "start",
}}
```

### Replace with
Same shared inline style using the active tile size stop from `gridConfig.ts`.

### Search toolbar (row 2)
Add `TileSizeSlider` in the same relative position as the deck toolbar — after any left-side controls, before the grid/list view buttons, with dividers on each side.

### State management
- Same `localStorage` key (`mtg-tile-size`) as deck view
- Read on mount, write on change
- Since both views share the same key, switching tabs automatically picks up any size change made in the other view

---

## 6. Tile Size Stop Values

Tuned for **1680px effective grid width** (1920px browser − 200px expanded sidebar − 40px scroll area padding). Sidebar expanded is the baseline — column targets must hit with sidebar open.

| Stop | key | minWidth | gap | Target cols @ 1680px grid |
|---|---|---|---|---|
| XS | `xs` | 130px | 10px | 12 |
| S | `s` | 148px | 12px | 10 |
| M | `m` | 185px | 16px | 8 |
| L | `l` | 258px | 18px | 6 |
| XL | `xl` | 395px | 20px | 4 |

When sidebar collapses (~152px wider workspace), tiles get wider within the same column count. Column count may gain +1 at some stops — this is expected and fine.

On smaller viewports (e.g. 1366px laptop), each stop naturally shows ~1 fewer column. No special handling needed — `auto-fill` with `minmax` handles this gracefully.

---

## 7. localStorage Key

Add to CLAUDE.md UI state persistence keys:
- `mtg-tile-size` — value: `"xs"` | `"s"` | `"m"` | `"l"` | `"xl"`, default `"m"`

---

## 8. What This Does NOT Change

- `VisualCard.tsx` — no changes (fills its container, aspect ratio unchanged)
- `ListCardTable.tsx` — no changes (list view sizing is separate future scope)
- Card aspect ratio — stays `aspect-[2.5/3.5]` everywhere
- Hover overlays, qty pills, crown badges, warning badges — all unchanged
- Deck management, sidebar, CardModal, import/export — all unchanged
- Search toolbar row 1 (search bar, filter badge, tokens) — unchanged
- Mobile layout — unchanged (auto-fill handles narrow viewports naturally)

---

## 9. Future Scope Notes

- When **"Search: list view toggle for search results"** gets promoted from Pipeline, it should follow this same pattern: shared config in `gridConfig.ts` (or parallel `listConfig.ts`), one `localStorage` key, both views consume it. Flag this during that item's design session.
- The design intent for L/XL presets is **art appreciation and text readability** — users should be able to read the card name and type line printed on the art without hovering or opening the modal.

---

## 10. Implementation Notes for Claude Code

- **Do not rebuild the toolbar UI.** The prototype's toolbar is approximate. Reference it only for the slider popover interaction and the `minWidth`/`gap` values. The existing `WorkspaceToolbar.tsx` and `SearchWorkspace.tsx` toolbar code is the source of truth for layout and styling.
- **Commit the prototype** to `docs/tile-size-slider-v4.html` alongside the implementation so it's available as a visual reference.
- The `TileSizeSlider` component is new — this triggers the 5+ files / new component flag per workflow rules. Plan review table required before building.
