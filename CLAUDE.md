# MTG Deck Builder & Simulator — Source of Truth
Authors: Phi & Thurgood Nguyen
Stack: Next.js + TypeScript + Tailwind CSS
Deployed: Vercel | Repo: GitHub (itsmephi/mtg-deck-builder)
IDE: Zed on Steam Deck (Linux)
Current Version: v1.1.4 — see CHANGELOG.md for full history

---

## Session Start — Claude Chat
Every planning session, Claude Chat should automatically run through this checklist before any design work begins:
- [ ] Search for the "Capture Log — MTG Deck Builder" chat in this Claude project and triage all items with Phi before starting design
- [ ] Confirm REVIEW.md shows APPROVED ✅ with no open carry-forwards from last session
- [ ] Confirm version in CLAUDE.md matches latest CHANGELOG.md entry
- [ ] Confirm no unclosed GitHub issues from last session
- [ ] Flag any of the above as blockers before proceeding
- [ ] Proactively suggest workflow or process improvements based on what we learned last session
- [ ] Remind Phi to **sync CLAUDE.md via the Claude project files sync button** — not upload manually

---

## Capture Log
A dedicated chat in this Claude project named "Capture Log — MTG Deck Builder" is the single place for all bugs, ideas, features, and UI tweaks captured between planning sessions. At the start of every planning session, Claude Chat and Phi review the Capture Log together and promote items into the Claude Code prompt and CLAUDE.md update instructions. Claude Code never reads the Capture Log directly — Claude Chat handles the triage and includes everything explicitly in the prompt.

---

## How This File Works
This is the single source of truth for the project, shared between:
- **Claude Chat** — upload this file at the start of every planning session
- **Claude Code** — reads this automatically at session start
- **GitHub** — issues and milestones are created automatically by Claude Code on commit
- **REVIEW.md** — the live session journal written by Claude Code, read by all three parties. Never committed mid-session. Committed alongside CLAUDE.md and CHANGELOG.md at session end.

Rules:
- New ideas and bugs go in the Backlog section below — not directly into GitHub
- Claude Chat updates this file at the end of every planning session
- Claude Code updates this file when issues are opened or closed
- Always commit this file alongside any release or planning change
- GitHub is read-only — use it to review status, history, and what's shipped

---

## Active Milestone
→ v1.2.0 — Next planned milestone | Design session required before building

---

## v1.2.0 and beyond (deferred)
→ Issues: #4–#14

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
- Visual separator/padding between sort groups (color or mana value) (#47)
- Owned counter should allow inline typing like qty counter (#48)
- Version badge popup — revisit behavior (#49)
- Dark/light theme toggle or match system theme (#50)
- TCGPlayer and Card Kingdom buy button layout — revisit row 2 (#51)
- Clicking a card price opens that card on TCGPlayer (#52)
- Soft warning for exceeding 60-card main deck limit (#53)
- List view ownership progress bar too wide — revisit after UI review (#54)
- Clicking blue dot indicator in dropdown switches active deck without closing dropdown (#55)
- Color progression on count indicators: green at cap, yellow at soft limit, red when exceeded (#56)
- Main/Side pill toggle colored to reflect current view state (#57)
- Sideboard pricing — show combined total with main deck by default (#58)
- Settings state does not persist on refresh (e.g. thumbnail toggle) (#59)
- Tooltip visual treatment needs polish — revisit during UI polish sweep (#60)

---

## Release Workflow
1. **Design with Claude Chat** — for each feature:
   - Ask all requirements questions
   - Walk through the design checklist (see below)
   - Present full spec for review
   - Get explicit sign-off before moving to the next feature
   - Only generate the Claude Code prompt after ALL features are signed off
   - Present the Claude Code prompt as a downloadable/copyable markdown file

2. Claude Chat generates the Claude Code prompt as a downloadable markdown file — prompt must always include:
   - A CHANGELOG outline based on the design spec (Claude Code fills it in accurately based on what was actually built)
   - What to update in CLAUDE.md (version bump, milestone changes, new backlog items)

3. `git checkout -b vX.X.X`

4. **Plan Review** — Claude Code outputs every file it plans to touch and a one-line summary of changes per file, writes this to `REVIEW.md`, and waits for **PROCEED** from Phi before executing any changes.
   - Phi syncs REVIEW.md, tells Claude Chat "synced"
   - Claude Chat reads REVIEW.md, verifies no ghost fixes, gives green light
   - Phi types PROCEED in Claude Code

5. Claude Code executes:
   - **Small releases (quick wins)** — build everything in one pass, then pause
   - **Large releases (v1.1.0+)** — pause and output testing checklist after each feature before proceeding

6. Claude Code writes testing checklist to REVIEW.md and pauses. Phi tests, checks off items, adds emerging issues to REVIEW.md.
   - Phi syncs REVIEW.md, tells Claude Chat "synced"
   - Claude Chat reads REVIEW.md, triages failures and emerging issues
   - Phi types APPROVED in Claude Code

7. Claude Code writes session summary to REVIEW.md, then commits:
   - `vX.X.X - description - Closes #N, Closes #N`
   - `git add CLAUDE.md CHANGELOG.md REVIEW.md && git commit -m "update CLAUDE.md, CHANGELOG.md, and REVIEW.md post vX.X.X"`

8. `git checkout main && git merge vX.X.X && git push`

9. Vercel auto-deploys

10. **Sync CLAUDE.md and REVIEW.md into the Claude project** — hit sync so the next planning session starts with current context

---

## Design Checklist
For each feature during planning:
- [ ] What does the user see by default / on first load?
- [ ] What happens on every user interaction?
- [ ] What are the empty states? (no data, zero results, etc.)
- [ ] What are the error states?
- [ ] How does it behave at maximum scale? (100 cards, long names, etc.)
- [ ] How does it look in every view? (grid, list, modal, mobile)
- [ ] Is the behavior obvious to someone who has never seen it before?
- [ ] Does this match or intentionally diverge from existing behavior?

### Standard UI Behavior Sub-Checklist
Run through these on every design session:
- [ ] If clicking an item in a list/dropdown makes it active, does that work from any item regardless of current active state?
- [ ] Does every action inside a dropdown define whether it closes or stays open?
- [ ] Any time a view switch is designed, what is the behavior if the user is not already in the expected context?
- [ ] Any new state introduced — does it need to survive a refresh? If yes, persist to localStorage.
- [ ] Are tooltips only on non-obvious controls? Remove from universally understood icons (X, +, −).
- [ ] Are tooltips consistent across all views (grid, list, modal) for the same control?
- [ ] Do all tooltips have a max-width cap to prevent clipping?

---

## GitHub Issue Convention
Claude Code creates and closes issues automatically. Convention for commit messages:
✅ Closes #27, Closes #28, Closes #29
❌ Closes #27 #28 #29

Labels: bug · feature · enhancement · chore · high · med · low
Milestones: v1.2.0

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
- table-fixed on ListCardTable prevents horizontal overflow
- Workspace scroll container uses p-1 pb-20 (not overflow-x-hidden) to allow tooltips and ring-offset to render on edge cards
- 4-copy rule exemptions: check type_line for "Basic Land" and oracle_text for "A deck can have any number"
- Qty 0 behavior: card stays in deck, grays out, excluded from total count and to-buy cost — matches − button behavior
- 4-copy rule is a soft warning (highlight) not a hard cap — matches existing + button behavior
- UI state persistence keys: mtg-view-mode (visual/list), mtg-group-by-type, mtg-active-deck, mtg-deck-view-mode (main/sideboard), mtg-sort-preference
- Sideboard: enabled per-deck as sideboard?: DeckCard[] on the Deck type. undefined = no sideboard, [] = enabled but empty
- deckViewMode lives in useDeckManager context so both Sidebar and Workspace can read it
- REVIEW.md is the live session journal — written by Claude Code, read by all three parties. Never committed mid-session. Committed alongside CLAUDE.md and CHANGELOG.md at session end.
- Plan Review step: Claude Code always outputs a plan table to REVIEW.md before touching any files, then waits for PROCEED
