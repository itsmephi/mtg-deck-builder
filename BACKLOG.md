# BACKLOG.md — MTG Deck Builder
<!-- Permanent backlog. Items live here from capture through completion. -->
<!-- See .claude/rules/backlog-and-capture.md for full lifecycle rules. -->

---

## Active Milestone
<!-- Items promoted from Pipeline for the current release. Cleared after release ships. -->

(None — v1.3.2 shipped. Next milestone TBD pending design session.)

---

## Pipeline
<!-- Triaged items not yet assigned to a milestone. New consolidation items land here. -->

- [ ] **feature** | New app name — Phi & Thurgood to brainstorm (#15)
- [ ] **feature** | Custom card sorting by drag and drop (#16)
- [ ] **feature** | Support Standard and Commander deck modes (#17)
- [ ] **enhancement** | EDHREC improved search suggestions (#26) ↑ priority — *Partially addressed in v1.3.0: mana symbols in search results. Dynamic categories and NLP search deferred.*
- [x] **enhancement** | Version badge popup — revisit behavior (#49) *(closed v1.3.2)*
- [x] **enhancement** | Sideboard pricing — show combined total with main deck by default (#58) *(closed v1.3.2)*
- [ ] **feature** | Move cards between boards or decks (#62) ↑ priority
- [ ] **enhancement** | Turn-based draw probability slider — deferred; revisit for pre-game analysis view
- [ ] **enhancement** | Max % inline label in Draw Odds — deferred to keep UI clean
- [ ] **enhancement** | Commander threshold calibration — recalibrate when Commander mode ships; constants already named
- [ ] **enhancement** | Category-level draw odds — requires card tagging system; stretch goal
- [ ] **enhancement** | Mulligan strategy hints — contextual guidance based on hand stats; out of scope this version
- [x] **bug** | Deck name conflicts produce malformed names like `[name](#)` — handle duplicate names gracefully *(closed v1.3.2)*
- [ ] **enhancement** | List view rollover highlight and color rendering feels slow/sluggish — audit and optimize implementation
- [ ] **enhancement** | Simulator modal has no view mode toggle — consider adding compact list view inside modal for larger decks; would also make pin-from-list interaction more prominent
- [ ] **feature** | Decklist library — save decklists to a shared library where others can load, view, or download them
- [x] **enhancement** | Collapsed sidebar rail icons should have tooltips *(closed v1.3.2)*
- [x] **enhancement** | Clicking empty area of collapsed sidebar should expand it *(closed v1.3.2)*
- [x] **enhancement** | Add "+ New Deck" icon to collapsed sidebar rail *(closed v1.3.2)*
- [x] **enhancement** | Add open/close toggle icon in collapsed sidebar state *(closed v1.3.2)*
- [x] **bug** | Card Kingdom button wraps to 2 lines in sidebar actions strip — width constraint *(closed v1.3.2)*
- [ ] **enhancement** | Settings panel redesign — 2 clicks to access settings is a UX regression from v1.3.0 sidebar changes
- [ ] **enhancement** | Card price display missing from persistent grid tile — deferred from v1.3.0 design, needs design decision
- [ ] **enhancement** | Match workspace background color to sidebar background color
- [x] **enhancement** | Remove qty badge from persistent grid tile *(closed v1.3.2)*
- [ ] **enhancement** | Grid view column size presets — small (6 col), medium (4 col), large (2 col); bonus: auto-set based on screen size
- [ ] **bug** | Deck count display shows 60 + 15 sideboard separately — total should read 75; card count colorings should reflect combined total
- [ ] **enhancement** | Unify project styling via CSS custom properties or design tokens — changing a background color or theme value should touch one place, not multiple files
- [ ] **feature** | Touch screen / tablet UX support — hover and rollover states don't trigger on touch; need tap-based alternatives for card actions and interactive controls

---

## v1.2.0 and Beyond (Deferred)
<!-- Features from the original v1.2.0 milestone not yet started -->

- [ ] **feature** | Color Identity Bar (#5)
- [ ] **feature** | Deck Legality Checker (#6)
- [ ] **feature** | Add turn tracker during deck testing (#8)
- [ ] **feature** | Ability to mark cards as owned vs. to-buy independently (#10)
- [ ] **feature** | Toggle card scale for art previews (#11)
- [ ] **feature** | Ability to toggle a card inactive while retaining count (#12)
- [ ] **feature** | Display TCGPlayer price in orange, Card Kingdom in blue (#14)

---

## v2.0 Deferred

- [ ] **feature** | Dark/light/system theme toggle (#50)
- [ ] **enhancement** | TCGPlayer and Card Kingdom buy button layout — revisit row 2 (#51)
- [ ] **enhancement** | List view ownership progress bar too wide — revisit after UI review (#54)
- [ ] **enhancement** | Tooltip visual treatment needs polish — revisit during UI polish sweep (#60)
- [ ] **feature** | Major search sidebar redesign — functionality and UI overhaul (#71) — *Partially addressed in v1.3.0: sidebar restructured with tab system. Full search refactor (NLP, aggregated data) remains open.*
- [ ] **feature** | Mobile version — cleaner, tighter, more intuitive for vertical small screens (#74)
- [ ] **feature** | UI/UX overhaul (#75) — *Advanced in v1.3.0: collapsible sidebar, single-row toolbar, grid view overlay. Full overhaul continues.*
- [ ] **v2.0** | UI overhaul — replace always-on buttons with hover-state reveals
- [ ] **v2.0** | Mobile touch pin interaction — review touch targets at mobile optimization milestone

---

## Closed (Recent)
<!-- Keep last 2 releases, then archive to CHANGELOG.md -->

### v1.3.2
- [x] **enhancement** | Sideboard pricing — combined main+side total with (M+S) label (#58) *(closed v1.3.2)*
- [x] **bug** | Deck name conflicts produce malformed names — deduplication on create and import *(closed v1.3.2)*
- [x] **enhancement** | Version badge popup — inline changelog expand (#49) *(closed v1.3.2)*
- [x] **enhancement** | Collapsed sidebar rail icons should have tooltips *(closed v1.3.2)*
- [x] **enhancement** | Clicking empty area of collapsed sidebar should expand it *(closed v1.3.2)*
- [x] **enhancement** | Add "+ New Deck" icon to collapsed sidebar rail *(closed v1.3.2)*
- [x] **enhancement** | Add open/close toggle icon in collapsed sidebar state *(closed v1.3.2)*
- [x] **bug** | Card Kingdom button wraps to 2 lines in sidebar actions strip *(closed v1.3.2)*
- [x] **enhancement** | Remove qty badge from persistent grid tile *(closed v1.3.2)*

### v1.3.1
*(no backlog items closed — hot fix)*

### v1.3.0
- [x] **feature** | Collapsible search sidebar *(closed v1.3.0)*
- [x] **enhancement** | Grid view card icons and action buttons appear on hover/rollover (#76) *(closed v1.3.0)*
- [x] **enhancement** | Grid view getting cluttered — refactor for cleaner, minimal card display *(closed v1.3.0)*

### v1.2.0
- [x] **feature** | Mana Curve Chart (#4)
- [x] **feature** | Draw probability stats per card (#7)
- [x] **feature** | Show mulligan count (#9)
- [x] **enhancement** | Shade list view row by card color identity (#13)

### v1.1.7
- [x] **bug** | List view row hover highlight lost after color tint implementation
- [x] **enhancement** | Colorless and Land row tints differentiated — colorless = gray, lands = tan/brown
- [x] **bug** | Deck name click in dropdown should match radio button behavior (stay open)
- [x] **bug** | Qty badge color progression — gray ≤3, green at 4, red at 5+
- [x] **bug** | Untitled decks show as blank in dropdown — now shows "Untitled"

### v1.1.6
- [x] **feature** | Deck dropdown radio buttons (#77)
- [x] **enhancement** | Card count color progression (#53, #56)
- [x] **enhancement** | Main/Side pill color (#57)
- [x] **enhancement** | Sort group separators in list view (#47)
- [x] **enhancement** | Row color tinting (#13)
- [x] **enhancement** | Untitled deck name placeholder (#70)

---
