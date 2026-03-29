# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.18.1 — Rail Tab Switch Without Expand
Status: APPROVED ✅

### Plan Review

| File | Changes |
|------|---------|
| `src/components/layout/SidebarRail.tsx` | Add `onTabChange` prop; wire Search and Decks buttons to call it instead of `expandTo` |
| `src/components/layout/Sidebar.tsx` | Pass `onTabChange` through to `SidebarRail` |

### QA Checklist

- [x] Collapse sidebar → click Search icon in rail → workspace switches to Search tab, sidebar stays collapsed
- [x] Collapse sidebar → click Decks icon in rail → workspace switches to Deck view, sidebar stays collapsed
- [x] Collapse sidebar → click PanelLeftOpen (expand arrow) → sidebar expands to current active tab as before
- [x] Collapse sidebar → click rail background → sidebar expands as before
- [x] Sidebar expanded — Search/Decks tab buttons work normally (unaffected)
- [x] Refresh after collapsing — collapsed state persists; Search/Decks rail buttons still only switch tabs

### Session Summary

Detached the rail's Search and Decks buttons from the expand-sidebar action. Previously both buttons called `expandTo(tab)`, which expanded the sidebar and switched the tab. Now they call `onTabChange(tab)` directly — switching the workspace view without opening the panel. The expand arrow and background click retain the full expand behavior. This lets users quickly jump between Search and Deck views while keeping the sidebar collapsed.

---

## v1.18.0 — Unified Qty/Owned Input
Status: APPROVED ✅

### Plan Review

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add `isOwned: boolean` to `DeckCard` interface |
| `src/hooks/useDeckManager.tsx` | `migrateDecks()` backfills `isOwned` from `ownedQty`; add `toggleIsOwned(cardId)` action; `updateOwnedQty` auto-sets `isOwned` based on new qty |
| `src/components/workspace/VisualCard.tsx` | Unified overlay number row; qty badge at-rest + checkmark states; badge animates to overlay-top via measured height; stepper hover rollover; owned controls always enabled |
| `src/components/workspace/ListCardTable.tsx` | Owned toggle column + qty X/Y column; owned controls always enabled; stepper hover rollover; price always neutral |
| `src/components/workspace/Workspace.tsx` | Wire `toggleIsOwned` + `toggleSideboardIsOwned`; sideboard `updateOwnedQty` also auto-sets `isOwned` |
| `src/components/workspace/SearchWorkspace.tsx` | Add `isOwned: false` to new card construction sites |
| `src/hooks/useDeckImportExport.tsx` | Add `isOwned` backfill on import |
| `src/config/version.ts` | Bump to `1.18.0`; add changelog entry |

### QA Checklist (Initial + Patch)

**Migration (existing decks)**
- [x] Open app with a deck that already has `ownedQty > 0` cards — appear with green state
- [x] Cards with `ownedQty = 0` appear with neutral state

**Grid view — badge at rest**
- [x] Not owned: dark neutral badge, white qty number
- [x] Partially owned: solid dark green bg, white number, green border
- [x] Fully owned: solid green bg, white number

**Grid view — badge on card hover**
- [x] Badge slides up and straddles overlay top edge (dynamically measured)
- [x] Badge swaps to ✓ checkmark on hover
- [x] Not-owned: muted dark ✓; badge hover → solid green bg + green ✓
- [x] Fully-owned: solid green ✓; badge hover → solid red bg + red ✓
- [x] Partially-owned: solid green bg ✓; badge hover → solid red bg + red ✓
- [x] Clicking ✓ toggles owned (activates: fill qty; deactivates: clear to 0)
- [x] Badge click does NOT open modal

**Grid view — overlay unified number row**
- [x] Steppers reveal on group hover; fade out when not hovering
- [x] Owned controls always enabled (no isOwned gate) — increment from 0 auto-activates
- [x] Decrement owned to 0 auto-deactivates (ownedQty=0 → isOwned=false)
- [x] Stepper buttons have hover rollover (brighter border, white text, subtle fill)
- [x] Owned number: dark gray when 0; muted when partial; green when fully owned
- [x] Qty number: white normally; red when over copy limit
- [x] Inline click-to-edit works for both numbers

**Grid view — price badge**
- [x] Price badge stays visible when overlay is open
- [x] Price badge always neutral (white/muted)

**List view — Owned column**
- [x] Column order: Owned (toggle) | Qty (X/Y) | Name | Type | Mana | Price | ×
- [x] Not-owned toggle: invisible at rest, appears on row hover
- [x] Owned toggle: always visible green
- [x] Clicking toggle marks/unmarks correctly

**List view — Qty column**
- [x] At rest: `ownedQty / quantity` numbers + slash
- [x] Row hover: owned + qty steppers appear
- [x] Owned controls always enabled; increment from 0 auto-activates
- [x] Stepper buttons have hover rollover
- [x] Over-copy-limit tooltip works
- [x] Price cell always neutral

**General**
- [x] No console errors on load
- [x] Sideboard toggle works

### QA Notes (Round 2 — patch issues)
- perfect implementation
- toggling owned resets back to qty when owned counter is higher or lower than qty. eg 5/4 -> owned toggle -> 4/4; owned counter should be retained regardless of state; it should only reset to qty on first toggle
- straddling looks good but encroaches on the title and type
- list view column title clips together. qty label should be right above the x/y column
- list view owned doesn't have same visual states as grid view

### Carry-Forward Fixes Applied

| File | Fix |
|------|-----|
| `src/hooks/useDeckManager.tsx` | `toggleIsOwned` retains `ownedQty` on deactivation; only fills to qty on first activation (ownedQty=0) |
| `src/components/workspace/Workspace.tsx` | `toggleSideboardIsOwned` same retain logic |
| `src/components/workspace/VisualCard.tsx` | Overlay padding `py-2.5` → `pt-3.5 pb-2.5` so badge straddle stays within padding area |
| `src/components/workspace/ListCardTable.tsx` | Owned column `<th>` emptied (no clipping); toggle has 3 states matching grid (not-owned/partial/full + hover red) |

### QA Checklist (Carry-Forward)

**Toggle retain behavior**
- [ ] Card at 5/4: toggle off → badge shows 0 state (not owned), counter retains 4 (verify on re-toggle: comes back as 4/4)
- [ ] Card at 0 owned: toggle on → fills to full qty
- [ ] Card at 2/4 (partial): toggle off → not owned; toggle on → returns to 2/4

**Grid overlay padding**
- [ ] Badge straddles overlay top edge without encroaching on card name or type text

**List view headers**
- [ ] Owned column header is blank (no clipping text)
- [ ] Qty header sits directly above the X/Y column

**List view toggle states**
- [ ] Not owned (at rest): transparent/hidden
- [ ] Not owned (row hover): faint green hint appears
- [ ] Partially owned: dark green bg, green border, white ✓ — always visible
- [ ] Fully owned: solid green bg, white ✓ — always visible
- [ ] Owned + hover: red warning bg/border/✓

### QA Notes (Round 3 — carry-forward)
- badge on static state doesn't turn red for the exceeding limit rules
- marking unowned should still dim out the counter and update the totals
- cases where violations occurred and we have owned cards — green shade and red text conflict on badge

### Session Summary

**Core feature:** Added `isOwned: boolean` to `DeckCard`. Replaced separate qty stepper + owned counter rows in the grid overlay with a unified `[− owned +] / [− qty +]` number row (progressive disclosure, steppers reveal on group hover). Redesigned the qty badge: rests at bottom-center with ownership-aware color (neutral/partial-green/full-green); animates to overlay-top on card hover and becomes a ✓ ownership toggle. Restructured list view columns to Owned (circle toggle) | Qty (X/Y steppers) | Name | Type | Mana | Price | ×.

**Carry-forward fixes (3 rounds of QA):**
- `toggleIsOwned` now retains `ownedQty` on deactivation; only fills to qty on first activation (ownedQty=0); re-activation restores prior count
- Overlay top padding increased (`pt-3.5`) so badge straddle doesn't encroach on card name/type
- List column header emptied (no overflow text); toggle has 3 states matching grid badge
- `ownedNumColor` dims when `isOwned=false`; `ownershipRatio` gates on `isOwned`; `useDeckStats` `remainingCost` and buy-list functions use `isOwned ? ownedQty : 0`
- Warning state (format violations, over copy limit) overrides badge to neutral dark bg + red border + red text — no green/red conflict when card is both owned and invalid

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
