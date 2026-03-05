# MTG Deck Builder & Simulator — Session Context
Authors: Phi & Thurgood Nguyen
Stack: Next.js + TypeScript + Tailwind CSS
Deployed: Vercel | Repo: GitHub (itsmephi/mtg-deck-builder)
IDE: Zed on Steam Deck (Linux)
Current Version: v1.0.6 — see CHANGELOG.md for full history

## Up Next — v1.0.7 or v1.1.0
→ No active milestone yet — start fresh next session

## Backlog
→ GitHub Milestone: Backlog | Issues: #15–#26
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
## v1.1.0 (deferred)
→ GitHub Milestone: v1.1.0 | Issues: #4–#14
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

## Issue & Changelog Workflow
- Bugs, features, ideas → GitHub Issues (itsmephi/mtg-deck-builder)
- Labels: bug · feature · enhancement · chore · backlog · high · med · low
- Milestones: v1.1.0 · Backlog
- CHANGELOG.md lives in repo root — update each release
- When starting work: reference issue # in commit message
- After shipping: close milestone, bump version in src/config/version.ts, push

## GitHub Issue Closing Convention
Always close issues individually in commit messages:
✅ Closes #27, Closes #28, Closes #29
❌ Closes #27 #28 #29

## Branch Strategy
- Always branch off main for new releases: git checkout -b v1.0.6
- Test locally before merging: git checkout main && git merge v1.0.5 && git push
- Vercel auto-deploys from main

## File Structure
src/
  app/               → layout.tsx, page.tsx, globals.css
  config/            → version.ts ← bump APP_VERSION and add CHANGELOG entry each release
  components/
    layout/          → Sidebar.tsx, CardModal.tsx, SampleHandModal.tsx
    workspace/       → Workspace.tsx, WorkspaceToolbar.tsx, DeckDropdown.tsx, VisualCard.tsx, ListCardTable.tsx, ImportModal.tsx
  hooks/             → useDeckManager.tsx, useDeckImportExport.tsx, useDeckStats.ts
  lib/               → scryfall.ts
  types/             → index.ts

## Release Workflow
1. git checkout -b vX.X.X
2. Make changes
3. Update src/config/version.ts — bump APP_VERSION and add CHANGELOG entry
4. git add . && git commit -m "vX.X.X - description - Closes #N, Closes #N" && git push
5. git checkout main && git merge vX.X.X && git push
6. Vercel auto-deploys
7. Update CONTEXT.md for next session

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
- 4-copy rule exemptions: check type_line for "Basic Land" and oracle_text for "A deck can have any number"