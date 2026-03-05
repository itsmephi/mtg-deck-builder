# MTG Deck Builder & Simulator — Session Context
Authors: Phi & Thurgood Nguyen
Stack: Next.js + TypeScript + Tailwind CSS
Deployed: Vercel | Repo: GitHub (itsmephi/mtg-deck-builder)
IDE: Zed on Steam Deck (Linux)
Current Version: v1.0.3 — see CHANGELOG.md for full history

## Up Next — v1.0.4 (Refactor)
→ GitHub Milestone: v1.0.4 | Issues: #1 #2 #3
- Extract WorkspaceToolbar.tsx from Workspace.tsx (~200 lines)
- Extract DeckDropdown.tsx (~60 lines)
- Extract useDeckStats.ts hook (totalCards, totalValue, remainingCost, buy functions)
- Target: bring Workspace.tsx from ~590 lines down to ~250 lines

## Up Next — v1.1.0
→ GitHub Milestone: v1.1.0 | Issues: #4 #5 #6 #7 #8 #9 #10 #11 #12 #13 #14
- Mana Curve Chart
- Color Identity Bar
- Deck Legality Checker
- Draw probability stats per card (Test Hand Modal)
- Turn tracker + mulligan count (Test Hand Modal)
- Owned vs. to-buy cards independently
- Card scale toggle (grid + sidebar)
- Toggle card inactive while retaining count
- Row color shading by color identity (list view)
- TCGPlayer orange / Card Kingdom blue price colors

## Backlog
→ GitHub Milestone: Backlog | Issues: #15–#27
- New app name (#15)
- Drag and drop custom sorting (#16)
- Standard / Commander deck modes (#17)
- Search autocomplete (#18)
- 15-card sideboard (#19)
- Main/sideboard toggle (#20)
- Choose store + generate buy list (#21)
- Sort list view by color/type/name (#22)
- Share / email deck list (#23)
- Move X icon to left in list view (#24)
- Search shows cards already in workspace (#25)
- EDHREC improved search suggestions (#26)
- Confirm Vivi 0/3 copy limit rule (#27)

## Issue & Changelog Workflow
- Bugs, features, ideas → GitHub Issues (itsmephi/mtg-deck-builder)
- Labels: bug · feature · enhancement · chore · backlog · high · med · low
- Milestones: v1.0.4 · v1.1.0 · Backlog
- CHANGELOG.md lives in repo root — update each release
- When starting work: reference issue # in commit message (e.g. "Closes #4")
- After shipping: close milestone, bump version in src/config/version.ts, push

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