# v1.5.0 Design Spec — Grid Polish + Bug Fixes

## Milestone Scope

1. **bug** | "+ New Deck" format picker clips when decklist is short — dynamic positioning
2. **bug** | + icon in collapsed sidebar rail skips format picker
3. **enhancement** | Commander eligibility enforce legendary legality
4. **enhancement** | Crown badge toggle on grid tiles (hover on all cards)
5. **enhancement** | Persistent qty pill badge on grid tiles (bottom center)

Prototype: `docs/v1_5_0-grid-tile-prototype.html`

---

## 1. Format Picker Dynamic Positioning

**Problem:** The "+ New Deck" format picker popover always opens upward. When the decklist is short (1–3 decks), it clips above the sidebar viewport.

**Fix:** The FormatPicker popover should measure available space and flip direction:
- **Short decklist (room below):** Open downward.
- **Long decklist (near bottom of sidebar):** Open upward (current behavior).

**Implementation approach:** Use a ref on the trigger button, measure `getBoundingClientRect()` against `window.innerHeight`. If there's more room below the trigger than above, open downward; otherwise open upward. This applies to all FormatPicker instances (+ New Deck button, sidebar deck row badge, toolbar badge).

---

## 2. Collapsed Sidebar Rail — Format Picker on + Icon

**Problem:** The `+` icon in the collapsed sidebar rail creates a new deck without triggering the format picker, bypassing format selection entirely.

**Fix:** Clicking the `+` icon in the collapsed rail must open the FormatPicker popover (positioned to the right of the rail, since the sidebar is collapsed). The deck is only created after a format is selected — same flow as the expanded "+ New Deck" button.

**Behavior:**
- Click `+` on rail → FormatPicker popover appears to the right of the icon
- User selects format → new deck created with that format
- Escape or click-outside → popover closes, no deck created

---

## 3. Commander Eligibility — Enforce Legendary

**Problem:** Any card can currently be marked as commander, even non-legendary creatures. The existing soft-check shows a tooltip but still allows designation.

**Fix:** Harden the eligibility check. Non-legendary cards (cards whose `type_line` does not contain "Legendary" AND whose `oracle_text` does not contain "can be your commander") **cannot** be designated as commander. The click is a no-op.

**Applies to all entry points:**
- Grid view crown badge (new hover toggle — see §4)
- List view crown icon toggle
- Any other future entry points

**Tooltip on ineligible cards:** "Must be Legendary to set as Commander"

**Note:** This changes the current behavior from soft-check to hard-check. The "not typically eligible" tooltip language is retired.

---

## 4. Crown Badge Toggle — Grid View

**Reference:** Prototype Row 1 (Commander Format — Crown Toggle Behavior)

### Current behavior
- Active commander: solid yellow crown badge, always visible, top-left
- "Set as Commander" / "Commander ✓" text button inside the hover overlay
- Non-commander cards: no crown

### New behavior

**All cards show a dim crown on hover (Commander format only):**

| Card state | Crown visibility | Crown style | Click behavior | Tooltip |
|---|---|---|---|---|
| Active commander | Always visible | Solid yellow circle (`bg-yellow-500`), white crown SVG, `shadow-md` | Deselects commander | "Remove as Commander" |
| Legendary (not commander) | Hover only | Dark semi-transparent circle (`bg-neutral-900/70`), `border-1.5 border-neutral-600`, gray crown SVG | Sets as commander (swaps if one exists) | "Set as Commander" |
| Non-legendary | Hover only | Same dim style as above | **No-op** (not clickable) | "Must be Legendary" |

**Active commander hover interaction:**
- Crown scales up slightly on hover (`scale(1.1)`) as affordance that it's clickable

**Eligible legendary hover interaction:**
- On badge hover: border turns gold (`border-color: #eab308`), background gains yellow tint (`bg-yellow-500/20`), crown SVG turns gold, scales up slightly
- Cursor: pointer

**Non-legendary hover interaction:**
- Crown stays dim gray on hover — no color change
- Cursor: `not-allowed`

**Position:** Top-left, offset straddling the card edge — same position as the existing active commander crown (`absolute -top-3.5 -left-3.5`, `w-7 h-7 rounded-full`, `z-20`)

**Crown SVG:** Same path as current: `M3 18h18v2H3v-2zm0-2l3-8 4 3 2-6 2 6 4-3 3 8H3z`
- Active: 18×18, `fill="white"`
- Hover hint: 16×16, `fill="#737373"` (turns `#eab308` on hover for eligible)

**Overlay change:** Remove the "Set as Commander" / "Commander ✓" button from the slide-up overlay entirely. The crown badge is now the sole toggle point in grid view.

**Format gating:** Crown hover behavior only appears when `format === "commander"`. In Freeform and Standard, no crown is shown on any card (including hover).

---

## 5. Persistent Qty Pill Badge — Grid View

**Reference:** Prototype Row 2 (Owned/Qty Pill — Color States)

### Current behavior
- No persistent badge on grid tiles (qty badge was removed in v1.3.2)
- Qty only visible in the hover overlay

### New behavior

**Circular qty badge at bottom center of each card tile, straddling the bottom edge.**

**Position:** `absolute`, `bottom: -8px`, centered horizontally (`left-1/2 -translate-x-1/2`), `z-20`

**Size:** `w-6 h-6 rounded-full` (24×24 circle)

**Content:** Qty number only (e.g. `1`, `4`, `5`). Font: `text-xs font-bold tabular-nums`, centered.

**Color logic — three states:**

| Condition | Background | Text color | When |
|---|---|---|---|
| Fully owned | `bg-green-800` | `text-green-400` | `ownedQty >= quantity` |
| Warning (copy limit) | `bg-orange-900` | `text-orange-400` | Card has copy-limit warning (from `getCardWarnings`) |
| Neutral | `bg-neutral-900` | `text-neutral-400` | All other cases (partially owned, zero owned) |

**Priority:** Warning > Fully owned > Neutral. If a card is both fully owned AND over the copy limit, show warning state.

**Shadow:** `shadow-md` (same depth as crown/warning badges) — `box-shadow: 0 2px 6px rgba(0,0,0,0.5)`

**Hover behavior:** Pill fades out (`opacity-0, pointer-events-none`) when the slide-up overlay is active, since the overlay has its own qty controls with full editing. Transition: `transition-opacity duration-150`.

**Qty 0 cards:** Pill still shows `0` in neutral style (card is grayed out per existing behavior).

**Coexistence with other badges:**
- Crown badge: top-left — no conflict
- Warning badge: top-right — no conflict
- × remove: top-right inset, hover only — no conflict
- Slide-up overlay: covers pill on hover — handled by opacity fade

---

## Implementation Notes

- Items 1–3 are self-contained fixes, no new components
- Items 4–5 modify `VisualCard.tsx` — should be in the same prompt since they touch the same file and interact visually
- The overlay "Set as Commander" button removal (§4) is a deletion, not a restyle
- FormatPicker positioning (§1) affects the shared FormatPicker component — test all three trigger points (+ New Deck, sidebar badge, toolbar badge)
- Prototype should be committed to `docs/v1_5_0-grid-tile-prototype.html` so Claude Code can reference it

---

## Out of Scope

- List view changes (list view crown toggle already works correctly)
- Owned/qty display changes in the hover overlay (stays as-is)
- Any Pipeline items
