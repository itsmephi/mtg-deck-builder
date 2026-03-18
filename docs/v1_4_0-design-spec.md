# v1.4.0 Design Spec — Standard & Commander Deck Format Support

> **Status:** DESIGN APPROVED — pending Claude Code prompt generation
> **Date:** 2026-03-17
> **Designed in:** Claude Chat design session + one-page visual density prototype
> **Prototype reference:** `v1_4_0-prototype-v3.html` (in Claude project files)
> **Backlog items addressed:** #17 (Support Standard and Commander deck modes), Commander threshold calibration (deferred enhancement — now resolved)
> **Depends on:** v1.3.1 shipped (current state)

---

## Theme

Make format a first-class concept. Every deck knows its rules — Freeform for casual building, Standard for competitive 60-card, Commander for singleton 100-card with a designated commander and color identity. The app informs, never blocks. Soft warnings everywhere, hard gates nowhere.

### Color Language

- **Commander = yellow/gold** — `bg-yellow-500` badges, `bg-yellow-300/12` card tint, `text-yellow-400` text. Reads as "special/royal."
- **Warnings = amber** — `bg-amber-500` / `text-amber-500`. Reads as "caution." Distinct from yellow at a glance.
- **Standard = blue** — `text-blue-400` / `bg-blue-400/10`. Consistent with existing UI accent.
- **Freeform = invisible** — no badges, no colors. Clean default.

---

## 1. Data Model Changes

### Deck Type

Two new fields on the `Deck` interface:

```ts
export interface Deck {
  id: string;
  name: string;
  cards: DeckCard[];
  sideboard?: DeckCard[];
  format: "freeform" | "standard" | "commander";  // NEW
  commanderId?: string;                             // NEW — DeckCard.id of the designated commander
}
```

- `format` defaults to `"freeform"` for migrated decks (any `Deck` missing the field gets `"freeform"` on load).
- `commanderId` is only meaningful when `format === "commander"`. Undefined otherwise. References the `id` field of a `DeckCard` in the deck's `cards` array.

### ScryfallCard Type

One new field:

```ts
export interface ScryfallCard {
  // ... existing fields ...
  color_identity?: string[];  // NEW — e.g. ["W", "U"], returned by Scryfall on every card
}
```

Scryfall returns `color_identity` on every card response. Existing cached cards in localStorage won't have this field — handled via lazy backfill (Section 12).

### DeckCard

No changes. `DeckCard` inherits `color_identity` from `ScryfallCard`.

---

## 2. Format Rules Engine

A single source of truth mapping format → rules. Implemented as a pure config object or utility, not scattered across components.

| Rule | Freeform | Standard | Commander |
|---|---|---|---|
| Target deck size | none | 60 | 100 |
| Card count color: green | 60 | 60 | 100 |
| Card count color: red | > 60 | > 60 | > 100 |
| Copy limit (soft warn threshold) | 5+ (current behavior) | 5+ (same) | 2+ (singleton) |
| Copy limit exemptions | Basic Land, "any number" | Basic Land, "any number" | Basic Land, "any number" |
| Sideboard allowed | yes (no max) | yes (15 max, soft warn) | no |
| Sideboard count warning | none | > 15 turns red | n/a — sideboard disabled |
| Commander slot | no | no | yes |
| Color identity validation | no | no | yes (requires commander designated) |
| Format legality check | no | Standard-legal | Commander-legal |
| Simulator probability thresholds | PROB_GREEN=0.08, PROB_YELLOW=0.04 | same | PROB_GREEN_CMD=0.05, PROB_YELLOW_CMD=0.02 |
| Simulator library excludes commander | n/a | n/a | yes — draw from 99, not 100 |

**All warnings are soft.** The app never blocks an add, never disables a button, never prevents a format switch. Red/amber visual signals + tooltips, always.

---

## 3. New Deck Creation Flow

### Current Behavior (replaced)

Clicking "+ New Deck" in the Decks tab instantly creates a blank unnamed deck.

### New Behavior

Clicking "+ New Deck" opens an **inline format picker popover** anchored above the button. Three selectable rows:

| Icon | Label | Subtitle |
|---|---|---|
| `—` (dash, neutral) | **Freeform** | No rules. Build anything. |
| `60` (blue number badge) | **Standard** | 60 cards · 4-copy limit · 15-card sideboard |
| `100` (yellow number badge) | **Commander** | 100 cards · Singleton · Commander + color identity |

**Visual treatment:**

- Popover: `bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl`, anchored above the "+ New Deck" button.
- Header: `text-[9px] font-bold text-neutral-500 uppercase tracking-widest` — "Choose Format".
- Each row: `px-3 py-2.5 hover:bg-neutral-800 cursor-pointer transition-colors`.
- Icon column: `w-6 text-center`.
  - Freeform: `—` dash in `text-neutral-600`.
  - Standard: `60` in `text-[10px] font-bold text-blue-400 bg-blue-400/10 px-0.5 rounded`.
  - Commander: `100` in `text-[9px] font-bold text-yellow-400 bg-yellow-400/10 px-0.5 rounded`.
- Label: `text-sm font-medium text-white`.
- Subtitle: `text-[10px] text-neutral-500` on a second line below the label.

**Interaction:**

- Clicking a row immediately creates the deck with that format and closes the popover.
- Clicking outside the popover closes it without creating a deck.
- No confirm button — the row click is the confirmation.
- Newly created deck starts unnamed (same as today), with `format` set to the chosen value.

---

## 4. Sidebar Changes

### Sidebar Width

Sidebar expanded width changes from `w-60` (240px) to `w-64` (256px) to accommodate format badges and inline elements. The collapsed rail remains 48px.

### Decks Tab — Deck Row Format Indicator

Each deck row in the Decks tab gains a small format number badge between the card count and the layers/sideboard icon:

**Row layout (left to right):**

`[active dot]` `[deck name]` `[card count]` `[format badge]` `[layers icon]` `[× delete]`

**Format badges:**

- **Freeform:** No badge. Space is simply not occupied.
- **Standard:** Small `60` text badge — `text-[9px] font-bold text-blue-400 bg-blue-400/10 px-1 rounded`.
- **Commander:** Small `100` text badge — `text-[9px] font-bold text-yellow-400 bg-yellow-400/10 px-1 rounded`.

### Decks Tab — No Deck-Level Warning Badge

No warning badge on deck rows. Warnings are surfaced on individual cards in the workspace only. This keeps the sidebar rows clean and uncluttered.

### Decks Tab — Sideboard Behavior for Commander

The layers/sideboard icon is **always present** for column alignment but **grayed out and disabled** for Commander-format decks.

- **Commander deck:** Layers icon styled as `text-neutral-800 cursor-not-allowed`. `disabled` attribute set. Tooltip: "Commander decks don't use sideboards".
- **Non-Commander decks:** Layers icon behavior unchanged (muted when no sideboard, blue when sideboard exists).

This ensures all deck rows have the same visual width and icon alignment regardless of format.

### Decks Tab — × Delete Dropdown

The existing × dropdown gains awareness of format:

- "Delete Deck" — always present.
- "Delete Sideboard" — present only if sideboard exists (unchanged).
- "Change Format" — **new option**, always present. Opens the same format picker popover used in deck creation (Section 3), anchored to the dropdown. Selecting a format updates the deck's `format` field.

**Format switch edge cases:**

- **Switching TO Commander from a deck with a sideboard:** A confirmation dialog appears (Section 5).
- **Switching FROM Commander to Standard/Freeform:** Clears `commanderId`. No other changes — the cards remain, the user just loses commander designation and color identity checks.
- **Switching between Standard and Freeform:** No data changes, just toggles validation behavior.

---

## 5. Sideboard-to-Commander Confirmation Dialog

When the user switches a deck to Commander format and that deck has a sideboard with cards in it, a modal confirmation dialog appears:

**Title:** "Commander decks don't use sideboards"

**Body:** "Your sideboard has [N] cards. What would you like to do?"

**Two buttons:**

- **"Merge into Main Deck"** — `bg-yellow-600 hover:bg-yellow-500 text-white`. Moves all sideboard cards into the main deck `cards` array (merging quantities for duplicates), then deletes the sideboard (`sideboard: undefined`). Sets `format: "commander"`.
- **"Delete Sideboard"** — `bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30`. Discards all sideboard cards, sets `sideboard: undefined`, sets `format: "commander"`.

**Cancel:** Clicking outside or pressing Escape cancels the format switch. Deck stays on its current format.

If the sideboard exists but is empty (`[]`), skip the dialog — just silently delete the empty sideboard and proceed.

---

## 6. Workspace Toolbar — Format Badge

### New Element: Format Badge

A small read-only pill badge appears in the toolbar after the deck name, before the card count. Only visible for Standard and Commander decks.

**Toolbar left side (updated order):**

`[Deck name]` `[Format badge]` `[Card count]` `[Total value]` `[To Buy]` `[Sideboard count]`

**Format badge appearance:**

- **Standard:** `text-[10px] font-medium text-blue-400 bg-blue-400/10 border border-blue-400/20 px-1.5 py-0.5 rounded-full` — reads "Standard".
- **Commander:** `text-[10px] font-medium text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-1.5 py-0.5 rounded-full` — reads "Commander".
- **Freeform:** No badge displayed.

**Interaction:**

- Clicking the badge opens the format picker popover (same component as deck creation / deck row change). Selecting a new format triggers the same logic as changing format from the Decks tab (including the sideboard confirmation dialog if applicable).

### Card Count — Format-Aware Colors

The card count stat in the toolbar becomes format-aware:

- **Freeform:** Green at 60, red above 60 (unchanged).
- **Standard:** Green at exactly 60, red above 60.
- **Commander:** Green at exactly 100, red above 100.

### Sideboard Count — Standard Max

When format is Standard and in sideboard view, the sideboard count shows `Side: X / 15` and turns red when X > 15.

### Main/Side Pill Toggle — Commander Visibility

The Main/Side pill toggle is **hidden** when the active deck's format is Commander (no sideboard in Commander).

---

## 7. Grid View — Commander & Warning Badges

### Top-Left Badge Area

The top-left corner of each card tile is reserved for status badges. Badges render left to right:

**Badge stacking order (left to right):**

`[crown badge]` `[warning badge]`

- Most cards: no badges visible (clean tile, art is the star).
- Commander (the designated card): `[crown]` only (or `[crown][!]` if it also has warnings).
- Card with format violations: `[!]` only.
- Commander with violations: `[crown][!]`.

### Crown Badge (Commander Only)

- **Size:** `w-7 h-7 rounded-full` — slightly larger than the warning badge for visual hierarchy.
- **Appearance:** Yellow filled circle with white crown icon — `bg-yellow-500 text-white shadow-md`.
- **Crown icon:** Bold, filled, geometric crown SVG at size 16. Path: `M3 18h18v2H3v-2zm0-2l3-8 4 3 2-6 2 6 4-3 3 8H3z`. Must be clearly readable at the badge size.
- **Persistent** — always visible on the designated commander card, not just on hover.
- **Only one card in the deck shows this badge** (the card matching `commanderId`).

### Warning Badge

- **Size:** `w-6 h-6 rounded-full`.
- **Appearance:** Amber circle with white `!` — `text-amber-500`, uses a filled circle SVG with white exclamation mark.
- **Persistent** — always visible when the card has any format violation.
- **Tooltip on hover:** Lists all violations for this card in a single combined tooltip, e.g.:
  - "Outside commander's color identity (has {R})\nExceeds singleton limit (2 copies)"
  - "Not legal in Standard"
  - "Banned in Commander"

### Yellow Background Tint (Commander Card)

The designated commander card gets a persistent yellow tint overlay on the card tile, in addition to the crown badge. Provides a secondary visual signal readable at small tile sizes.

- **Implementation:** `bg-yellow-300/12` overlay behind the card art, as a positioned div between the art and the badges.
- **Coexistence with hover overlay:** The yellow tint sits beneath the hover overlay. When hovering, the bottom overlay slides up as normal on top of the tinted card.

### Commander Designation — Grid View Hover Overlay

When `format === "commander"`, the hover overlay gains a crown icon button:

- **Position:** In the overlay, centered, above the qty controls. Small circular button (`w-6 h-6 rounded-full`) with a text label.
- **Not commander state:** Outline crown icon, muted (`text-neutral-400 bg-neutral-800/50`). Label: "Set as Commander" in `text-[9px] text-neutral-500`. Click designates this card as commander (clears any previous commander designation).
- **Is commander state:** Filled yellow crown icon (`text-yellow-400 bg-yellow-500/20`). Label: "Commander ✓". Click removes the designation.

**Eligibility soft-check:** When the user clicks to designate, if the card's `type_line` does not contain "Legendary" AND its `oracle_text` does not contain "can be your commander," the designation still applies but the tooltip reads "Set as Commander (not typically eligible)." Never blocked.

---

## 8. Grid View — Commander Card Pinning

The designated commander card always appears **first** in the card grid, regardless of the active sort order.

- The commander card is extracted from the sorted list and placed at position 0.
- A **subtle horizontal divider** separates the commander from the rest of the deck — a thin line (`border-b border-neutral-700/30`) spanning the full grid width. **No text label** — the crown badge + yellow tint + pinned position is sufficient identification.
- The remaining cards follow in their normal sort order below the divider.
- If no commander is designated, no pinning or divider appears.

**List view equivalent:** Same behavior — commander row pins to the top of the table with a thin divider row below it (no text label). The divider row is a single cell spanning all columns with `border-b border-neutral-700/30`.

---

## 9. List View — Redesigned Column Order & Commander/Warning Elements

### Column Order (new)

The list view column order changes to:

`[−qty+]` `[Owned]` `[Name]` `[Type]` `[Mana]` `[Price]` `[×]`

This groups the two "inventory" columns (qty and owned) together on the left, followed by the card identity columns.

### Qty Column

- **Header:** "Qty"
- **Width:** `w-24` (accommodates −, number, + inline).
- **Content:** `−` button, inline-editable quantity number, `+` button.
- **−/+ buttons:** `w-5 h-5 rounded-full bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white`. Visible on row hover only (`opacity-0 group-hover:opacity-100`) for non-commander rows. Always visible on commander row.
- **Qty number:** Inline-editable (click to type, Enter/blur commits, Escape reverts). Same behavior as current implementation.

### Owned Column (simplified)

- **Header:** "Owned"
- **Width:** `w-16`
- **Content:** `X/Y` text only — e.g. `0/1`, `1/1`, `3/4`. No checkbox, no −/+ buttons, no progress bar.
- **Inline editable:** Clicking the owned number (`X`) enters edit mode — same input behavior as qty (select-all on focus, Enter/blur commits, Escape reverts). Only the `X` value is editable; `Y` (quantity) is read-only display.
- **Color:** `text-green-400` when X ≥ Y (fully owned), `text-neutral-400` when X < Y.
- **Cursor:** `cursor-pointer hover:underline` to signal clickability.

**This replaces** the existing Owned column which had: Check icon (toggle), −/+ stepper buttons, inline-editable count, and progress bar. All of those are removed.

### Name Cell — Crown & Warning Elements

The Name cell gains two optional inline elements:

`[crown icon]` `[card name text]` `[! warning icon]`

**Crown icon (before name):**

- **Designated commander:** Persistent filled yellow crown (`text-yellow-400`, `w-3.5 h-3.5`, `CrownIcon filled`). Always visible.
- **Other cards in a Commander deck:** Outline crown icon (`text-neutral-600`, `w-3.5 h-3.5`), visible **only on row hover** (`opacity-0 group-hover:opacity-100`). Hover on the icon itself: `hover:text-yellow-400`. Clicking toggles commander designation.
- **Non-Commander format decks:** No crown icon at all.

**Warning icon (after name):**

- Persistent amber `!` icon (`text-amber-500`, `w-3.5 h-3.5`, `WarningIcon`). Always visible when the card has format violations.
- **Single icon per card** regardless of how many violations exist. Tooltip on hover lists all violations combined (multi-line).
- `ml-0.5` spacing from the card name.
- Hidden when no violations.

### Row Tint for Commander

The designated commander row gets a subtle yellow tint — `rgba(250, 204, 21, 0.08)` — matching the grid view yellow tint concept. The commander tint takes priority over existing color-identity-based row tints (yellow > color tint > hover).

### Commander Pinning in List View

Same as grid: commander row pins to position 0 in the table body, with a thin divider row below it (no text label). Divider row: single cell spanning all columns, `border-b border-neutral-700/30`.

---

## 10. Card Modal — No Commander Actions

The card modal does **not** include a "Set as Commander" / "Remove as Commander" button. The modal remains focused on card information, art display, legality details, and oracle rulings. Commander designation is handled exclusively via grid overlay and list view interactions.

The modal's existing **Legalities** section already shows format legality badges (standard: legal/not_legal/banned, commander: legal/not_legal/banned). No changes needed.

---

## 11. Opening Hand Simulator — Format-Aware

### Probability Thresholds

The simulator reads the active deck's format and applies the appropriate thresholds:

| Format | PROB_GREEN | PROB_YELLOW |
|---|---|---|
| Freeform | 0.08 (8%) | 0.04 (4%) |
| Standard | 0.08 (8%) | 0.04 (4%) |
| Commander | 0.05 (5%) | 0.02 (2%) |

The existing named constants (`PROB_GREEN`, `PROB_YELLOW`) are joined by `PROB_GREEN_CMD` and `PROB_YELLOW_CMD` at the top of `SampleHandModal.tsx`.

### Commander Excluded from Library

When the active deck is Commander format and a `commanderId` is set, the simulator **excludes the commander card from the library**. The opening hand is drawn from the remaining 99 cards (or however many non-commander cards exist).

- The simulator header subtitle (which shows Hand / Library / Mulligan counts) reflects this: Library count is total cards minus 1 (the commander).
- The commander card does not appear in the Draw Odds list.
- The commander card is never drawn into the opening hand.

This matches actual Commander gameplay where the commander starts in the command zone.

### Mulligan Behavior

London Mulligan rules apply to all formats (unchanged). No free first mulligan for Commander — that's a house rule we don't encode.

---

## 12. Color Identity Validation (Commander)

### When It Activates

Color identity checks only run when ALL of these are true:

1. Deck format is `"commander"`.
2. A `commanderId` is set.
3. The commander card has a non-empty `color_identity` array.

If any condition is false, no color identity warnings appear on any card.

### How It Works

The commander's `color_identity` defines the allowed colors (e.g., `["W", "U"]` for an Azorius commander). Every other card in the deck has its own `color_identity` checked against the commander's. If a card contains any color NOT in the commander's identity, it gets a warning.

**Examples:**
- Commander is `["W", "U"]`. A card with `["W"]` → OK. A card with `["W", "U", "B"]` → warning (has Black). A card with `["R"]` → warning (has Red). A colorless card `[]` → OK (colorless fits any identity).

### Lazy Backfill for Missing Data

Cards saved before this release won't have `color_identity` in their stored data. When a deck's format is set to Commander (either at creation or via format change):

1. Scan all cards in the deck for missing `color_identity`.
2. If any cards lack it, perform a batch Scryfall API fetch (using the existing `searchCards` pattern or a collection endpoint) to retrieve `color_identity` for those cards.
3. Update the stored card data with the fetched `color_identity`.
4. This happens once per format switch, silently in the background. No loading spinner needed unless it takes > 1 second — in which case, a brief "Updating card data..." toast.

Cards added after this release will always have `color_identity` populated from the Scryfall response. The `searchCards` function in `scryfall.ts` needs to include `color_identity` in the response mapping.

---

## 13. Format Legality Warnings

### When They Activate

Legality warnings only apply when the deck format is Standard or Commander. Freeform decks show no legality warnings.

### Data Source

Every card's `legalities` object (already returned by Scryfall and stored on `ScryfallCard`) contains format-specific status values: `"legal"`, `"not_legal"`, `"banned"`, `"restricted"`.

### Warning Conditions

A card gets a legality warning badge when:

- **Standard deck:** `card.legalities.standard` is `"not_legal"` or `"banned"`.
- **Commander deck:** `card.legalities.commander` is `"not_legal"` or `"banned"`.

### Warning Display

Uses the same amber `!` badge system described in Sections 7 and 9. Legality violations are combined with other violations (copy limit, color identity) into a single badge with a multi-line tooltip.

---

## 14. Copy Limit — Format-Aware Thresholds

### Current Behavior (Freeform — unchanged)

Soft warning at 5+ copies. Exempt: Basic Lands and "any number" cards.

### Standard

Same thresholds as Freeform. The 4-copy rule is Standard's rule, and the existing implementation already enforces it visually. No change needed.

### Commander (Singleton)

- **1 copy:** Normal (no warning).
- **2+ copies:** Warning. The amber `!` badge appears with tooltip "Exceeds singleton limit".
- **Exempt:** Basic Lands and "any number" cards — same exemptions, same check logic.

The copy limit check in the hover overlay's `− qty +` controls, list view, and the `otherPoolQtyMap` cross-pool check all become format-aware. For Commander decks, the threshold shifts from 4 to 1.

---

## 15. Import / Export — Format Metadata

### Export Format

Exported `.txt` files gain optional comment header lines encoding format and commander:

```
// Format: Commander
// Commander: Atraxa, Praetors' Voice
1 Atraxa, Praetors' Voice [ONE] #1 [owned:1]
1 Sol Ring [C21] #263
1 Arcane Signet [CMR] #297
...
```

- `// Format:` line — written for Standard and Commander decks. Omitted for Freeform (so exports from older versions import cleanly as Freeform).
- `// Commander:` line — written only for Commander decks with a designated commander. Uses the card name.

### Import Parsing

- `// Format: Standard` → sets `format: "standard"` on the imported deck.
- `// Format: Commander` → sets `format: "commander"`.
- `// Commander: [Card Name]` → after cards are fetched, matches the card name in the deck and sets `commanderId` to that card's `id`.
- No format comment → `format: "freeform"` (backward compatible).
- Existing `// comment` lines and `Sideboard` marker parsing unchanged.

---

## 16. Migration Strategy

### localStorage Migration

On app load, during the existing deck migration step in `useDeckManager`:

```ts
const migratedDecks = parsedDecks.map((deck: any) => ({
  ...deck,
  format: deck.format ?? "freeform",        // NEW — default to freeform
  commanderId: deck.commanderId ?? undefined, // NEW — no commander
  cards: deck.cards.map((card: any) => {
    if (card.ownedQty !== undefined) return card;
    return { ...card, ownedQty: card.isOwned ? card.quantity : 0 };
  }),
}));
```

No data loss, no breaking changes. Existing decks appear exactly as before with `format: "freeform"` — no warnings, no badges, no behavioral changes.

### Scryfall Response Mapping

`searchCards` in `scryfall.ts` adds `color_identity` to the mapped card object:

```ts
color_identity: card.color_identity ?? []
```

---

## 17. Mobile — No Changes This Milestone

Format support is fully functional on mobile (the data model and validation work everywhere), but no mobile-specific UI optimizations are included. The format picker popover, commander badges, and warning tooltips will render using standard responsive behavior. Mobile optimization remains deferred (#74, v2.0).

---

## 18. Search — No Changes This Milestone

Search results are **not filtered** by format legality. The user can add any card to any deck regardless of format. Warnings appear after the card is in the deck. This keeps the search experience simple and avoids the complexity of dynamically filtering results based on the active deck's format.

---

## 19. Explicitly Out of Scope

| Item | Reason |
|---|---|
| Partner commanders | Commander edge case; deferred to future Commander enhancement |
| Companion support | Separate mechanic, separate milestone |
| Search filtering by format legality | Decided: warn-after-add, not filter-before-add |
| Search filtering by color identity | Same — warn-after-add |
| Command zone in simulator | Commander is excluded from library; no visual "command zone" UI in simulator |
| Free first mulligan for Commander | House rule, not official |
| Format-specific EDHREC categories | Requires search refactor |
| Brawl format | Future format addition if demand exists |
| Oathbreaker format | Future format addition if demand exists |
| Mobile-specific format UI | v2.0 track |
| Hard validation (blocking adds) | Against design philosophy — always soft warnings |

---

## 20. Implementation Notes for Claude Code

### Prototype Reference

The visual density prototype `v1_4_0-prototype-v3.html` is the visual reference for badge sizing, color treatments, sidebar row layout, list view column order, and format picker design. Claude Code should match the prototype's appearance. Key elements to match:

- Crown badge: `w-7 h-7 bg-yellow-500` with bold filled crown icon at size 16
- Warning badge: `w-6 h-6 text-amber-500` with filled circle + white `!`
- Yellow card tint: `bg-yellow-300/12`
- Sidebar format badges: `60` (blue) and `100` (yellow) as small rounded text badges
- Sidebar layers icon grayed out for Commander (not hidden)
- Format picker popover: number badges as icons (not crown icon)
- List view column order: `[−qty+] [Owned] [Name] [Type] [Mana] [Price] [×]`
- List view Owned column: `X/Y` inline-editable text only, no checkbox/stepper/progress bar

### New Files

- `src/lib/formatRules.ts` — **new**: Format rules engine. Exports `getFormatRules(format)` returning target deck size, copy limit, sideboard rules, probability thresholds, etc. Pure functions, no React dependencies. Single source of truth for all format-specific logic.
- `src/components/layout/FormatPicker.tsx` — **new**: Shared popover component used by "+ New Deck" button, deck row × dropdown "Change Format", and toolbar format badge click. Renders the three format options with number badge icons. Accepts an `onSelect(format)` callback.

### Files Likely Touched

- `src/types/index.ts` — Add `color_identity` to `ScryfallCard`, add `format` and `commanderId` to `Deck`.
- `src/hooks/useDeckManager.tsx` — Migration logic, `setDeckFormat` and `setCommanderId` context methods, sideboard-to-Commander confirmation state.
- `src/lib/scryfall.ts` — Map `color_identity` from Scryfall responses. Lazy backfill utility function.
- `src/components/layout/SidebarDecksTab.tsx` — Format badge in deck rows, "+ New Deck" format picker, "Change Format" in × dropdown, layers icon grayed for Commander.
- `src/components/workspace/WorkspaceToolbar.tsx` — Format badge pill, format-aware card count colors, format-aware sideboard count, hide Main/Side pill for Commander.
- `src/components/workspace/VisualCard.tsx` — Crown badge, warning badge, yellow tint for commander, crown button in hover overlay.
- `src/components/workspace/ListCardTable.tsx` — Column reorder `[−qty+] [Owned] [Name] [Type] [Mana] [Price] [×]`. Simplified Owned column (remove checkbox, stepper, progress bar; replace with `X/Y` inline-editable text). Crown icon (persistent for commander, hover for others). Warning `!` icon after name. Commander row tint. Commander pinning with divider (no text label).
- `src/components/workspace/Workspace.tsx` — Commander pinning sort logic (extract commander, place first, divider), format-aware copy limit check in `otherPoolQtyMap`.
- `src/components/layout/SampleHandModal.tsx` — Format-aware probability thresholds, exclude commander from library.
- `src/hooks/useDeckImportExport.tsx` — Export format/commander comment lines, import parsing for format/commander lines.
- `src/hooks/useDeckStats.ts` — Format-aware deck size validation, sideboard size validation.
- `src/app/page.tsx` — Sidebar width `w-60` → `w-64`. Sideboard-to-Commander confirmation dialog.
- `src/config/version.ts` — Bump to 1.4.0 + changelog entry.

### localStorage Keys (new)

No new localStorage keys. Format and commanderId are persisted as part of the existing deck data in `mtg_builder_decks`.

### Component Extraction

- `FormatPicker.tsx` — shared popover, used in three locations.
- `formatRules.ts` — pure utility, no component.

### Validation Computation

Card-level warnings should be computed via a utility function `getCardWarnings(card, format, commanderIdentity)` returning `string[]`. This function lives in `formatRules.ts` alongside the format config.

### Key Technical Notes

- The `commanderId` references `DeckCard.id`, which is the Scryfall card ID. If a user removes the commander card from the deck, `commanderId` becomes a dangling reference — the app should treat this as "no commander designated" (skip color identity checks, don't show crown badge, don't pin).
- The format picker popover should use the same click-outside-to-close pattern as the existing delete dropdown in deck rows.
- Crown icon SVG: bold geometric crown (`M3 18h18v2H3v-2zm0-2l3-8 4 3 2-6 2 6 4-3 3 8H3z`), filled for active, stroked for hover-only outlines. Must be clearly readable at both `w-7 h-7` (grid badge) and `w-3.5 h-3.5` (list view).
- Color identity comparison is set-based: `cardIdentity.every(c => commanderIdentity.includes(c))`. If true, the card is within identity. If false, warning.
- The lazy backfill for `color_identity` should use Scryfall's `/cards/collection` endpoint (POST, up to 75 identifiers per request) for efficiency, matching the existing import fetch pattern.
- List view Owned column simplification removes the `lastOwnedQtyRef` restore-on-recheck logic, the Check/Minus/Plus icons for owned, and the progress bar div. Replace with a single `X/Y` span that enters inline edit mode on click.

---

## 21. Backlog Disposition After v1.4.0

| Backlog Item | Disposition |
|---|---|
| #17 Support Standard and Commander deck modes | **Closes** |
| Commander threshold calibration (deferred enhancement) | **Closes** (resolved by format-aware thresholds) |
| Partner commanders | **New Pipeline item** — deferred from this release |
| Companion support | **New Pipeline item** — future format enhancement |
| Brawl / Oathbreaker formats | **New Pipeline item** — future format additions |
| Search filtering by format / color identity | **New Pipeline item** — future search enhancement |
