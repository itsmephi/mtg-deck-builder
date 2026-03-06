# MTG Deck Builder & Simulator — Source of Truth
Authors: Phi & Thurgood Nguyen
Stack: Next.js + TypeScript + Tailwind CSS
Deployed: Vercel | Repo: GitHub (itsmephi/mtg-deck-builder)
IDE: Zed on Steam Deck (Linux)
Current Version: v1.0.6 — see CHANGELOG.md for full history

---

## How This File Works
This is the single source of truth for the project, shared between:
- **Claude Chat** — upload this file at the start of every planning session
- **Claude Code** — reads this automatically at session start
- **GitHub** — issues and milestones are created automatically by Claude Code on commit

Rules:
- New ideas and bugs go in the Backlog section below — not directly into GitHub
- Claude Chat updates this file at the end of every planning session
- Claude Code updates this file when issues are opened or closed
- Always commit this file alongside any release or planning change
- GitHub is read-only — use it to review status, history, and what's shipped

---

## Active Milestone
→ None — no active milestone. Start fresh next planning session.

---

## Backlog
Issues exist in GitHub. New ideas captured here first, then promoted to a milestone when ready to build.

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
- Owned quantity tracking — buy 2 of 4 owned copies (#31)

---

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

---

## Release Workflow
1. Plan with Claude Chat — design fully before building
2. Claude Chat generates the Claude Code prompt
3. `git checkout -b vX.X.X`
4. Claude Code executes — pauses before committing for your approval
5. Review and type APPROVED
6. Claude Code commits: `vX.X.X - description - Closes #N, Closes #N`
7. `git checkout main && git merge vX.X.X && git push`
8. Vercel auto-deploys
9. Update this file — bump version, move completed issues out of backlog, update active milestone
10. Commit: `git add CLAUDE.md && git commit -m "update CLAUDE.md post vX.X.X"`

---

## GitHub Issue Convention
Claude Code creates and closes issues automatically. Convention for commit messages:
✅ Closes #27, Closes #28, Closes #29
❌ Closes #27 #28 #29

Labels: bug · feature · enhancement · chore · backlog · high · med · low
Milestones: v1.1.0 · Backlog

---

## File Structure
```
src/
  app/               → layout.tsx, page.tsx, globals.css
  config/            → version.ts ← bump APP_VERSION and add CHANGELOG entry each release
  components/
    layout/          → Sidebar.tsx, CardModal.tsx, SampleHandModal.tsx
    workspace/       → Workspace.tsx, WorkspaceToolbar.tsx, DeckDropdown.tsx, VisualCard.tsx, ListCardTable.tsx, ImportModal.tsx
  hooks/             → useDeckManager.tsx, useDeckImportExport.tsx, useDeckStats.ts
  lib/               → scryfall.ts
  types/             → index.ts
```

---

## Key Technical Notes
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
