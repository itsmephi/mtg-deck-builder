# REVIEW.md — MTG Deck Builder Session Journal

---

## v1.19.2 — TCGPlayer Tab Drop
Status: APPROVED ✅

### Plan Review
| File | Changes |
|------|---------|
| `src/lib/scryfall.ts` | Add `searchCardsForDrop` (throws on network error, used by drop pipeline) |
| `src/hooks/useDeckManager.tsx` | Add `createNamedDeck`, `addCardToSpecificDeck`, `removeCardFromDeckById` to context type and implementation |
| `src/components/layout/DropOverlay.tsx` | New component — full-viewport fixed overlay shown during a URL drag |
| `src/app/page.tsx` | Window dragenter/dragleave/dragover/drop handlers; TCGPlayer URL parse + Scryfall resolve pipeline; undo toast state; `DropOverlay` render; toast updated to bottom-center pill with optional inline Undo button |

### QA Checklist

**Drop overlay**
- [ ] Drag a Chrome tab with a TCGPlayer URL over the app — overlay appears (full-viewport, semi-transparent dark backdrop, centered headline + subline)
- [ ] Release the drag without dropping (drag back to tab strip) — overlay disappears cleanly, no flicker
- [ ] Drag a file or image over the app — overlay does NOT appear (non-URL drag)

**Happy path — active deck**
- [ ] Drag a TCGPlayer single-card URL (e.g. `tcgplayer.com/product/{id}/magic-{set}-{card}`) onto the app — card is added to the active deck's main pool; workspace scrolls to / highlights the card
- [ ] Undo toast appears bottom-center: `"Added {Card Name}"` with `Undo` button; auto-dismisses after ~4 seconds
- [ ] Click `Undo` while toast is visible — card is removed from deck; toast replaced by `"Removed {Card Name}"` (2s)
- [ ] Let undo toast auto-dismiss — no undo fires; card stays in deck

**Happy path — no active deck (Home screen)**
- [ ] Drag a TCGPlayer URL onto the Home screen — new deck `"{Card Name} Deck"` is created and set active; card appears in it; workspace opens with card highlighted
- [ ] Click `Undo` — auto-created deck is deleted; returns to Home screen; `"Removed {Card Name}"` toast

**Sideboard pool**
- [ ] While in sideboard view, drop a TCGPlayer card — card is added to sideboard (not main deck)

**Card already in deck**
- [ ] Drop a card that is already in the active deck — quantity increments by 1; undo decrements by 1 (does not remove entry entirely)

**Set-specific printing**
- [ ] Drop a card URL from a specific set (e.g. Innistrad Midnight Hunt) — Scryfall resolves the correct set printing where possible

**Error paths**
- [ ] Drag a non-TCGPlayer URL (e.g. google.com link) onto the app — overlay shows, then error toast `"Card not found on TCGPlayer URL"` appears on drop
- [ ] Drag a TCGPlayer category URL (not a product page) — error toast appears
- [ ] Drop with no network (airplane mode) — toast `"Could not reach Scryfall. Try again."`

**Intersection states**
- [ ] Drop while a card modal is open — overlay covers the modal; card is added; modal stays open after drop
- [ ] Drop while Settings view is open — overlay covers settings; card is added in background; settings stays open

**Rapid drops**
- [ ] Drop two tabs within 4 seconds — first undo toast is replaced by second; first add remains in deck

### QA Notes
- "The Earth Crystal" slug initially failed due to article mismatch; fuzzy fallback (`/cards/named?fuzzy=`) resolved it mid-session
- "Jumbo Cactuar Borderless" failed due to `borderless` variant suffix being included in parsed card name; treatment-stripping logic added mid-session
- Overlay text and error toast genericized ("TCGPlayer" removed) to support future URL sources

### Session Summary
Implemented window-level TCGPlayer tab drop. User drags address bar URL onto the app; the app parses the TCGPlayer slug, resolves via Scryfall (set-aware, with price rescue), and adds the card with a 4-second undo toast. Auto-creates a deck if none is active. Two mid-session fixes: fuzzy name fallback for Scryfall name discrepancies, and treatment-suffix stripping (borderless, foil, showcase, etc.) to clean up TCGPlayer variant slugs. Overlay text and error messages genericized for future multi-source support.

---

## How This File Works
This file is the live session journal shared between Phi, Claude Chat, and Claude Code.
- **Claude Code writes:** Plan review table, testing checklist, session summary — committed only at session end
- **Phi writes:** Test results (checking boxes), inline comments on failures, emerging issues during QA
- **Claude Chat reads:** Verifies plan review, triages failures, incorporates findings into next Claude Code prompt
- Never committed to git mid-session — only in the final commit alongside CLAUDE.md and CHANGELOG.md
