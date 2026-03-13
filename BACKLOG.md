# BACKLOG.md — MTG Deck Builder
<!-- Permanent backlog. Items live here from capture through completion. -->
<!-- See .claude/rules/backlog-and-capture.md for full lifecycle rules. -->

---

## Active Milestone
<!-- Items promoted from Pipeline for the current release. Cleared after release ships. -->

(None — next milestone TBD pending design session)

---

## Pipeline
<!-- Triaged items not yet assigned to a milestone. New consolidation items land here. -->

- [ ] **feature** | New app name — Phi & Thurgood to brainstorm (#15)
- [ ] **feature** | Custom card sorting by drag and drop (#16)
- [ ] **feature** | Support Standard and Commander deck modes (#17)
- [ ] **enhancement** | EDHREC improved search suggestions (#26) ↑ priority
- [ ] **enhancement** | Version badge popup — revisit behavior (#49)
- [ ] **enhancement** | Sideboard pricing — show combined total with main deck by default (#58) ↑ priority
- [ ] **feature** | Move cards between boards or decks (#62) ↑ priority
- [ ] **enhancement** | Grid view card icons and action buttons appear on hover/rollover — requires design session (#76)
- [ ] **enhancement** | Turn-based draw probability slider — deferred; revisit for pre-game analysis view
- [ ] **enhancement** | Max % inline label in Draw Odds — deferred to keep UI clean
- [ ] **enhancement** | Commander threshold calibration — recalibrate when Commander mode ships; constants already named
- [ ] **enhancement** | Category-level draw odds — requires card tagging system; stretch goal
- [ ] **enhancement** | Mulligan strategy hints — contextual guidance based on hand stats; out of scope this version
- [ ] **bug** | Deck name conflicts produce malformed names like `[name](#)` — handle duplicate names gracefully
- [x] **bug** | Basic lands and fetch lands missing visual spacer when sorted — should match behavior of other sort group separators *(closed v1.2.1)*
- [ ] **enhancement** | List view rollover highlight and color rendering feels slow/sluggish — audit and optimize implementation
- [ ] **enhancement** | Grid view getting cluttered with numbers and buttons — refactor for a cleaner, more minimal card display
- [ ] **enhancement** | Simulator modal has no view mode toggle — consider adding compact list view inside modal for larger decks; would also make pin-from-list interaction more prominent
- [ ] **feature** | Collapsible search sidebar — high priority for smaller screens and tablets; precursor to mobile work

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
- [ ] **feature** | Major search sidebar redesign — functionality and UI overhaul (#71)
- [ ] **feature** | Mobile version — cleaner, tighter, more intuitive for vertical small screens (#74)
- [ ] **feature** | UI/UX overhaul (#75)
- [ ] **v2.0** | UI overhaul — replace always-on buttons with hover-state reveals
- [ ] **v2.0** | Mobile touch pin interaction — review touch targets at mobile optimization milestone

---

## Closed (Recent)
<!-- Keep last 2 releases, then archive to CHANGELOG.md -->

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
