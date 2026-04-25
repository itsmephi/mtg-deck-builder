# Backlog — Project Brew

<!-- 
  Shared ownership: Claude Code adds + triages, Phi adds between sessions.
  Claude.ai notes items via specs or prompts — does not edit this file directly.
  Triage: Claude Code proposes when inbox has new items, Phi approves.
  Format: - [type] Description  (types: bug, feature, enhancement, chore)
-->

---

## Inbox
<!-- New items land here. Triage promotes to Triaged or Parked. -->

- [ ] **enhancement** | **[high]** | Settings Hub: "Submit a Bug" button/link in Support tab (#78) — blocked: needs email address first
- [ ] **enhancement** | **[med]** | Artist search removed from CardModal — v1.21.0 removed the clickable artist name that triggered a search query; no equivalent path exists in FindByNameBar yet; consider adding artist name as a tappable link that pre-fills the bar with `a:"artist"` syntax or a future artist browsing mode ⚠️ needs design
- [ ] **bug** | Drop overlay fires during FindByNameBar preview — dragging a URL from an external source while the search preview is open triggers the DropOverlay behind the preview; the drop gesture should be suppressed or redirected while a preview is active ⚠️ needs design

---

## Triaged
<!-- Reviewed items with a version target. -->


### Phase 1 — Surface rebuild (current focus)

Items from v1.19.x carry-forwards and new additions:

- [ ] **enhancement** | **[high]** | Font size tokens — type feels small; establish font-size CSS custom properties (similar to color token system) for consistent scaling
- [ ] **bug** | **[high]** | Price "N/A" fallback — cards showing N/A have a TCGPlayer price; fallback should attempt a lookup or show a more accurate placeholder
- [ ] **enhancement** | Search: highlight newly added cards after FindByNameBar add — when closing the preview after adding, briefly highlight or scroll to the new card in the deck
- [ ] **enhancement** | Copy card name to clipboard — click card name in modal to copy ⚠️ needs design
- [ ] **enhancement** | Undo for destructive actions — toast with Undo for card delete and deck delete
- [ ] **enhancement** | CardModal art swap: option to confirm swap or add as new card instead ⚠️ needs design
- [ ] **enhancement** | Import modal — add "Paste from clipboard" button as an alternative to file import
- [ ] **enhancement** | Simulator modal has no view mode toggle — consider adding compact list view inside modal for larger decks
- [ ] **enhancement** | Price context — add framing around deck value (budget/mid/premium tier label or comparison)
- [ ] **enhancement** | Price color coding — color-code card prices from low to high (white → green → gold → purple)
- [ ] **enhancement** | Tile size affects list view — zooming/tile size changes should scale list view row density or font size, not just grid
- [ ] **chore** | Remove leftover MTG dev server on port 3000 — investigate and clean up
- [ ] **chore** | Component header comments — add a one-line comment at the top of key components describing what they do, for Phi's orientation

---

## Parked
<!-- Deferred to a future phase or TBD. -->
- [ ] **Capture path — drag-from-URL → FindByNameBar preview.** Drag is a capture gesture, not a commit gesture. ~80% of the time the source URL is signal-free for art; ~20% specifies a printing (TCGplayer product page, Scryfall link, Card Kingdom variant URL). Drag should land at the FindByNameBar inline preview, not commit directly. Default printing: parsed printing id if present, else most-recent (same fallback as search-bar flow). Spec scope: URL recognition (TCGplayer, EDHrec, Card Kingdom, Scryfall, paste paths), parse failure states, multi-card paste, integration with existing DropOverlay. Destination UI built in v1.21.0; this spec covers entry path only. Blocked on v1.21.0 being solid in real use.

### Phase 2 — IA and mobile

*Design only after Phase 1 surfaces are rebuilt — IA questions become clearer then.*

- [ ] **feature** | Home screen as persistent hub — recent activity, deck stats, quick-resume last deck ⚠️ needs design
- [ ] **feature** | Home screen deck covers — support custom deck cover art/images; Possibly use Scryfall art crops; DeckCoverCard is placeholder-ready with gradient tints for v1 ⚠️ needs design
- [ ] **feature** | Favorite/star decks — starred decks float to top or appear in a dedicated section ⚠️ needs design
- [ ] **feature** | New app name — Phi & Thurgood to brainstorm (#15) ⚠️ needs design
- [ ] **enhancement** | Deck cycling from collapsed rail — clean way to switch between decks without expanding the sidebar ⚠️ needs design
- [ ] **feature** | Custom card sorting by drag and drop (#16) ⚠️ needs design
- [ ] **chore** | Architecture review for public scaling — phased roadmap including mobile/tablet touch support
- [ ] **feature** | Touch screen / tablet UX support — hover and rollover states don't trigger on touch; need tap-based alternatives
- [ ] **chore** | Explore MCP filesystem connection — investigate whether Claude Chat can write files directly to local repo via MCP, eliminating manual download step

### Phase 3 — Brew mode

- [ ] **feature** | Rethink search or add a card with Claude Chat — explore AI-assisted card finding as part of find-by-name or Brew mode ⚠️ needs design
- [ ] **enhancement** | Turn-based draw probability slider — revisit for pre-game analysis view
- [ ] **enhancement** | Max % inline label in Draw Odds — deferred to keep UI clean
- [ ] **enhancement** | Category-level draw odds — requires card tagging system; stretch goal
- [ ] **enhancement** | Mulligan strategy hints — contextual guidance based on hand stats
- [ ] **enhancement** | Search: deck health panel — analyze deck composition and surface gaps (removal, card draw, ramp) in a dedicated panel, not in search categories
- [ ] **feature** | Deck rating / power score — calculate and display a score based on deck composition
- [ ] **feature** | Search pillars — curated search modes for brewing, discovery, beginner deck building ⚠️ needs design
- [ ] **feature** | Commander brackets support — tag cards with bracket ratings (e.g. Game Changer) per EDH bracket system ⚠️ needs design

### Phase 4 — Public release, accounts, Supabase

- [ ] **feature** | Supabase migration — move from localStorage to synced backend → v2.0.0
- [ ] **feature** | Cloud save / deck sharing — sync decks to cloud and share decks via link
- [ ] **feature** | Decklist library — save decklists to a shared library where others can load, view, or download them
- [ ] **chore** | Open source repo and apply for Vercel open source/supporter tier
- [ ] **enhancement** | Export: email deck list — send decklist via email from the export panel ⚠️ needs design

### Future / exploratory

- [ ] **feature** | Choose a Background commander support — allow Background enchantment as second commander for cards with "Choose a Background" keyword ⚠️ needs design
- [ ] **feature** | Doctor's Companion commander support — allow pairing with Time Lord Doctor creatures ⚠️ needs design
- [ ] **feature** | Companion support — future format enhancement
- [ ] **feature** | Brawl / Oathbreaker format support — future format additions
- [ ] **enhancement** | Search: spelling correction — suggest corrected card name on typo / no-results
- [ ] **enhancement** | Search: hold-to-peek — while in search view, hold a button to temporarily reveal the deck view, release to return to search ⚠️ needs design
- [ ] **feature** | Deck building via photo capture — scan physical cards with camera to add to deck
- [ ] **enhancement** | Foil card visual effect — apply foil shimmer or halo FX to foil cards in grid view

---
