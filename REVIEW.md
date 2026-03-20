# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.8.2 — Price Filter UX Fixes
Status: APPROVED ✅

### Session Summary

**What shipped** (`src/components/layout/FilterPanel.tsx` only):

- **Default $100 cap enforced:** `buildSidebarFilterSyntax` had `if (priceMax < 100)` guarding the `usd<=` clause — since the default is exactly 100, the clause was never appended and cards over $100 always appeared. Guard removed; clause always emits when `anyPrice` is false.
- **`$` label separated from input value:** Inputs previously used `value={\`$${n}\`}`. The `$` prefix caused cursor/backspace issues. Both inputs now show a static `$` span alongside a plain numeric input.
- **Auto-select on focus:** Both inputs call `e.target.select()` on focus — click to select all, then type replacement value.
- **Blur-deferred validation:** `onChange` updates `localMin`/`localMax` string state freely with no clamping. `onBlur` applies min/max constraints and commits to parent. Allows intermediate states like empty field or partial entry while typing.
- **Enter key commits:** `onKeyDown` calls `e.currentTarget.blur()` on Enter, triggering the blur commit path.
- **Drag slider:** Replaced `onClick` with `onMouseDown` + document-level `mousemove`/`mouseup`. A white drag dot with blue border tracks the max position during drag. The max price input reflects `dragMax` live during drag. Value commits to parent only on `mouseup`.

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md

---

## Plan Review

| File | Action | Changes |
|---|---|---|
| `src/config/gridConfig.ts` | CREATE | 5-stop tile size config (XS/S/M/L/XL with minWidth + gap), `TileSizeKey` type, `DEFAULT_TILE_SIZE`, `TILE_SIZE_STORAGE_KEY` constant |
| `src/components/workspace/TileSizeSlider.tsx` | CREATE | Toolbar icon button (ZoomIn icon) toggling a vertical popover snap-slider; 5 stop dots, blue fill, draggable thumb, card-shape SVG hints, backdrop close, no text labels |
| `src/components/workspace/Workspace.tsx` | MODIFY | Add `tileSize` state (read/write localStorage `mtg-tile-size`); replace both `grid-cols-2 sm:grid-cols-3 ...` class blocks (grouped + ungrouped) with inline style using active stop's `minWidth`/`gap`; thread `tileSize` + `onTileSizeChange` props to WorkspaceToolbar |
| `src/components/workspace/WorkspaceToolbar.tsx` | MODIFY | Accept `tileSize` + `onTileSizeChange` props; insert `TileSizeSlider` between the group-by-type button and grid/list buttons, with `toolbar-divider` on each side |
| `src/components/workspace/SearchWorkspace.tsx` | MODIFY | Add `tileSize` state (same `mtg-tile-size` key); replace hardcoded `minmax(175px, 1fr)` / `gap: 12px` inline style with shared config; insert `TileSizeSlider` in toolbar row 2 before grid/list buttons with dividers on each side |
| `src/config/version.ts` | MODIFY | Bump `APP_VERSION` to `"1.8.0"`; add `1.8.0` CHANGELOG entry |
| `CLAUDE.md` | MODIFY | Add `mtg-tile-size` to UI state persistence keys; add `gridConfig.ts` to `config/` and `TileSizeSlider.tsx` to `components/workspace/` in file structure |
| `BACKLOG.md` | MODIFY | Mark "Card tile size parity" and "Grid view column size presets" as closed v1.8.0 |
| `docs/tile-size-slider-v4.html` | ADD (already present) | No action needed — confirmed in repo |
| `docs/tile-size-design-spec.md` | ADD (already present) | No action needed — confirmed in repo |

**Total: 8 files touched, 2 new files created (gridConfig.ts, TileSizeSlider.tsx)**

---

## Session Summary

**What shipped:**

- **`gridConfig.ts` (new):** Shared tile size configuration — 5 stops (XS/S/M/L/XL) with `minWidth` and `gap` values tuned for 1624px effective grid (1920px − 256px sidebar − 40px scroll padding). Types `TileSizeKey`, `DEFAULT_TILE_SIZE`, and `TILE_SIZE_STORAGE_KEY` exported for consumption by both views.

- **`TileSizeSlider.tsx` (new):** Vertical snap-slider popover triggered by a `ZoomIn` toolbar icon button. Drag-to-snap and click-to-jump interactions. Always rendered in DOM — open/close controlled by `opacity` + `translateY` + `pointer-events` for smooth 0.15s fade transition. Card-shape SVG hints (simple rounded rects) at top (large) and bottom (small). Blue fill and dot coloring track active stop position.

- **Workspace.tsx:** Both grouped and ungrouped deck grids replaced Tailwind responsive `grid-cols-*` classes with inline `gridTemplateColumns: repeat(auto-fill, minmax(...))` style from `gridConfig.ts`. Tile size state lifted to `page.tsx` (received as props). `md:p-8` outer wrapper padding removed — deck grid now 1600px wide, matching search view's effective width closely enough for identical column counts at all stops.

- **WorkspaceToolbar.tsx:** `TileSizeSlider` inserted between group-by-type toggle and grid/list view buttons, with `self-stretch bg-neutral-800` dividers on each side matching existing toolbar divider style.

- **SearchWorkspace.tsx:** Hardcoded `minmax(175px, 1fr)` / `gap: 12px` replaced with shared `gridConfig.ts` values. `TileSizeSlider` added to toolbar row 2 before grid/list buttons with dividers.

- **`page.tsx`:** Tile size state lifted here (single source of truth). `setTileSize` writes to `localStorage`. Both `Workspace` and `SearchWorkspace` receive `tileSize` + `onTileSizeChange` as props — cross-view sync is instant with no localStorage polling.

**Carry-forward fixes applied:**
- minWidth values recalculated for 256px sidebar (was 200px — original spec assumed narrower sidebar)
- Cross-view sync implemented via Option B (lifted state) — changing size in one tab reflects immediately in the other
- Popover animation fixed (always-in-DOM opacity/transform transition instead of conditional mount)
- Toolbar dividers corrected to `self-stretch` full height
- Hint icons simplified to match prototype (plain rounded rect SVGs, `text-neutral-600`)
- XL column count in deck view fixed by removing `md:p-8` from deck wrapper in `page.tsx`

**Noted for future:** Search and deck views still differ slightly in outer padding (search is edge-to-edge, deck has `p-4` outer + `p-4` scroll container). Captured in backlog for a future design pass.

---

## Testing Checklist

### Deck View — Tile Slider
- [ ] Toolbar shows ZoomIn icon between group-by-type toggle and grid/list buttons, with dividers on each side
- [ ] Clicking the ZoomIn button opens the vertical popover below the button
- [ ] Clicking the ZoomIn button again closes the popover
- [ ] Clicking outside the popover closes it
- [ ] Popover shows: large card hint (top), 5 stop dots on track, draggable thumb, small card hint (bottom)
- [ ] Stop dots below and including active stop are blue; dots above are gray
- [ ] Blue fill on track rises from bottom to thumb position
- [ ] Clicking a stop dot / track area jumps to nearest stop — grid updates immediately
- [ ] Dragging thumb snaps to stops in real-time — grid updates as you drag
- [ ] Thumb shows grab cursor at rest, grabbing cursor while dragging
- [ ] Open animation: popover fades in with slight upward movement

### Deck View — Grid Sizing
- [ ] Default size (M) renders ~8 columns at full 1920px width with sidebar open
- [ ] XS stop produces densest grid (smallest tiles, most columns)
- [ ] XL stop produces largest tiles (~4 columns wide)
- [ ] Grouped view (group-by-type on) uses same tile size as ungrouped view
- [ ] List view unaffected — tile size only changes grid view
- [ ] Tile size persists after page refresh (localStorage `mtg-tile-size`)

### Search View — Tile Slider
- [ ] Search toolbar row 2 shows TileSizeSlider before grid/list buttons, with dividers on each side
- [ ] Slider works identically to deck view slider
- [ ] Search grid resizes to match selected stop

### Cross-view Persistence
- [ ] Change tile size in deck view → switch to search tab → search grid reflects same size
- [ ] Change tile size in search view → switch to deck tab → deck grid reflects same size
- [ ] Size persists across page refresh in both views

### Regression
- [ ] Deck name editing, format badge, format picker — all unaffected
- [ ] Sort dropdown, sort direction, group-by-type, grid/list toggle — all unaffected
- [ ] Simulator button, Main/Side pill — unaffected
- [ ] Commander crown badges, qty pills, warning badges — still visible and positioned correctly at all sizes
- [ ] Hover overlays on VisualCard — work at all tile sizes
- [ ] Card modal opens on click in both views at all sizes

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
