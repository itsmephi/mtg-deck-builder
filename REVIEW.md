# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.16.0 — Partner Commander Support
Status: APPROVED ✅

### Plan Review

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add `keywords?: string[]` to `ScryfallCard`; change `commanderId?: string` → `commanderIds?: string[]` on `Deck` |
| `src/lib/formatRules.ts` | Add `PartnerType`, `getPartnerType()`, `getPartnerWithName()`, `canPartnerWith()`, `hasPartnerAbility()` partner detection and validation helpers |
| `src/hooks/useDeckManager.tsx` | Update `migrateDecks()` to map `commanderId` → `commanderIds`; replace `setCommanderId` with `setCommanderIds` + `addCommander` + `removeCommander` + `replaceCommander`; fix `setDeckFormat` to clear `commanderIds` |
| `src/hooks/useDeckImportExport.tsx` | Export: emit multiple `// Commander:` lines for 2 commanders; Import: collect all `// Commander:` lines into `commanderIds` array |
| `src/components/workspace/Workspace.tsx` | Update commander pinning for 2, `groupCardsByType` for 2, color identity union from both commanders, `commanderProps` spread, `prevCommanderRef` useEffect, art swap handler, `SampleHandModal` prop |
| `src/components/workspace/VisualCard.tsx` | Update props to `commanderIds`; implement crown state machine (Set as Commander / Set as Partner / Commander ✓ / Partner ✓); red crown badge for invalid pairing |
| `src/components/workspace/ListCardTable.tsx` | Update props to `commanderIds`; multi-commander pinning (2 rows + divider); crown state machine; red crown icon + amber `!` badge for invalid pairing |
| `src/components/workspace/SearchWorkspace.tsx` | Update `buildFilterSyntax` to use combined `commanderIds` identity; update `filterBadge` memo |
| `src/components/layout/SampleHandModal.tsx` | Accept `commanderIds?: string[]`; exclude all commanders from library |
| `src/config/version.ts` | Bump to `1.16.0`; add v1.16.0 changelog entry |

### QA Checklist

**Data Model & Migration**
- [ ] Existing decks with `commanderId` (old field) migrate cleanly — commander crown still shows after refresh
- [ ] Existing decks with no commander migrate to undefined commanderIds — no regression
- [ ] Backup files with old `commanderId` format restore correctly (commanderIds array preserved)
- [ ] New decks created after update use `commanderIds`

**Partner Detection**
- [ ] Card with generic Partner keyword detected correctly (e.g., Thrasios, Triton Hero)
- [ ] Card with "Partner with [name]" detected correctly (e.g., Pir, Imaginative Rascal)
- [ ] Card with Friends Forever detected correctly (e.g., Cecily, Haunted Mage)
- [ ] Non-partner card returns null — no spurious partner behavior

**Crown — Single Commander**
- [ ] No commander: crown outline appears on hover for eligible cards, "Set as Commander" tooltip
- [ ] No commander: ineligible cards show not-allowed cursor, no tooltip
- [ ] One commander set: crown on that card is solid yellow with "Commander ✓ — click to remove" tooltip
- [ ] Click commander's crown: removes commander designation
- [ ] One commander (has Partner) + hover partner-eligible card: tooltip says "Set as Partner"
- [ ] One commander (has Partner) + hover non-partner card: tooltip says "Set as Commander" (replaces)
- [ ] One commander (no partner) + hover any card: tooltip says "Set as Commander" (replaces)

**Crown — Two Commanders**
- [ ] Click commander 1's crown: removes commander 1, commander 2 becomes sole commander at [0]
- [ ] Click commander 2's crown: removes commander 2, commander 1 stays
- [ ] Hover partner-eligible card: tooltip says "Set as Partner", replaces commander 2 on click
- [ ] Hover non-partner card: tooltip says "Set as Commander", replaces commander 1 on click

**Partner Validation — Red Crown**
- [ ] Partner + Partner: both crowns yellow, no warning
- [ ] Friends Forever + Friends Forever: both crowns yellow, no warning
- [ ] Partner + Friends Forever: commander 2 badge red, tooltip "Partner and Friends Forever are incompatible"
- [ ] "Partner with X" + X: both crowns yellow, no warning
- [ ] "Partner with X" + wrong card: commander 2 badge red, tooltip "[card] can only partner with [X]"
- [ ] List view: red crown icon on commander 2 with invalid pairing; amber `!` badge with warning tooltip
- [ ] Commander 1 always shows yellow crown even when pairing is invalid

**Commander Pinning**
- [ ] Grid: both commanders pin to positions 0 and 1, divider appears after position 1
- [ ] List: both commanders in pinned rows above divider spacer
- [ ] Type grouping (Group by Type): both appear in "Commander" group
- [ ] Remove commander 2: remaining commander stays pinned, no second row

**Color Identity**
- [ ] Combined identity is union of both commanders' colors (e.g. Thrasios W/U + Tymna W/B = W/U/B)
- [ ] Cards outside combined identity show color violation warning
- [ ] Search filter `id<=` clause uses combined identity when both commanders are set
- [ ] Remove one commander: identity narrows to remaining commander only

**Sample Hand Simulator**
- [ ] Both commanders excluded from library
- [ ] Library count in header shows 98 for a 100-card deck with 2 commanders
- [ ] Neither commander appears in draw odds

**Import / Export**
- [ ] Export with 2 commanders: two `// Commander:` lines in the .txt file
- [ ] Export with 1 commander: one `// Commander:` line (no regression)
- [ ] Import with 2 `// Commander:` lines: both matched and set as commanderIds
- [ ] Import with 1 `// Commander:` line: backward compatible
- [ ] Round-trip: export then import preserves both commander designations

**Edge Cases**
- [ ] Remove a commander card from the deck: its entry clears from commanderIds
- [ ] Switch format away from Commander: commanderIds cleared
- [ ] "can be your commander" text card still works as solo commander
- [ ] Partner commander in sideboard view: crown behavior absent (sideboard has no commander slot)
- [ ] `npm run build` passes ✅ (verified)

### Session Summary

**What shipped:**

- **`src/types/index.ts`** — `commanderId?: string` replaced with `commanderIds?: string[]` on `Deck`; `keywords?: string[]` added to `ScryfallCard`
- **`src/lib/formatRules.ts`** — Added `PartnerType`, `getPartnerType()`, `getPartnerWithName()`, `hasPartnerAbility()`, `canPartnerWith()` — full partner detection and pairing validation logic with `keywords` array first, oracle_text fallback
- **`src/hooks/useDeckManager.tsx`** — `migrateDecks()` maps old `commanderId` → `commanderIds` array; replaced `setCommanderId` with `setCommanderIds`, `addCommander`, `removeCommander`, `replaceCommander`; `setDeckFormat` clears `commanderIds` when switching away from Commander
- **`src/hooks/useDeckImportExport.tsx`** — Export emits multiple `// Commander:` lines for partner pairs; import collects all `// Commander:` lines into `commanderIds` array; backward compatible with single-commander files
- **`src/components/workspace/Workspace.tsx`** — Commander pinning updated for up to 2 commanders (stable sort by commanderIds order); `groupCardsByType` routes all commanderIds to Commander group; color identity is union of all commanders; `partnerValidation` and `existingCommanderHasPartner` computed and passed to cards; `removeCard` clears the card's entry from commanderIds; art swap handler updates commanderIds for swapped commander; scroll-to-top effect triggers on any new commander addition; `SampleHandModal` receives `commanderIds`
- **`src/components/workspace/VisualCard.tsx`** — Crown state machine: "Set as Commander" / "Set as Partner" / "Commander ✓" / "Partner ✓" based on commanderIds state; red badge (`bg-red-500`) on commanderIds[1] when pairing invalid; tooltip shows warning message; hover crown shows correct label for all 3 states (0/1/2 commanders)
- **`src/components/workspace/ListCardTable.tsx`** — Multi-commander pinned rows (both commanders above divider spacer); crown state machine matches VisualCard; red crown icon (`text-red-400`) + amber `!` warning badge on invalid partner in list view
- **`src/components/workspace/SearchWorkspace.tsx`** — `buildFilterSyntax` uses union of all commanders' color_identity for `id<=` clause; `filterBadge` memo derives combined mana colors from all commanders
- **`src/components/layout/SampleHandModal.tsx`** — Accepts `commanderIds?: string[]`; excludes all commanders from library using `commanderIds.includes(c.id)`
- **`src/config/version.ts`** — Bumped to `1.16.0`; v1.16.0 changelog entry added
- **`CLAUDE.md`** — Version bumped to v1.16.0; `commanderId` references updated to `commanderIds`; partner detection/validation notes added to Key Technical Notes; Active Milestone note updated

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
