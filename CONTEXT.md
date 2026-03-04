# MTG Deck Builder & Simulator — Session Context
Authors: Phi & Thurgood Nguyen
Stack: Next.js + TypeScript + Tailwind CSS
Deployed: Vercel | Repo: GitHub (itsmephi/mtg-deck-builder)
IDE: Zed on Steam Deck (Linux)

## Completed

### v1.0.0
- Deck builder with visual grid + list view
- Scryfall search with EDHREC category browsing
- Goldfish Simulator with Fisher-Yates shuffle and stats
- Import/export (.txt decklist format)
- TCGPlayer + Card Kingdom buy links
- Card Modal with art swap, rulings, legalities

### v1.0.1
- Inline mana symbols in oracle text
- Flavor text in card modal
- Full set name in modal subtitle and list view
- Price added to card modal product details
- N/A pricing for cards with no USD data
- Import pricing rescue lookup for $0.00 cards
- Confirm swap button always visible, no flicker
- Art fills modal panel properly
- localStorage silent failure recovery
- Scryfall network error handling
- Test Deck rename, To Buy label, UI polish

### v1.0.2
- Deck name + dropdown unified (chevron on left, click to switch decks)
- Auto-highlight search field text on click
- Owned cards green tint in list view (name + price)
- WotC Fan Content disclaimer in footer
- 60 card yellow highlight on card count
- Opening Hand Simulator rename
- TCGPlayer export with set code format [SET]
- Search sidebar spacing tightened
- Type column added to list view
- Mana column renamed from Cost
- Set name removed from list view (visible in modal)
- Toolbar restructured: 3 rows (deck name / stats / actions)
- Actions row: left-justified buy buttons, right-justified controls
- Horizontal scroll eliminated
- Collapsible footer (collapsed by default)
- Footer: version badge opens changelog, coffee icon, GitHub icon
- Version config extracted to src/config/version.ts

### v1.0.3
- $0.00 pricing rescue on card add from search (handleAddCard now async)
- $0.00 pricing rescue on import (in addition to null rescue)
- Full fidelity export: [SET] and [owned] tags in .txt format
- Full fidelity import: parses [SET] and [owned] tags, passes owned status through
- Scryfall collection fetch uses set identifier when available
- Auto-scroll to card in workspace when added from sidebar (grid + list view)
- Yellow ring highlight on added card, fades after 1 second
- lastAddedId shared via useDeckManager context
- Themed dark scrollbars (4px, neutral-700, rounded)
- Settings menu in footer (gear icon) with Card Preview toggle
- Card preview toggle shared via useDeckManager context (showThumbnail)
- Eye/EyeOff icons removed from search bar and workspace toolbar
- overflow-x-hidden on workspace scroll container (no horizontal scrollbar in grid view)

## Up Next — v1.0.4 (Refactor)
- Extract WorkspaceToolbar.tsx from Workspace.tsx (~200 lines)
- Extract DeckDropdown.tsx (~60 lines)
- Extract useDeckStats.ts hook (totalCards, totalValue, remainingCost, buy functions)
- Target: bring Workspace.tsx from ~590 lines down to ~250 lines

## Up Next — v1.1.0
- Mana Curve Chart
- Color Identity Bar
- Deck Legality Checker

## File Structure
src/
  app/               → layout.tsx, page.tsx, globals.css
  config/            → version.ts ← bump APP_VERSION and add CHANGELOG entry each release
  components/
    layout/          → Sidebar.tsx, CardModal.tsx, SampleHandModal.tsx
    workspace/       → Workspace.tsx, VisualCard.tsx, ListCardTable.tsx, ImportModal.tsx
  hooks/             → useDeckManager.tsx, useDeckImportExport.tsx
  lib/               → scryfall.ts
  types/             → index.ts

## Release Workflow
1. Make changes
2. Update src/config/version.ts — bump APP_VERSION and add CHANGELOG entry
3. git add . && git commit -m "vX.X.X - description" && git push
4. Vercel auto-deploys
5. Update CONTEXT.md for next session

## Key Notes
- Scryfall API: searchCards appends order:usd to prefer priced printings
- $0.00 rescue: check !prices.usd || prices.usd === "0.00" — both cases need rescue
- handleAddCard is async — rescue happens before updateActiveDeck is called
- lastAddedId in context: set by Sidebar on add, cleared by Workspace after scroll+highlight
- setCardRef(id) curried helper used for card refs — inline { if(el) } in JSX causes parse errors
- duplicate ))} bug: caused by stacked .map() closings — always verify only one per map
- TCGPlayer format: "1 Memnite [BRO]" — Card Kingdom: name only
- contentEditable abandoned for deck name input — use size={Math.max(10, name.length)} instead
- overflow-x-hidden needed on both outer wrapper AND scroll container in Workspace
- table-fixed on ListCardTable prevents horizontal overflow
