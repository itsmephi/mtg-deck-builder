# Changelog

All notable changes to **MTG Deck Builder & Simulator** are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — v1.0.4 (Refactor)

### Changed
- Extract `WorkspaceToolbar.tsx` from `Workspace.tsx` (~200 lines)
- Extract `DeckDropdown.tsx` (~60 lines)
- Extract `useDeckStats.ts` hook (totalCards, totalValue, remainingCost, buy functions)
- Target: bring `Workspace.tsx` from ~590 lines down to ~250 lines

---

## [1.0.3] — Exports, Scroll & Settings

### Added
- Full fidelity export: `[SET]` and `[owned]` tags in `.txt` format
- Full fidelity import: parses `[SET]` and `[owned]` tags, passes owned status through
- Auto-scroll to card in workspace when added from sidebar (grid + list view)
- Yellow ring highlight on added card, fades after 1 second
- `lastAddedId` shared via `useDeckManager` context
- Settings menu in footer (gear icon) with Card Preview toggle
- Card preview toggle shared via `useDeckManager` context (`showThumbnail`)
- Themed dark scrollbars (4px, neutral-700, rounded)

### Fixed
- `$0.00` pricing rescue on card add from search (`handleAddCard` now async)
- `$0.00` pricing rescue on import (in addition to null rescue)
- Scryfall collection fetch uses set identifier when available
- `overflow-x-hidden` on workspace scroll container (no horizontal scrollbar in grid view)

### Removed
- Eye/EyeOff icons removed from search bar and workspace toolbar

---

## [1.0.2] — UI Overhaul & List View

### Added
- Owned cards green tint in list view (name + price)
- 60 card yellow highlight on card count
- WotC Fan Content disclaimer in footer
- Type column added to list view
- Collapsible footer (collapsed by default)
- Footer: version badge opens changelog, coffee icon, GitHub icon
- Version config extracted to `src/config/version.ts`
- TCGPlayer export with set code format `[SET]`

### Changed
- Deck name + dropdown unified (chevron on left, click to switch decks)
- Auto-highlight search field text on click
- Mana column renamed from "Cost"
- Set name removed from list view (visible in modal)
- Toolbar restructured: 3 rows (deck name / stats / actions)
- Actions row: left-justified buy buttons, right-justified controls
- Opening Hand Simulator renamed
- Search sidebar spacing tightened

### Fixed
- Horizontal scroll eliminated

---

## [1.0.1] — Card Modal Polish

### Added
- Inline mana symbols in oracle text
- Flavor text in card modal
- Full set name in modal subtitle and list view
- Price added to card modal product details
- N/A pricing for cards with no USD data
- Import pricing rescue lookup for `$0.00` cards

### Fixed
- Confirm swap button always visible, no flicker
- Art fills modal panel properly
- localStorage silent failure recovery
- Scryfall network error handling

### Changed
- Test Deck rename
- "To Buy" label UI polish

---

## [1.0.0] — Initial Release

### Added
- Deck builder with visual grid + list view
- Scryfall search with EDHREC category browsing
- Goldfish Simulator with Fisher-Yates shuffle and stats
- Import/export (`.txt` decklist format)
- TCGPlayer + Card Kingdom buy links
- Card Modal with art swap, rulings, legalities