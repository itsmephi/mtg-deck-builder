# MTG Deck Builder & Simulator — Session Context
Authors: Phi & Thurgood Nguyen
Stack: Next.js + TypeScript + Tailwind CSS
Deployed: Vercel | Repo: GitHub
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

## Up Next — v1.0.2
- check if export/import supports card variant name when swapping art
- highlight card text when deck reaches 60 cards - standard deck
- click on the search field and automatically highlights text for replkacement
- change name on testhand modal from Similation:Golfish to something better
- when marked owned name should slightly gray out in list view
- add wizard of the coast disclaimer to footnote somehow
- search sidebar vertical spacing seems big for the results list
- deck name field gets cut off for long deck names
- deck name dropdown selector is cluttered, possibly integrate together with deck name 

## Up Next — v1.1.0
- Mana Curve Chart
- Color Identity Bar
- Deck Legality Checker

## File Structure
src/
  app/           → layout.tsx, page.tsx
  components/
    layout/      → Sidebar.tsx, CardModal.tsx, SampleHandModal.tsx
    workspace/   → Workspace.tsx, VisualCard.tsx, ListCardTable.tsx, ImportModal.tsx
  hooks/         → useDeckManager.tsx, useDeckImportExport.tsx
  lib/           → scryfall.ts
  types/         → index.ts
