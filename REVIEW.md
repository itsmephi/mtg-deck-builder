# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.17.1 — Partner Commander + Price Badge
Status: APPROVED ✅

### Plan Review

| File | Changes |
|------|---------|
| `src/types/index.ts` | `commanderId` replaced with `commanderIds: string[]`; localStorage migration for existing single-commander decks |
| `src/lib/formatRules.ts` | `getPartnerType()`, `canPartnerWith()` added; color identity updated to union of all commanders |
| `src/hooks/useDeckManager.tsx` | Multi-commander state management; partner validation; commander pinning logic |
| `src/hooks/useDeckImportExport.tsx` | Export two `// Commander:` lines for partner pairs; import handles multiple commander lines |
| `src/components/layout/SampleHandModal.tsx` | All commanders excluded from library; library count reflects both exclusions |
| `src/components/workspace/ListCardTable.tsx` | Red crown badge for invalid partner pairing (slot 2); both commanders pin to top |
| `src/components/workspace/VisualCard.tsx` | Partner crown state machine (Set as Commander / Set as Partner); red crown for invalid pairs; `tileSize` prop + `PRICE_BADGE_SIZES` scale map; persistent price pill badge (bottom-right); deck overlay shows name + type above qty controls; search overlay drops price line |
| `src/components/workspace/Workspace.tsx` | Pass `tileSize` to both VisualCard render sites |
| `src/components/workspace/SearchWorkspace.tsx` | Pass `tileSize` to VisualCard in search results |
| `src/config/version.ts` | Bump to `1.17.1`; add v1.17.1 and v1.16.0 changelog entries |
| `.claude/rules/branch-workflow.md` | Added frontmatter (description, alwaysApply) |
| `.claude/rules/release-workflow.md` | Clarified ≤3-file auto-proceed rule; added ARCHITECTURE.md review step |

### Session Summary

**What shipped (v1.16.0 — Partner Commander):**

- **`src/types/index.ts`** — `commanderId: string | null` replaced with `commanderIds: string[]` (max 2); localStorage migration converts existing single-commander decks on load
- **`src/lib/formatRules.ts`** — `getPartnerType(card)` detects Partner, Partner With [name], Friends Forever via Scryfall `keywords` array (falls back to `oracle_text`); `canPartnerWith(a, b)` validates all pairing combinations
- **`src/hooks/useDeckManager.tsx`** — Multi-commander add/remove, partner validation, color identity computed as union of all commanders
- **`src/hooks/useDeckImportExport.tsx`** — Import/export handles multiple `// Commander:` lines; backward compatible with single-commander files
- **`src/components/layout/SampleHandModal.tsx`** — All commanders excluded from library; library count updated
- **`src/components/workspace/ListCardTable.tsx`** — Red crown + amber `!` for invalid partner in list view; both commanders pin to top with divider below both
- **`src/components/workspace/VisualCard.tsx`** — Crown state machine: "Set as Commander" (replace) or "Set as Partner" (add to slot 2) based on partner ability detection; red crown badge (`bg-red-500`) for incompatible pairings

**What shipped (v1.17.1 — Price Badge):**

- **`src/components/workspace/VisualCard.tsx`** — `PRICE_BADGE_SIZES` lookup table (XS→XL font/padding/position); price pill outside `overflow:hidden` at bottom-right with `z-[22]`, `backdrop-filter: blur(8px)`, `opacity-0` on group-hover; deck overlay updated with card name (`text-xs font-semibold`) and type line (`text-[10px]`) above qty controls; search overlay price `<span>` removed
- **`src/components/workspace/Workspace.tsx`** — `tileSize={tileSize}` passed to both VisualCard sites
- **`src/components/workspace/SearchWorkspace.tsx`** — `tileSize={tileSize}` passed to VisualCard in search results
- **`src/config/version.ts`** — Bumped to `1.17.1`; v1.17.1 and v1.16.0 changelog entries added
- **`CLAUDE.md`** — Version bumped to v1.17.1; Active Milestone updated to v1.18.0

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
