# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.11.0 — Theme System: Workspace Components (Prompt 3 of 3)
Status: APPROVED ✅

### Plan Review

| File | Changes |
|---|---|
| `src/components/workspace/SearchBar.tsx` | Container row `bg-neutral-950` → `bg-surface-deep`; `focus-within:border-neutral-600` → `focus-within:border-input-edge-focus`; freeform badge active state `border border-neutral-600` → `border border-line-hover`; input text `text-content-heading` → `text-input-value`; placeholder `placeholder:text-content-faint` → `placeholder:text-input-placeholder`. Input `bg-transparent` already — no bg/border change on `<input>` itself (transparent inside the container). |
| `src/components/workspace/SearchWorkspace.tsx` | `text-neutral-700` → `text-content-disabled` (List view disabled button, line 335). Sort select uses `bg-surface-base border-line-subtle` — not `bg-surface-raised` — no input token migration needed. |
| `src/components/workspace/WorkspaceToolbar.tsx` | Deck name input `hover:border-line-default` → `hover:border-input-edge` (line 142, hover border only — text stays `text-content-primary`); `text-neutral-700` → `text-content-disabled` ×2 (Side button disabled, line 267; sort direction disabled, line 295). |
| `src/components/workspace/VisualCard.tsx` | `hover:bg-neutral-600` → `hover:bg-surface-hover` ×4 (qty − button line 217, qty + button line 266, owned − button line 279, owned + button line 339). Leave `bg-neutral-700/50` (opacity variant) and `bg-neutral-900/70` (opacity variant) untouched. |
| `src/components/workspace/ListCardTable.tsx` | `text-neutral-700` → `text-content-disabled` (X remove icon, line 470). Leave `text-neutral-100` (name column — flagged, no token). Leave `border-neutral-800/40` (opacity variant). |
| `src/components/workspace/ImportModal.tsx` | **No changes** — no textarea present; this is the file-pick choice modal (current/new deck buttons only). No raw neutral classes found. |
| `src/components/workspace/Workspace.tsx` | **No changes** — no flagged neutral classes remaining per spec. |
| `src/components/workspace/TileSizeSlider.tsx` | **No changes** — no flagged neutral classes. |
| `src/config/version.ts` | Bump `APP_VERSION` to `"1.11.0"`; add `"1.11.0"` CHANGELOG entry array. |
| `CLAUDE.md` | Update "Design token system" bullet (25 tokens, dual palette, new token categories, depth model, flagged mid-tones resolved, theme switching note); update "Active Milestone" line. |
| `BACKLOG.md` | Add v1.11.0 Closed header, move token entry. |

7 source files reviewed (3 modified, 4 confirmed no-op) + version bump + 2 doc files. No new components.

---

### Testing Checklist

#### Foundation
- [ ] `npm run build` passes with no errors
- [ ] Body background and text use token vars (verified via build)

#### SearchBar
- [ ] Search bar container background is darker than sidebar (bg-surface-deep vs bg-surface-panel)
- [ ] Typing in search field: text is `text-input-value` (warmer/lighter than before)
- [ ] Placeholder text: subtle but visible (`text-input-placeholder`)
- [ ] Focus ring: border changes to copper (Warm Stone) on focus — `border-input-edge-focus`
- [ ] Freeform format badge (active, no deck format): border is `border-line-hover`

#### Sidebar
- [ ] Sidebar background visibly different from workspace (raised in Warm Stone)
- [ ] Active deck row in sidebar blends into sidebar body (`bg-surface-panel`)
- [ ] Disabled Layers icon (Commander decks): `text-content-disabled`
- [ ] × delete button (hover-only): `text-content-disabled` before hover

#### FilterPanel inputs
- [ ] Price min/max inputs appear raised above filter panel background
- [ ] Year min/max inputs appear raised
- [ ] Input borders use `border-input-edge`

#### WorkspaceToolbar
- [ ] Deck name input: hover border uses `border-input-edge`; text stays `text-content-primary`
- [ ] "Side" button (disabled, no sideboard): `text-content-disabled`
- [ ] Sort direction button (disabled, sort=Original): `text-content-disabled`

#### VisualCard (deck mode)
- [ ] Qty −/+ buttons: hover surface is `bg-surface-hover` (was `hover:bg-neutral-600`)
- [ ] Owned −/+ buttons: same `bg-surface-hover` on hover

#### ListCardTable
- [ ] X remove icon: `text-content-disabled` (dim), turns red on hover

#### SearchWorkspace
- [ ] List view toggle button (disabled): `text-content-disabled`

#### Theme switching (dev tools test)
- [ ] Add `data-theme="zed-dark"` to `<html>` → all surfaces shift to blue-gray palette
- [ ] Sidebar becomes recessed (darker than workspace)
- [ ] Focus accents change from copper (#c07a50) to blue (#528bff)
- [ ] Remove attribute → reverts to Warm Stone

#### Cross-cutting
- [ ] No regressions on accent colors (blue buttons, yellow Commander, red warnings, green owned)
- [ ] Opacity variants unchanged throughout
- [ ] `text-neutral-100` still present in ListCardTable name column (intentional)

---

### Session Summary

**What shipped (Prompt 3):**

- **`src/components/workspace/SearchBar.tsx`** — container `bg-surface-deep`; `focus-within:border-input-edge-focus`; freeform badge `border-line-hover`; input `text-input-value`; placeholder `text-input-placeholder`
- **`src/components/workspace/SearchWorkspace.tsx`** — `text-content-disabled` on List view disabled button
- **`src/components/workspace/WorkspaceToolbar.tsx`** — deck name hover border `border-input-edge`; `text-content-disabled` ×2 on Side disabled + sort direction disabled
- **`src/components/workspace/VisualCard.tsx`** — `hover:bg-surface-hover` ×4 on all qty/owned ±  buttons
- **`src/components/workspace/ListCardTable.tsx`** — `text-content-disabled` on X remove icon
- **`src/config/version.ts`** — bumped to 1.11.0, CHANGELOG entry added
- **`CLAUDE.md`** — design token bullet updated to 25 tokens, dual palette, depth model, resolved flagged classes, theme switching; Active Milestone updated
- **`BACKLOG.md`** — v1.11.0 closed entry added

**Remaining raw neutral classes (all intentional):**

| Class | Location | Reason |
|---|---|---|
| `text-neutral-100` | ListCardTable name col | No lighter-than-primary token — flagged carry-forward |
| `bg-neutral-700/50` | VisualCard qty buttons (rest state) | Opacity variant — excluded per spec |
| `bg-neutral-900/70` | VisualCard crown button bg | Opacity variant — excluded per spec |
| `border-neutral-600` | VisualCard crown button (rest), CardModal spinner | Not in prompt scope for these files; crown button is a very specific visual |
| `ring-neutral-950` | VisualCard in-deck dot ring | Ring offset contextual color — not in migration map |
| `ring-offset-neutral-950` | Workspace highlight ring ×2 | Ring offset contextual — not in migration map |
| `bg-neutral-800` | TileSizeSlider open state | Per v1.10.0 notes: whole class group left as-is by convention (border-neutral-700/50 paired) |
| `focus:border-neutral-500` | FilterPanel inputs ×4 | Focus state only; not in migration map for this prompt |
| `border-neutral-800/50` | Sidebar footer dividers | Opacity variant — excluded |
| `bg-neutral-900/50` | Sidebar footer bg, SampleHandModal empty state | Opacity variants — excluded |
| `bg-neutral-800/50` | FormatPicker active row, SidebarDecksTab hover | Opacity variants — excluded |
| `bg-neutral-500/10`, `bg-neutral-500/20` | Freeform badges (FF, WorkspaceToolbar) | Opacity variants — excluded |
| `bg-neutral-700/60`, `bg-neutral-700/40` | FilterPanel color chip active (B, C) | Opacity variants — excluded |
| `border-neutral-700/50` | SearchWorkspace grid button, WorkspaceToolbar active toggles | Opacity variants — excluded |

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
