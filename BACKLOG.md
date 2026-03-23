# BACKLOG.md — MTG Deck Builder
<!-- Permanent backlog. Items live here from capture through completion. -->
<!-- See .claude/rules/backlog-and-capture.md for full lifecycle rules. -->

---

## Active Milestone
<!-- Items promoted from Pipeline for the current release. Cleared after release ships. -->

*(empty — v1.12.0 shipped, next milestone pending triage)*

---

## Pipeline
<!-- Triaged items not yet assigned to a milestone. New captures land here. -->

- [ ] **feature** | New app name — Phi & Thurgood to brainstorm (#15) ⚠️ needs design
- [ ] **feature** | Custom card sorting by drag and drop (#16)
- [ ] **feature** | Partner commander support — allow 2 commanders for Partner and Friends Forever (Best Friends) pairs; deferred from v1.4.0
- [ ] **feature** | Move cards between boards or decks (#62) ↑ priority
- [ ] **enhancement** | Simulator modal has no view mode toggle — consider adding compact list view inside modal for larger decks; would also make pin-from-list interaction more prominent
- [x] **enhancement** | Settings panel redesign — 2 clicks to access settings is a UX regression from v1.3.0 sidebar changes *(closed v1.12.0)*
- [ ] **enhancement** | Card price display missing from persistent grid tile — deferred from v1.3.0 design, needs design decision ⚠️ needs design
- [x] **enhancement** | Unify project styling via CSS custom properties or design tokens — changing a background color or theme value should touch one place, not multiple files *(closed v1.10.0)*
- [ ] **enhancement** | Combine qty and owned fields into a single elegant input — two separate fields is redundant UX; design a unified interaction ⚠️ needs design
- [ ] **enhancement** | Import/export format compatibility — support MTGGoldfish format (e.g. `1 Ashling, the Limitless <borderless> [ECC] (F)`) and confirm cross-compatibility with TCGPlayer and Card Kingdom import
- [ ] **enhancement** | Import modal — add "Paste from clipboard" button as an alternative to typing/pasting manually ⚠️ needs design
- [ ] **enhancement** | Search: list view toggle for search results — grid/list toggle in search toolbar, list view mirrors sidebar search list but wider ⚠️ needs design
- [ ] **enhancement** | Search: hold-to-peek — while in search view, hold a button to temporarily reveal the deck view, release to return to search ⚠️ needs design
- [ ] **enhancement** | Search: filter badge color per format — Commander gold, Standard blue, Freeform gray (needs design to avoid confusion with active/inactive states)
- [ ] **enhancement** | Search: highlight newly added cards on deck view switch — when returning to deck view after adding cards from search, briefly highlight or scroll to new cards ⚠️ needs design
- [ ] **enhancement** | Search: emoji in deck names — optional personalization feature for deck names
- [ ] **enhancement** | Active deck / sideboard indicator — show which board is active beyond just the toggle button ⚠️ needs design
- [ ] **feature** | Commander brackets support — tag cards with bracket ratings (e.g. Game Changer) per EDH bracket system ⚠️ needs design
- [ ] **feature** | Search pillars — curated search modes for brewing, discovery, beginner deck building ⚠️ needs design
- [ ] **enhancement** | Search by foil — filter search results to foil printings only
- [ ] **enhancement** | Search: spelling correction — suggest corrected card name on typo / no-results
- [ ] **enhancement** | Toolbar row height parity — search toolbar Row 1 and Row 2 should match deck toolbar row heights; search bar should be taller to fill Row 1; no layout hitch when switching tabs *(closed v1.13.0)*
- [ ] **enhancement** | Margin parity between search and deck views — search is edge-to-edge, deck has p-4 outer + p-4 scroll container; future design pass to unify outer padding
- [ ] **enhancement** | CardModal search view: forward/back navigation buttons to mimic deck card modal behavior
- [ ] **enhancement** | Search view: back button to return to previous context ⚠️ needs design
- [ ] **bug** | CardModal: white corners visible on rounded card images in some cases
- [ ] **feature** | Deck building via photo capture — scan physical cards with camera to add to deck
- [ ] **feature** | Favorite/star decks — starred decks float to top or appear in a dedicated section ⚠️ needs design
- [ ] **chore** | Architecture review for public scaling — phased roadmap including mobile/tablet touch support
- [ ] **enhancement** | Settings Hub: "Submit a Bug" button/link in Support tab
- [ ] **enhancement** | Search: auto-match format badge to active deck's format
- [ ] **bug** | Sidebar tabs: raised appearance and missing blue active indicator bar
- [ ] **chore** | Open source repo and apply for Vercel open source/supporter tier
- [ ] **bug** | Sort broken in search view
- [ ] **enhancement** | CardModal: show set abbreviation; clicking it searches that set in search view
- [ ] **enhancement** | CardModal: clicking artist name triggers artist search in search view

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

---

## Closed (Recent)
<!-- Keep last 2 releases, then archive to CHANGELOG.md -->

### v1.11.1
- [x] **enhancement** | Search bar focus ring (border-input-edge-focus) is too prominent — muted from #c07a50 to #a0725c in Warm Stone palette *(closed v1.11.1)*
- [x] **chore** | Add Claude Chat deliverable rule to CLAUDE.md: spec and prompts must be separate files *(closed v1.11.1)*

### v1.11.0
- [x] **enhancement** | Dual-palette theme system: 25 tokens (expanded from 12), Warm Stone default + Zed Dark alt palette, sidebar panel tokens, input tokens, resolved all v1.10.0 flagged mid-tone classes *(closed v1.11.0)*

### v1.10.0
- [x] **enhancement** | Unify project styling via CSS custom properties or design tokens — 12 semantic tokens in globals.css, registered via @theme inline; 17 files migrated across layout and workspace components *(closed v1.10.0)*

### v1.9.0
- [x] **enhancement** | Release year filter — year range (dual text inputs, default last 5 years) in sidebar FilterPanel + Released date row in CardModal Product Details *(closed v1.9.0)*

### v1.8.0
- [x] **enhancement** | Card tile size parity — match tile sizes between search and deck grid views *(closed v1.8.0)*
- [x] **enhancement** | Grid view column size presets — small (6 col), medium (4 col), large (2 col) *(closed v1.8.0)*

### v1.7.0
- [x] **enhancement** | Search CardModal: keep modal open after adding card — return to Details tab instead of closing, matching deck view Confirm Art Swap behavior *(closed v1.7.0)*
- [x] **bug** | Planeswalker commander eligibility — Legendary alone should not qualify; require "can be your commander" in oracle text unless Legendary Creature *(closed v1.7.0)*
- [x] **enhancement** | Group by type: separate commander into its own group *(closed v1.7.0)*
- [x] **enhancement** | Search view: add tooltip for green in-deck pill icon on card tiles *(closed v1.7.0)*
- [x] **enhancement** | CardModal Swap Art tab: show loading spinner while fetching printings *(closed v1.7.0)*
- [x] **enhancement** | Search: filter section "Deselect All" button — quick way to clear all toggles in a filter group then select one *(closed v1.7.0)*
- [x] **enhancement** | Search: color filter chips match mana colors — W chip white-tinted, R chip red-tinted, etc. *(closed v1.7.0)*
- [x] **enhancement** | Search: price filter "Any" toggle — remove price ceiling for searching expensive cards *(closed v1.7.0)*
- [x] **enhancement** | Search by set / Secret Lair — natural language set name lookup maps to `e:CODE` via Scryfall sets API *(closed v1.7.0)*
- [x] **enhancement** | Search: add Discard as NLP token / parser keyword *(closed v1.7.0)*

### v1.6.0
- [x] **enhancement** | Search filtering by format legality / color identity (#72) *(closed v1.6.0)*
- [x] **enhancement** | EDHREC improved search suggestions (#26) *(closed v1.6.0)*

---
