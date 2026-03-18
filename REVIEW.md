# REVIEW.md — MTG Deck Builder Session Journal

---

## Current Task: v1.5.0 — Grid Polish + Bug Fixes
Status: APPROVED ✅

---

## Session Summary

All 5 items shipped in two prompts. No carry-forwards.

**Prompt 1 (Items 1–3):** FormatPicker dynamic positioning across all three trigger points; collapsed rail `+` icon now opens FormatPicker to the right with full cancel support; commander eligibility hardened to a full block in list view (no-op click, `cursor-not-allowed`, updated tooltip).

**Prompt 2 (Items 4–5):** Grid view crown badge fully replaces the overlay "Set as Commander" button — interactive toggle with three states (active/eligible/ineligible), format-gated to Commander only. Persistent qty pill added at bottom-center of every grid tile with three color states and overlay fade-out behavior.

**Files changed:** `VisualCard.tsx`, `SidebarDecksTab.tsx`, `WorkspaceToolbar.tsx`, `SidebarRail.tsx`, `ListCardTable.tsx`, `version.ts`

---

## Testing Checklist

### Item 1 — FormatPicker Dynamic Positioning
- [ ] 1–2 decks in sidebar: click `+ New Deck` → picker opens **downward**
- [ ] 5+ decks in sidebar (trigger near bottom): click `+ New Deck` → picker opens **upward**
- [ ] Click a deck's format badge with room below → opens **downward**
- [ ] Click a deck's format badge near bottom of list → opens **upward**
- [ ] Click toolbar format pill (near top of page) → opens **downward**
- [ ] All pickers close on click-outside

### Item 2 — Collapsed Rail + Icon
- [ ] Collapse sidebar → click `+` → FormatPicker opens to the **right** of icon
- [ ] Select a format → deck created with that format, picker closes
- [ ] Press Escape → picker closes, no deck created
- [ ] Click outside picker → picker closes, no deck created
- [ ] "New Deck" tooltip hidden while picker is open

### Item 3 — Commander Eligibility Hard Check (List View)
- [ ] Commander format, list view: hover a non-Legendary card → crown appears, cursor is `not-allowed`
- [ ] Click crown on non-Legendary card → no-op, commander unchanged
- [ ] Tooltip on non-Legendary: "Must be Legendary to set as Commander"
- [ ] Hover a Legendary card → crown appears, cursor is `pointer`
- [ ] Click crown on Legendary → sets as commander correctly
- [ ] Card with "can be your commander" oracle text: crown is clickable and sets commander

### Item 4 — Crown Badge Toggle (Grid View)
- [ ] Commander format: hover any non-commander card → dim gray crown appears top-left
- [ ] Hover a Legendary card's crown → badge lights up gold, cursor pointer, scales slightly
- [ ] Click crown on Legendary → designates as commander, badge turns solid yellow
- [ ] Click active commander crown → deselects, card returns to hover-hint state
- [ ] Active commander crown: always visible (no hover needed), solid yellow circle
- [ ] Active commander crown: scales on hover as affordance
- [ ] Hover a non-Legendary card's crown → stays gray, cursor not-allowed, no color change
- [ ] Click non-Legendary crown → no-op
- [ ] Tooltip: "Set as Commander" on eligible, "Must be Legendary" on ineligible, "Remove as Commander" on active
- [ ] Freeform format: NO crown appears on hover for any card
- [ ] Standard format: NO crown appears on hover for any card
- [ ] "Set as Commander" / "Commander ✓" button is GONE from the hover overlay

### Item 5 — Persistent Qty Pill Badge
- [ ] Every grid tile has a circular pill at bottom center straddling the edge
- [ ] Pill shows the card's quantity number
- [ ] Fully owned card (ownedQty ≥ qty, qty > 0): green pill (`bg-green-800 / text-green-400`)
- [ ] Card with copy-limit warning: amber pill (`bg-orange-900 / text-orange-400`) — priority over green
- [ ] All other cards: neutral pill (`bg-neutral-900 / text-neutral-400`)
- [ ] Qty 0 card: shows `0` in neutral style (not green)
- [ ] Pill fades out when hover overlay slides up
- [ ] Pill returns when hover ends
- [ ] Crown badge (top-left), warning badge (top-right), and qty pill (bottom center) coexist without overlap

### General Regression
- [ ] Overlay qty controls (−/+, inline edit) still work correctly
- [ ] Owned counter inline edit still works
- [ ] × remove button still works
- [ ] Clicking card art still opens CardModal
- [ ] List view commander crown toggle still works (unchanged)
- [ ] All existing format switching flows work

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
