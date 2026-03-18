# Grid Warning Redesign — Amber Ring + Overlay Bar

## Problem

The triangular ⚠ warning badge in grid view is positioned at the top-right corner of the card tile, straddling the edge (`top: -7px; right: -7px`). In a tight grid layout, this places the badge directly adjacent to the neighboring card, making it ambiguous which card the warning belongs to. In list view the triangle works fine because rows have clear vertical separation.

## Decision

Replace the corner triangle in **grid view only** with two complementary signals:

1. **Amber border ring (at rest)** — a subtle amber outline around the entire card tile, clearly owned by that card
2. **Warning bar (on hover)** — an amber-tinted bar at the top of the slide-up overlay with ⚠ icon and human-readable warning message

List view is unchanged — the triangle ⚠ badge stays as-is.

## Spec

### Amber Border Ring — At Rest

Applies to any card tile in grid view that has warnings (from `getCardWarnings`).

| Property | Value |
|---|---|
| Element | Overlay `div`, `position: absolute`, `inset: 0` |
| Border | `2px solid rgba(245, 158, 11, 0.45)` |
| Border radius | `12px` (matches card tile) |
| Pointer events | `none` |
| Z-index | `15` (below crown/pill/remove at 20–30, above card art) |

No inner glow, no box-shadow. Border only — keep it clean.

**Coexistence with other badges:**
- Crown badge (top-left): no conflict — ring is on the card edge, crown straddles outside
- Qty pill (bottom-center): no conflict — pill sits outside the ring
- × remove (top-right inset, hover only): no conflict — ring is behind it in z-order

### Warning Bar — On Hover (Inside Overlay)

Sits at the **top** of the slide-up overlay, above the qty controls.

| Property | Value |
|---|---|
| Layout | `flex`, `align-items: center`, `justify-content: center`, `gap: 5px` |
| Padding | `4px 8px` |
| Background | `rgba(245, 158, 11, 0.15)` |
| Border | `1px solid rgba(245, 158, 11, 0.3)` |
| Border radius | `6px` |
| Width | `100%` (fills overlay width) |

**Icon:** Small ⚠ triangle, 12×12, amber fill (`#fbbf24`), dark stroke for `!` mark (`#171717`).

**Text:** Warning message string from `getCardWarnings`. Font: `10px`, `font-weight: 600`, color `#fbbf24`, `white-space: nowrap`.

**Overlay structure (top to bottom):**
1. Warning bar (only if card has warnings)
2. Qty controls (−/qty/+)
3. Owned display

### Corner Triangle — Removed from Grid View

The `warning-badge` element at `top: -7px; right: -7px` is no longer rendered in grid view. No replacement corner element.

### List View — No Change

The existing triangle ⚠ badge in list view rows is unchanged. It works well with clear row separation.

## Out of Scope

- Warning bar click/tap behavior (no action — informational only)
- Multiple simultaneous warnings per card (show first warning; future enhancement if needed)
- Ring animation or pulse effects
- Any changes to `getCardWarnings` logic itself
