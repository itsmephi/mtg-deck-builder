# MTG Deck Builder & Simulator — Source of Truth
Authors: Phi & Thurgood Nguyen
Stack: Next.js + TypeScript + Tailwind CSS
Deployed: Vercel | Repo: GitHub (itsmephi/mtg-deck-builder)
IDE: Zed on Steam Deck (Linux)
Current Version: v1.0.7 — see CHANGELOG.md for full history

---

## Session Start — Claude Chat
Every planning session, Claude Chat should automatically run through this checklist before any design work begins:
- [ ] Confirm current version matches what shipped
- [ ] Confirm active milestone and open issues look correct
- [ ] Flag any loose ends or inconsistencies from last session
- [ ] Review the **Capture Log** chat together — triage anything ready to promote to the milestone or backlog before starting design
- [ ] Proactively suggest workflow or process improvements based on what we learned last session
- [ ] Remind Phi to **sync CLAUDE.md via the Claude project files sync button** — not upload manually

---

## Capture Log
A dedicated chat in this Claude project named "Capture Log" is the single place for all bugs, ideas, features, and UI tweaks captured between planning sessions. At the start of every planning session, Claude Chat and Phi review the Capture Log together and promote items into the Claude Code prompt and CLAUDE.md update instructions. Claude Code never reads the Capture Log directly — Claude Chat handles the triage and includes everything explicitly in the prompt.

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
→ v1.1.0 — Sideboard Support | Full design session required before building

- 15-card sideboard (#19)
- Main deck / sideboard toggle (#20)

---

## v1.2.0 and beyond (deferred)
→ GitHub Milestone: v1.1.0 | Issues: #4–#14

- Mana Curve Chart (#4)
- Color Identity Bar (#5)
- Deck Legality Checker (#6)
- Draw probability stats per card (#7)
- Add turn tracker during deck testing (#8)
- Show mulligan count in parenthesis (#9)
- Ability to mark cards as owned vs. to-buy independently (#10)
- Toggle card scale for art previews (#11)
- Ability to toggle a card inactive while retaining count (#12)
- Shade list view row by card color identity (#13)
- Display TCGPlayer price in orange, Card Kingdom in blue (#14)

---

## Backlog
New ideas captured here first, then promoted to a milestone when ready to build.

- New app name — Phi & Thurgood to brainstorm (#15)
- Custom card sorting by drag and drop (#16)
- Support Standard and Commander deck modes (#17)
- Search autocomplete / autofill (#18)
- EDHREC improved search suggestions (#26)
- Search shows cards already in workspace (#25)
- Share / email deck list (#23)
- Commander deck sort performance — revisit when 100+ card support is implemented (#33)

---

## Release Workflow
1. **Design with Claude Chat** — for each feature:
   - Ask all requirements questions
   - Walk through the design checklist:
     - [ ] What does the user see by default / on first load?
     - [ ] What happens on every user interaction?
     - [ ] What are the empty states? (no data, zero results, etc.)
     - [ ] What are the error states?
     - [ ] How does it behave at maximum scale? (100 cards, long names, etc.)
     - [ ] How does it look in every view? (grid, list, modal, mobile)
     - [ ] Is the behavior obvious to someone who has never seen it before?
     - [ ] Does this match or intentionally diverge from existing behavior?
   - Present full spec for review
   - Get explicit sign-off before moving to the next feature
   - Only generate the Claude Code prompt after ALL features are signed off
   - Present the Claude Code prompt as a downloadable/copyable markdown file

2. Claude Chat generates the Claude Code prompt as a downloadable markdown file — prompt must always include:
   - A CHANGELOG outline based on the design spec (Claude Code fills it in accurately based on what was actually built)
   - What to update in CLAUDE.md (version bump, milestone changes, new backlog items)
3. `git checkout -b vX.X.X`
4. Claude Code executes:
   - **Small releases (quick wins)** — build everything in one pass, then pause
   - **Large releases (v1.1.0+)** — pause and output testing checklist after each feature before proceeding
5. Claude Code pauses before committing and outputs a testing checklist broken out per feature
6. Review checklist, test in browser, type APPROVED
7. Claude Code commits: `vX.X.X - description - Closes #N, Closes #N`
8. **Claude Code updates CLAUDE.md and CHANGELOG.md** — bump version, move completed issues, update active milestone, add changelog entry for what shipped, add any new backlog items
9. Claude Code commits: `git add CLAUDE.md CHANGELOG.md && git commit -m "update CLAUDE.md and CHANGELOG.md post vX.X.X"`
10. `git checkout main && git merge vX.X.X && git push`
11. Vercel auto-deploys
12. **Sync CLAUDE.md into the Claude project** — hit sync in the Claude project files so the next planning session starts with current context

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
- Qty 0 behavior: card stays in deck, grays out, excluded from total count and to-buy cost — matches − button behavior
- 4-copy rule is a soft warning (highlight) not a hard cap — matches existing + button behavior