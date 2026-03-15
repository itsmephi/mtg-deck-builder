# REVIEW.md — MTG Deck Builder Session Journal

---

## Current Release: v1.3.1
Status: IN PROGRESS

---

## Plan Review — v1.3.1: Badge Readability, Overlay Color, Toolbar Overflow, Mana Symbols

**Branch:** `v1.3.1` | **Complexity:** 4 files, 0 new components — Phi reviews directly.

### Files Touched

| File | Change |
|---|---|
| `src/components/workspace/VisualCard.tsx` | Fix 1: `badgeClass` solid backgrounds (`bg-neutral-900`, `bg-green-600`, `bg-red-600`). × button `bg-black/60` → `bg-neutral-900`, hover keep `hover:bg-red-900`. Fix 2: Overlay qty span gets color logic (`text-white` / `text-green-400` / `text-red-400`) matching badge, with same exempt check. |
| `src/components/workspace/WorkspaceToolbar.tsx` | Fix 3: Add `isEditingName` state. Input gets `max-w-[200px]` + `truncate` when not editing, removes `truncate` on focus. Remove `shrink-0` from input so it can compress; stats div already has `shrink-0`. |
| `src/components/layout/SidebarSearchTab.tsx` | Fix 4: Update `MANA_COLORS` map to spec colors (`bg-amber-100 text-amber-900`, `bg-blue-400 text-blue-950`, `bg-neutral-700 text-neutral-100`, `bg-red-500 text-red-100`, `bg-green-600 text-green-100`, generic `bg-neutral-500 text-neutral-100`). Add double-faced fallback at call site: `card.mana_cost \|\| card.card_faces?.[0]?.mana_cost`. |
| `src/config/version.ts` | Bump `APP_VERSION` to `"1.3.1"`, add changelog entry. |
| `CHANGELOG.md` | Add v1.3.1 Fixed section. |
| `CLAUDE.md` | Version bump to v1.3.1. |
| `BACKLOG.md` | Append 7 new Pipeline items from spec. |
| `REVIEW.md` | This file — plan review, testing checklist, session summary. |

---

## Testing Checklist — v1.3.1

### Fix 1 — Badge and × Button Opacity
- [x] Qty badge: gray at ≤ 3 copies — solid dark circle, clearly readable on all card art
- [x] Qty badge: green at exactly 4 copies — solid green, no opacity suffix
- [x] Qty badge: red at 5+ copies — solid red, no opacity suffix
- [x] Exempt cards (Basic Lands, "any number") — badge always gray regardless of qty
- [x] × remove button: solid dark circle at rest, turns red bg on hover — readable on all art
- [x] Zero-qty card: badge still visible (gray) on desaturated/dimmed art

### Fix 2 — Overlay Qty Number Color
- [x] Overlay qty number is white when qty ≤ 3
- [x] Overlay qty number is green-400 at exactly 4 (at copy limit)
- [x] Overlay qty number is red-400 at 5+ (over copy limit)
- [x] Exempt cards (Basic Lands, "any number") — overlay qty always white
- [x] Color matches the badge — both go green at 4, red at 5+

### Fix 3 — Toolbar Overflow
- [x] Short deck name (≤ 10 chars): no truncation, stats and controls all visible
- [x] Long deck name (e.g. "Atraxa Superfriends Combo v3"): truncates at 200px with ellipsis
- [x] Clicking/focusing the name input: truncation removed, full name visible for editing
- [x] Blurring the name input: truncation restored
- [x] Stats (card count, value, to buy) never get compressed — always fully visible at `shrink-0`
- [x] Controls (Simulator, Main/Side, sort/group/view) always visible on right side

### Fix 4 — Mana Symbols in Search Results
- [ ] Mana symbols render as Scryfall SVG images (same as list view), not colored CSS circles
- [ ] {W}, {U}, {B}, {R}, {G}: official mana symbol SVGs — visually match list view
- [ ] Generic/colorless ({1}, {2}, {X}, etc.): official mana symbol SVGs
- [ ] Hybrid symbols ({W/U}, etc.): slash stripped in URL, renders correctly
- [ ] Double-faced cards (no `mana_cost` field): symbols render from first face mana cost
- [ ] Multi-color card (e.g. {2}{W}{U}): all symbols in a row, correct order

### No Regression
- [x] Grid view badge/× button behavior unchanged (only visual style changed)
- [x] Overlay controls (−/+, owned counter) still functional
- [x] Deck name edit still works — Enter/blur commits, full name editable when focused
- [x] Search add functionality unchanged
- [x] All other sidebar and workspace features unchanged

---

## Emerging Issues
<!-- Phi fills this in during QA -->

---

## Session Summary — v1.3.1
Status: APPROVED ✅

### Gate Check
- Plan review written to REVIEW.md before any file changes ✅
- 4 files, 0 new components — Phi reviewed directly (no Claude Chat round-trip) ✅
- Testing checklist written before pausing for QA ✅
- Fix 4 revised mid-QA: CSS circles → Scryfall SVGs to match list view (carry-forward, same version) ✅

### Fix 1 — Badge + × Button Opacity
`VisualCard.tsx`: `badgeClass` changed from semi-transparent (`bg-black/60`, `bg-green-500/80`, `bg-red-500/80`) to solid (`bg-neutral-900`, `bg-green-600`, `bg-red-600`). × remove button changed from `bg-black/60` to `bg-neutral-900`, hover from `hover:bg-red-500/20` to `hover:bg-red-900`.

### Fix 2 — Overlay Qty Number Color
`VisualCard.tsx`: Added `overlayQtyClass` computed from existing `overCopyLimit`/`atCopyLimit`/`isExempt` flags (same logic as badge). Overlay qty span uses `overlayQtyClass` instead of hardcoded `text-white`.

### Fix 3 — Toolbar Overflow
`WorkspaceToolbar.tsx`: Added `isEditingName` state and `useState` import. Input gets `max-w-[200px]` + `truncate` when `!isEditingName`; `onFocus` sets editing true (removes truncate), `onBlur` sets false (restores truncate). Removed `shrink-0` from input so stats container (`shrink-0`) always stays visible.

### Fix 4 — Mana Symbols (revised)
`SidebarSearchTab.tsx`: Replaced custom `MANA_COLORS` CSS-circle approach with Scryfall SVG images matching `ListCardTable.tsx` exactly. URL pattern: `https://svgs.scryfall.io/card-symbols/{SYMBOL}.svg` (braces + slashes stripped). Size `w-3.5 h-3.5`. Double-faced fallback `card.mana_cost || card.card_faces?.[0]?.mana_cost` at call site.

---

## Current Release: v1.3.0
Status: APPROVED ✅

---

## Plan Review — v1.3.0 Prompt 1: Sidebar Restructure & Toolbar Slim

**Branch:** `v1.3.0` | **Complexity flag:** ⚠️ 8 files, 3 new components — synced to Claude Chat before PROCEED

### Files Touched

| File | Change |
|---|---|
| `src/app/page.tsx` | `"use client"` added. Calls `useDeckImportExport()`, creates `fileInputRef`, renders hidden file input. Passes `onImport`/`onExport`/`isImporting` to `<Sidebar>`. Passes `pendingImport`/`processImport`/`cancelImport` to `<Workspace>`. |
| `src/components/layout/Sidebar.tsx` | Refactored to shell. Manages `collapsed`/`activeTab`/`isDesktop` state. Renders `<SidebarRail />` when collapsed (desktop only), or tab bar + tab content + footer when expanded. Passes `expandTo(tab)` to rail. GitHub icon removed from footer. Expand/collapse chevron moved from footer to tab bar. |
| `src/components/layout/SidebarRail.tsx` | NEW — 48px icon rail with Search, Decks, Coffee, Settings icons. |
| `src/components/layout/SidebarSearchTab.tsx` | NEW — Extracted search logic. Additions: clear button (×) with instant category snap-back to cached results, inline mana cost symbols, circular `+` button on hover. |
| `src/components/layout/SidebarDecksTab.tsx` | NEW — Deck list rows (dot, name, count, layers icon, × dropdown), + New Deck, Import/Export/TCGPlayer/Card Kingdom actions strip. Receives `onImport`/`onExport`/`isImporting` props. Calls `useDeckStats` directly for buy links. |
| `src/components/workspace/WorkspaceToolbar.tsx` | Slimmed to single row. 12 props removed. Left: name + stats. Right: Simulator + Main/Side pill + sort/group/view. |
| `src/components/workspace/Workspace.tsx` | Removed `useDeckImportExport` call and buy link destructuring. Receives `pendingImport`/`processImport`/`cancelImport` as props for `ImportModal`. Trimmed `WorkspaceToolbar` prop pass. |
| `src/components/workspace/DeckDropdown.tsx` | DELETED — absorbed into `SidebarDecksTab.tsx`. |

**Architecture note:** `useDeckImportExport` lifted to `page.tsx` (common parent of `Sidebar` and `Workspace` siblings) — the only structurally correct way to share import/export state across both trees. `ImportModal` stays in `Workspace.tsx` receiving the hook outputs as props.

---

## Plan Review — v1.3.0 Prompt 2: Grid View Hover Overlay + Housekeeping

**Branch:** `v1.3.0` | **Complexity:** 6 files, 0 new components — Phi reviewed directly.

### Files Touched

| File | Change |
|---|---|
| `src/components/workspace/VisualCard.tsx` | Full redesign: `relative group overflow-hidden` tile, art fills entire tile. Circular qty badge top-left (gray/green/red). × remove top-right (hover-only). Slide-up bottom overlay with circular `−`/`+` qty controls + `Owned: X/Y` inline-editable counter. Flip animation removed. |
| `src/config/version.ts` | Bumped to `"1.3.0"`, added changelog entry. |
| `CHANGELOG.md` | Added v1.3.0 section (Added/Changed/Removed). |
| `BACKLOG.md` | Closed 3 items, updated notes on #71/#26/#75, cleared Active Milestone, added v1.3.0 closed section. |
| `CLAUDE.md` | Version bumped, file structure updated, 2 new localStorage keys added. |
| `REVIEW.md` | This file. |

---

## Testing Checklist — v1.3.0

### Grid View — Default State
- [ ] Card art fills the entire tile (no bottom bar, no progress bar, no top controls)
- [ ] Circular qty badge visible at top-left — gray background at qty ≤ 3
- [ ] Qty badge turns green at exactly 4 copies (combined main + sideboard)
- [ ] Qty badge turns red at 5+ copies (combined main + sideboard)
- [ ] Exempt cards (Basic Lands, "any number" cards) never show green/red — always gray
- [ ] Old 4-copy warning badge is gone
- [ ] Zero-qty card shows grayed-out, desaturated art
- [ ] No always-visible − qty + bar, no progress bar, no check icon, no always-visible ×

### Grid View — Hover State
- [ ] Hovering a tile reveals the × remove button (top-right, circular)
- [ ] Hovering a tile reveals the slide-up overlay from the bottom
- [ ] Overlay contains: `−` (circular), qty number, `+` (circular), `Owned: X/Y` counter
- [ ] Overlay transition is smooth (slides up, not a snap)
- [ ] Mouse-off hides overlay and × smoothly

### Grid View — Overlay Controls
- [ ] `−` button decrements qty (minimum 0, card stays grayed out)
- [ ] `+` button increments qty
- [ ] Clicking qty number enters inline edit — typing and Enter commits, Escape cancels
- [ ] Inline qty edit allows 0 (card grays out) and any positive integer
- [ ] Owned counter shows `X/Y` format (X = ownedQty, Y = quantity)
- [ ] Owned counter is green when ownedQty ≥ quantity, neutral otherwise
- [ ] Clicking the X (ownedQty) number enters inline edit — Enter commits, Escape cancels
- [ ] ownedQty can exceed quantity (e.g. "5/3") — valid
- [ ] No +/− buttons on owned counter — inline edit only

### Grid View — Click Behavior
- [ ] Clicking card art (not on overlay or × button) opens CardModal
- [ ] Clicking overlay controls does NOT open CardModal (stopPropagation working)
- [ ] Clicking × remove does NOT open CardModal (stopPropagation working)
- [ ] × remove deletes the card immediately, no confirmation

### Grid View — Other
- [ ] Yellow highlight ring on recently added card still visible
- [ ] Double-sided cards show front face in grid tile (no flip animation)
- [ ] List view (ListCardTable) completely unchanged

### Sidebar — Collapse / Expand
- [ ] Sidebar renders expanded by default on first load (desktop)
- [ ] Clicking `‹` chevron collapses to 48px icon rail
- [ ] Clicking Search or Decks icon in rail expands and activates correct tab
- [ ] Collapsed state persists across refresh (`mtg-sidebar-collapsed`)
- [ ] Active tab persists across refresh (`mtg-sidebar-active-tab`)
- [ ] Transition is smooth (300ms cubic-bezier)
- [ ] Workspace reflows during transition — no overlap, no gap
- [ ] Mobile (< md): full width stacked at `h-[40vh]`, no collapse UI

### Sidebar — Search Tab
- [ ] Search input clear button (×) appears when query is non-empty
- [ ] Clicking × restores cached category results instantly (no re-fetch)
- [ ] Results show inline mana cost symbols (colored circles)
- [ ] Circular `+` button appears on hover
- [ ] Card preview tooltip on hover still works
- [ ] Adding a card works (main deck and sideboard)
- [ ] `$0.00` price rescue still works

### Sidebar — Decks Tab
- [ ] All decks listed with active dot, name, card count, layers icon, × icon
- [ ] Clicking active deck name → stays on that deck and switches to main view (carry-forward fix)
- [ ] Clicking non-active deck name → switches deck and goes to main view
- [ ] Layers icon muted → click creates sideboard + switches to sideboard view
- [ ] Layers icon blue → click switches to sideboard view
- [ ] × icon appears on row hover only
- [ ] × dropdown: "Delete Deck" always, "Delete Sideboard" conditional
- [ ] Delete confirmations work; dropdown closes on click-outside
- [ ] + New Deck creates a deck
- [ ] Import/Export/TCGPlayer/Card Kingdom all work

### Sidebar Footer
- [ ] Version badge, coffee icon, settings gear — no GitHub icon, no expand chevron
- [ ] Settings: Card Preview toggle + Sort By/Direction work and persist

### WorkspaceToolbar
- [ ] Single row: name left, stats left, controls right
- [ ] "Simulator" button (renamed from "Test Deck") opens sample hand modal
- [ ] Card count green at 60, red above; sideboard shows X/15
- [ ] No DeckDropdown, no Import/Export, no buy link buttons

### No Regression
- [ ] Adding a card from Search tab works (main and sideboard)
- [ ] Card scroll+highlight on add still works
- [ ] ImportModal works — "Create New Deck" and "Add to Current" both function
- [ ] List view unchanged and functional
- [ ] CardModal opens from both grid and list view
- [ ] SampleHandModal works
- [ ] Sort/group/view controls all work
- [ ] All localStorage state survives refresh

---

## Emerging Issues
<!-- Phi fills this in during QA -->

---

## Carry-Forwards Applied Before APPROVED

**Fix 1 — Active deck name click → main view**
`SidebarDecksTab.tsx`: deck name button `onClick` updated. If `isActive`: calls `setDeckViewMode("main")` (previously a no-op). If not active: calls `setActiveDeckId(deck.id)` then `setDeckViewMode("main")`. Enforces the "name = main" rule consistently.

**Fix 2 — REVIEW.md history cleanup**
All pre-v1.3.0 session history (v1.1.3 through v1.2.1) removed. Only v1.3.0 plan reviews, testing checklist, and session summary remain. Prior history is archived in CHANGELOG.md.

---

## Session Summary — v1.3.0
Status: APPROVED ✅

### Gate Check
- Prompt 1 plan review written and synced to Claude Chat before PROCEED ✅
- Prompt 2 plan review written; Phi reviewed directly (≤5 files, 0 new components) ✅
- Testing Checklist written before pausing for QA ✅
- Carry-forward fixes applied before final commit ✅

### Prompt 1 — Sidebar Restructure & Toolbar Slim

**Sidebar split into 4 components:** `Sidebar.tsx` (shell), `SidebarRail.tsx` (48px icon rail), `SidebarSearchTab.tsx` (search logic), `SidebarDecksTab.tsx` (deck management + actions). Collapsed/expanded state and active tab both synced to localStorage. `isDesktop` state gates the inline-style width and collapse UI so mobile layout is unaffected.

**Import/export wiring:** `useDeckImportExport` lifted to `page.tsx` — the only correct solution for sharing state between sidebar and workspace siblings. Hidden `<input type="file" />` at page level. `ImportModal` stays in `Workspace.tsx` receiving `pendingImport`/`processImport`/`cancelImport` as props.

**WorkspaceToolbar:** 3-row layout → 1 row. 12 props removed. `DeckDropdown.tsx` deleted. Button renamed "Test Deck" → "Simulator".

**SidebarSearchTab additions:** Clear button snaps to cached category results (no re-fetch). Inline mana cost symbols parsed from `card.mana_cost` rendered as `w-3.5 h-3.5 rounded-full` color-coded circles. Circular `+` button on hover.

**SidebarDecksTab:** Deck rows with active dot, card count, Layers icon (creates/switches sideboard — never toggles back), hover-only × with custom dropdown (no `window.confirm` for the dropdown itself, but delete action does confirm). Import/export/buy link actions strip.

### Prompt 2 — Grid View Hover Overlay

**VisualCard.tsx** rewritten. Tile is `relative group overflow-hidden rounded-xl aspect-[2.5/3.5]`. Art fills tile. Always-visible bottom bar, progress bar, checkbox, owned stepper all removed.

**Qty badge** (always visible, top-left): `bg-black/60` gray ≤3, `bg-green-500/80` at exactly 4, `bg-red-500/80` at 5+. Based on `combinedQty` (cross-pool), exempt cards always gray. Replaces the old separate 4-copy warning badge.

**× remove** (top-right, hover-only): `opacity-0 group-hover:opacity-100`, `e.stopPropagation()`.

**Slide-up overlay** (bottom, hover): `translate-y-full group-hover:translate-y-0 transition-transform duration-200`, `bg-black/75 backdrop-blur-sm`. Contains: circular `−`/`+` qty buttons + inline-editable qty number + `Owned: X/Y` inline-editable counter (green when fully owned). All controls `e.stopPropagation()`. Clicking art opens CardModal.

**Double-faced card flip animation removed** — `group-hover/card` named group conflicts with new `group` hover system. Front face always shows in grid tiles; flip remains in CardModal.

### Carry-Forwards
- Fix 1: Active deck name click always calls `setDeckViewMode("main")` — enforces name = main rule.
- Fix 2: REVIEW.md trimmed to v1.3.0 session only.

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
