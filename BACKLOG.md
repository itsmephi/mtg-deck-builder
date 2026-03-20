# BACKLOG.md — MTG Deck Builder
<!-- Permanent backlog. Items live here from capture through completion. -->
<!-- See .claude/rules/backlog-and-capture.md for full lifecycle rules. -->

---

## Active Milestone
<!-- Items promoted from Pipeline for the current release. Cleared after release ships. -->

- [x] **enhancement** | Search filtering by format legality / color identity (#72) *(closed v1.6.0)*
- [x] **enhancement** | EDHREC improved search suggestions (#26) *(closed v1.6.0)*

---

## Pipeline
<!-- Triaged items not yet assigned to a milestone. New consolidation items land here. -->

- [ ] **feature** | New app name — Phi & Thurgood to brainstorm (#15) ⚠️ needs design
- [ ] **feature** | Custom card sorting by drag and drop (#16)
- [ ] **feature** | Partner commander support — deferred from v1.4.0
- [ ] **feature** | Companion support — future format enhancement
- [ ] **feature** | Brawl / Oathbreaker format support — future format additions
- [ ] **feature** | Move cards between boards or decks (#62) ↑ priority
- [ ] **enhancement** | Simulator modal has no view mode toggle — consider adding compact list view inside modal for larger decks; would also make pin-from-list interaction more prominent
- [ ] **enhancement** | Settings panel redesign — 2 clicks to access settings is a UX regression from v1.3.0 sidebar changes
- [ ] **enhancement** | Card price display missing from persistent grid tile — deferred from v1.3.0 design, needs design decision ⚠️ needs design
- [ ] **enhancement** | Grid view column size presets — small (6 col), medium (4 col), large (2 col); bonus: auto-set based on screen size
- [ ] **enhancement** | Unify project styling via CSS custom properties or design tokens — changing a background color or theme value should touch one place, not multiple files
- [ ] **enhancement** | Combine qty and owned fields into a single elegant input — two separate fields is redundant UX; design a unified interaction ⚠️ needs design
- [ ] **enhancement** | Import/export format compatibility — support MTGGoldfish format (e.g. `1 Ashling, the Limitless <borderless> [ECC] (F)`) and confirm cross-compatibility with TCGPlayer and Card Kingdom import
- [ ] **enhancement** | Import modal — add "Paste from clipboard" button as an alternative to typing/pasting manually ⚠️ needs design
- [ ] **enhancement** | Search: list view toggle for search results — grid/list toggle in search toolbar, list view mirrors sidebar search list but wider ⚠️ needs design
- [ ] **enhancement** | Search: deck health panel — analyze deck composition and surface gaps (removal, card draw, ramp) in a dedicated panel, not in search categories ⚠️ needs design
- [ ] **enhancement** | Search: hold-to-peek — while in search view, hold a button to temporarily reveal the deck view, release to return to search ⚠️ needs design
- [ ] **enhancement** | Search: price filter "Any" toggle — remove price ceiling for searching expensive cards
- [ ] **enhancement** | Search: filter section "Deselect All" button — quick way to clear all toggles in a filter group then select one
- [ ] **enhancement** | Search: color filter chips match mana colors — W chip white-tinted, R chip red-tinted, etc.
- [ ] **enhancement** | Search: filter badge color per format — Commander gold, Standard blue, Freeform gray (needs design to avoid confusion with active/inactive states)
- [ ] **enhancement** | Search: highlight newly added cards on deck view switch — when returning to deck view after adding cards from search, briefly highlight or scroll to new cards ⚠️ needs design
- [ ] **enhancement** | Search: emoji in deck names — optional personalization feature for deck names
- [ ] **enhancement** | Search CardModal: keep modal open after adding card — return to Details tab instead of closing, matching deck view Confirm Art Swap behavior

---

## v2.0 Deferred
<!-- Items explicitly pushed to v2.0 -->

- [ ] **enhancement** | Turn-based draw probability slider — revisit for pre-game analysis view
- [ ] **enhancement** | Max % inline label in Draw Odds — deferred to keep UI clean
- [ ] **enhancement** | Category-level draw odds — requires card tagging system; stretch goal
- [ ] **enhancement** | Mulligan strategy hints — contextual guidance based on hand stats
- [ ] **feature** | Decklist library — save decklists to a shared library where others can load, view, or download them
- [ ] **feature** | Touch screen / tablet UX support — hover and rollover states don't trigger on touch; need tap-based alternatives

---

## Closed (Recent)
<!-- Keep last 2 releases, then archive to CHANGELOG.md -->

### v1.5.4
- [x] **enhancement** | Re-add −/+ increment buttons to owned fields — list and grid view (#70) *(closed v1.5.4)*
- [x] **enhancement** | List view rollover highlight and color rendering sluggish — mouse move no longer triggers re-renders (#71) *(closed v1.5.4)*

### v1.5.1
- [x] **enhancement** | Redesign grid view warning triangle placement and tooltips *(closed v1.5.1)*

### v1.5.0
- [x] **bug** | "+ New Deck" format picker gets cut off at the top when decklist is short — dynamic positioning *(closed v1.5.0)*
- [x] **bug** | + icon in collapsed sidebar rail does not trigger the format picker *(closed v1.5.0)*
- [x] **enhancement** | Commander eligibility check now enforces legendary legality — hard block *(closed v1.5.0)*
- [x] **enhancement** | Crown badge in grid view toggles commander — "Set as Commander" overlay button removed *(closed v1.5.0)*
- [x] **enhancement** | Persistent qty pill badge on grid tile bottom center *(closed v1.5.0)*

### v1.4.1
- [x] **bug** | Owned field no longer dims when owned count reaches deck quantity — regression *(closed v1.4.1)*

### v1.4.0
- [x] **feature** | Support Standard and Commander deck modes (#17) *(closed v1.4.0)*
- [x] **enhancement** | Commander threshold calibration *(closed v1.4.0)*

---
