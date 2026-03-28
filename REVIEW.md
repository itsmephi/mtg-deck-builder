# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.17.0 — Price Badge on Card Tiles
Status: APPROVED ✅

### Plan Review

| File | Changes |
|------|---------|
| `src/components/workspace/VisualCard.tsx` | Add `tileSize` prop + `PRICE_BADGE_SIZES` scale map; price pill badge (bottom-right, always visible, fades on hover); deck overlay gains name + type above qty controls; search overlay drops redundant price line |
| `src/components/workspace/Workspace.tsx` | Pass `tileSize={tileSize}` to both VisualCard render sites (grouped and flat views) |
| `src/components/workspace/SearchWorkspace.tsx` | Pass `tileSize={tileSize}` to VisualCard in search results |
| `src/config/version.ts` | Bump to `1.17.0`; add v1.17.0 changelog entry |

### QA Checklist

- [x] Price pill visible at rest on deck grid tiles (all tile sizes)
- [x] Price pill visible at rest on search grid tiles (all tile sizes)
- [x] Price pill fades when hover overlay slides up (both modes)
- [x] No-price card shows `—` at reduced opacity
- [x] Deck overlay now shows card name + type above qty controls
- [x] Search overlay no longer shows price line (badge is sufficient)
- [x] Qty pill (bottom-center) and price pill (bottom-right) do not overlap at any tile size
- [x] `npm run build` passes ✅

### Session Summary

**What shipped:**

- **`src/components/workspace/VisualCard.tsx`** — Added `TileSizeKey` import and `PRICE_BADGE_SIZES` lookup table (XS→XL font/padding/position values); `tileSize` prop defaulting to `"m"`; price pill badge rendered outside the `overflow:hidden` inner container at bottom-right corner with `z-[22]`, `backdrop-filter: blur(8px)`, and `opacity-0` on group-hover (matching qty pill pattern); deck overlay updated to include card name (`text-xs font-semibold`) and type line (`text-[10px]`) above warning bar and qty controls; search overlay price `<span>` removed (redundant)
- **`src/components/workspace/Workspace.tsx`** — `tileSize={tileSize}` passed to both VisualCard sites (grouped card view and flat sorted view)
- **`src/components/workspace/SearchWorkspace.tsx`** — `tileSize={tileSize}` passed to VisualCard in search results grid
- **`src/config/version.ts`** — Bumped to `1.17.0`; changelog entry added
- **`CLAUDE.md`** — Version bumped to v1.17.0; Active Milestone updated

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
