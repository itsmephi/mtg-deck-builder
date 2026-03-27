# BACKLOG.md — MTG Deck Builder
<!-- Permanent backlog. Closed items live in CHANGELOG.md only — no duplication here. -->
<!-- See .claude/rules/backlog-and-capture.md for full lifecycle rules. -->

---

## Active Milestone
<!-- Items promoted from Pipeline for the current release. Cleared after release ships. -->

### v1.14.0 — CardModal & Search Polish
- [x] **enhancement** | CardModal search view: forward/back navigation buttons to mimic deck card modal behavior (#77) *(closed v1.14.0)*
- [x] **enhancement** | CardModal: show set abbreviation; clicking it searches that set in search view (#80) *(closed v1.14.0)*
- [x] **enhancement** | CardModal: clicking artist name triggers artist search in search view (#81) *(closed v1.14.0)*
- [x] **enhancement** | Search: sort direction toggle — asc/desc button outside the sort dropdown, mirroring deck view for UX consistency *(closed v1.14.0)*

---

## Pipeline
<!-- Triaged items not yet assigned to a milestone. New captures land here. -->
<!-- Priority format: **[high]** · **[med]** · **[low]** — set during triage, updated each session -->

- [ ] **enhancement** | **[high]** | Settings Hub: "Submit a Bug" button/link in Support tab (#78)
- [ ] **enhancement** | **[high]** | Search: auto-match format badge to active deck's format (#79)
- [ ] **feature** | **[high]** | Move cards between boards or decks (#62)
- [ ] **enhancement** | **[high]** | Import/export format compatibility — support MTGGoldfish format (e.g. `1 Ashling, the Limitless <borderless> [ECC] (F)`) and confirm cross-compatibility with TCGPlayer and Card Kingdom import
- [ ] **enhancement** | **[med]** | Search: list view toggle for search results — grid/list toggle in search toolbar, list view mirrors sidebar search list but wider ⚠️ needs design
- [ ] **enhancement** | **[med]** | Search: filter badge color per format — Commander gold, Standard blue, Freeform gray (needs design to avoid confusion with active/inactive states)
- [ ] **enhancement** | **[med]** | Search: highlight newly added cards on deck view switch — when returning to deck view after adding cards from search, briefly highlight or scroll to new cards ⚠️ needs design
- [ ] **enhancement** | **[med]** | Search view: back button to return to previous context ⚠️ needs design
- [ ] **enhancement** | **[med]** | Undo for destructive actions — toast with Undo for card delete and deck delete
- [ ] **feature** | **[med]** | Quick-add card by name from deck view — add a card without switching to search tab; inline name input or dedicated quick-add button ⚠️ needs design
- [ ] **feature** | **[med]** | Home screen as persistent hub — recent activity, deck stats, quick-resume last deck ⚠️ needs design
- [ ] **feature** | **[med]** | Home screen deck covers — support custom deck cover art/images; DeckCoverCard is placeholder-ready with gradient tints for v1 ⚠️ needs design
- [ ] **feature** | **[med]** | Custom card sorting by drag and drop (#16) ⚠️ needs design
- [ ] **enhancement** | **[med]** | Combine qty and owned fields into a single elegant input — two separate fields is redundant UX; design a unified interaction ⚠️ needs design (target pre-v2.0)
- [ ] **enhancement** | **[med]** | Import modal — add "Paste from clipboard" button as an alternative to typing/pasting manually
- [ ] **enhancement** | **[med]** | Active deck / sideboard indicator — show which board is active beyond just the toggle button ⚠️ needs design
- [ ] **enhancement** | **[med]** | Simulator modal has no view mode toggle — consider adding compact list view inside modal for larger decks; would also make pin-from-list interaction more prominent
- [ ] **enhancement** | **[med]** | Bulk mark all cards as owned — quick action to set owned qty on all cards at once ⚠️ needs design
- [ ] **feature** | **[med]** | Favorite/star decks — starred decks float to top or appear in a dedicated section ⚠️ needs design
- [ ] **enhancement** | **[med]** | Card price display missing from persistent grid tile — deferred from v1.3.0 design, needs design decision ⚠️ needs design
- [ ] **feature** | **[med]** | Partner commander support — allow 2 commanders for Partner and Friends Forever (Best Friends) pairs; deferred from v1.4.0
- [ ] **enhancement** | **[med]** | Price context — add some framing around deck value (budget/mid/premium tier label or comparison)
- [ ] **enhancement** | **[med]** | Onboarding hint layer — first-time user tips: create a deck before adding cards, how to switch tabs, how to add cards ⚠️ needs design
- [ ] **enhancement** | **[med]** | Font size tokens — type feels small; establish font-size CSS custom properties (similar to color token system) for consistent scaling
- [ ] **enhancement** | **[low]** | Search by foil — filter search results to foil printings only
- [ ] **enhancement** | **[low]** | Search: spelling correction — suggest corrected card name on typo / no-results
- [ ] **enhancement** | **[low]** | Margin parity between search and deck views — search is edge-to-edge, deck has p-4 outer + p-4 scroll container; future design pass to unify outer padding
- [ ] **feature** | **[low]** | New app name — Phi & Thurgood to brainstorm (#15) ⚠️ needs design
- [ ] **chore** | **[low]** | Architecture review for public scaling — phased roadmap including mobile/tablet touch support
- [ ] **chore** | **[low]** | Open source repo and apply for Vercel open source/supporter tier
- [ ] **chore** | **[low]** | Explore MCP filesystem connection — investigate whether Claude Chat can write files directly to local repo via MCP, eliminating manual download step ⚠️ needs research
- [ ] **enhancement** | Copy card name to clipboard — one-click copy button on card tiles or modal
- [ ] **feature** | Backup decks — export/restore deck data as a local backup file; fallback before cloud sync is implemented
- [ ] **enhancement** | CardModal art swap: option to confirm swap or add as new card instead
- [ ] **workflow** | Organize /docs folder and update workflow documentation accordingly
- [ ] **bug** | Search progress circle not animating — spinner appears but doesn't spin during search
- [ ] **bug** | Art swap loses commander status — swapping art clears `commanderId` even when the same card stays commander
- [ ] **chore** | Research Secret Lair set names — investigate whether Secret Lair drops use set-specific codes or names in Scryfall (e.g. for set search and badge matching)

---

## v2.0 Deferred
<!-- Items explicitly pushed to v2.0 -->

- [ ] **enhancement** | Turn-based draw probability slider — revisit for pre-game analysis view
- [ ] **enhancement** | Max % inline label in Draw Odds — deferred to keep UI clean
- [ ] **enhancement** | Category-level draw odds — requires card tagging system; stretch goal
- [ ] **enhancement** | Mulligan strategy hints — contextual guidance based on hand stats
- [ ] **feature** | Decklist library — save decklists to a shared library where others can load, view, or download them
- [ ] **feature** | Touch screen / tablet UX support — hover and rollover states don't trigger on touch; need tap-based alternatives
- [ ] **enhancement** | Search: deck health panel — analyze deck composition and surface gaps (removal, card draw, ramp) in a dedicated panel, not in search categories
- [ ] **feature** | Deck rating / power score — calculate and display a score based on deck composition
- [ ] **feature** | Cloud save / deck sharing — sync decks to cloud and share decks via link
- [ ] **enhancement** | Foil card visual effect — apply foil shimmer or halo FX to foil cards in grid view
- [ ] **feature** | Companion support — future format enhancement
- [ ] **feature** | Brawl / Oathbreaker format support — future format additions
- [ ] **enhancement** | Export: email deck list — send decklist via email from the export panel ⚠️ needs design
- [ ] **enhancement** | Search: hold-to-peek — while in search view, hold a button to temporarily reveal the deck view, release to return to search ⚠️ needs design
- [ ] **feature** | Search pillars — curated search modes for brewing, discovery, beginner deck building ⚠️ needs design
- [ ] **feature** | Deck building via photo capture — scan physical cards with camera to add to deck
- [ ] **feature** | Commander brackets support — tag cards with bracket ratings (e.g. Game Changer) per EDH bracket system ⚠️ needs design

---
