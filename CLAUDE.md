# MTG Deck Builder & Simulator — Source of Truth
Authors: Phi & Thurgood Nguyen
Stack: Next.js + TypeScript + Tailwind CSS
Deployed: Vercel | Repo: GitHub (itsmephi/mtg-deck-builder)
IDE: Zed on Steam Deck (Linux)
Current Version: v1.2.0 — see CHANGELOG.md for full history

---

## Session Start — Claude Chat
Every planning session, Claude Chat should automatically run through this checklist before any design work begins:
- [ ] Read BACKLOG.md (project file) — grab the latest consolidation timestamp at the bottom
- [ ] Pull Capture Log via recent_chats tool — find the most recent consolidation marker in the summary. Capture Log URL: https://claude.ai/chat/39f0cbd5-b1f5-4995-8b54-c0f6769fcec7
- [ ] If timestamps match → backlog is current ✅. If they don't match → flag as blocker before any design work ⚠️
- [ ] Confirm REVIEW.md shows APPROVED ✅ with no open carry-forwards from last session
- [ ] Confirm version in CLAUDE.md matches latest CHANGELOG.md entry
- [ ] Confirm no unclosed GitHub issues from last session
- [ ] Flag any of the above as blockers before proceeding
- [ ] Proactively suggest workflow or process improvements based on what we learned last session
- [ ] Remind Phi to **sync CLAUDE.md via the Claude project files sync button** — not upload manually

> **Note:** Claude Chat reads CLAUDE.md + REVIEW.md at the start of every chat — not just planning sessions — to determine current session state.

### Backlog Triage (run at the start of every session before choosing what to design)
1. Pull full backlog and present as a categorized table with suggested action for each item
2. Categories: Keep · Discard · Defer to v2.0 · Needs discussion
3. Pre-fill every item based on: type, age, complexity, active milestone relevance, v2.0 fit
4. Phi reviews and calls out overrides only — everything else locks as suggested
5. Needs discussion items are talked through briefly before locking
6. Discarded items: close GitHub issue, remove from CLAUDE.md
7. v2.0 deferrals: move to v2.0 section in CLAUDE.md

---

## Capture Log
A dedicated chat in this Claude project named "Capture Log — MTG Deck Builder" is the single place for all bugs, ideas, features, and UI tweaks captured between planning sessions. At the start of every planning session, Claude Chat and Phi review the Capture Log together and promote items into the Claude Code prompt and CLAUDE.md update instructions. Claude Code never reads the Capture Log directly — Claude Chat handles the triage and includes everything explicitly in the prompt.

Consolidation is a between-session action — run it anytime, not just before a planning session. Use the standard consolidation prompt in the Capture Log chat (stored at the top of BACKLOG.md). Claude Chat outputs a Claude Code prompt → Claude Code appends interpreted items to BACKLOG.md, appends a timestamp, and commits. Claude Chat drops a matching timestamp marker in the Capture Log chat. Phi syncs project files.

At session start, Claude Chat checks that the latest timestamp in BACKLOG.md matches the most recent marker in the Capture Log summary. If they match, backlog is current. If not, consolidate before proceeding.

When Phi says "we're out of session", Claude Chat shifts to capture-only mode — no design work.

Active feature session lives in its own chat. All other chats default to capture-only mode unless Phi says otherwise.

---

## BACKLOG.md
Temporary capture scratch pad. Lives in the repo root. Items are promoted to the Backlog section of CLAUDE.md (with GitHub issue numbers) during planning sessions, then cleared from BACKLOG.md.
- Claude Code appends items using format: `- [ ] **label** | description`
- Valid labels: bug · feature · enhancement · chore · workflow · review · v2.0
- Claude Code interprets and cleans up captured items — does not sort, deduplicate, or assign issue numbers during consolidation
- Consolidation timestamps appended at bottom: `--- consolidated to BACKLOG.md YYYY-MM-DDTHH:MM ---` 🎴
- During planning session triage: Claude Chat cross-references CLAUDE.md, assigns issue numbers, folds workflow items into CLAUDE.md, promotes the rest to CLAUDE.md backlog with issue numbers, then clears promoted items from BACKLOG.md
- workflow items get folded into CLAUDE.md directly — no GitHub issue created
- BACKLOG.md is bundled into the final session commit alongside CLAUDE.md, CHANGELOG.md, REVIEW.md

---

## How This File Works
This is the single source of truth for the project, shared between:

| File | Written by | Read by |
|---|---|---|
| CLAUDE.md | Claude Code only (prompted by Claude Chat) | All three |
| BACKLOG.md | Claude Code only (prompted by Claude Chat) | Claude Chat, Claude Code |
| REVIEW.md | Claude Code only | All three |
| CHANGELOG.md | Claude Code only | All three |

**Claude Chat never drafts, generates, or edits CLAUDE.md, BACKLOG.md, REVIEW.md, or CHANGELOG.md directly — not even as a helpful shortcut. Claude Chat designs and produces prompts. Claude Code owns all file changes. If Claude Chat catches itself about to generate one of these files, it should stop and write a prompt instead.**

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
→ TBD — Design session required before building next milestone

---

## v1.2.0 and beyond (deferred)
→ Issues: #4–#14

- Mana Curve Chart (#4) *(closed this release)*
- Color Identity Bar (#5)
- Deck Legality Checker (#6)
- Draw probability stats per card (#7) *(closed this release)*
- Add turn tracker during deck testing (#8)
- Show mulligan count in parenthesis (#9) *(closed this release)*
- Ability to mark cards as owned vs. to-buy independently (#10)
- Toggle card scale for art previews (#11)
- Ability to toggle a card inactive while retaining count (#12)
- Shade list view row by card color identity (#13) *(closed this release)*
- Display TCGPlayer price in orange, Card Kingdom in blue (#14)

## v2.0 (deferred)

- Dark/light/system theme toggle (#50)
- TCGPlayer and Card Kingdom buy button layout — revisit row 2 (#51)
- List view ownership progress bar too wide — revisit after UI review (#54)
- Tooltip visual treatment needs polish — revisit during UI polish sweep (#60)
- Major search sidebar redesign — functionality and UI overhaul (#71)
- Mobile version — cleaner, tighter, more intuitive for vertical small screens (#74)
- UI/UX overhaul (#75)

---

## Backlog
New ideas captured here first, then promoted to a milestone when ready to build.

- New app name — Phi & Thurgood to brainstorm (#15)
- Custom card sorting by drag and drop (#16)
- Support Standard and Commander deck modes (#17)
- EDHREC improved search suggestions (#26) ↑ priority
- Visual separator/padding between sort groups (color or mana value) (#47) *(closed this release)*
- Owned counter should allow inline typing like qty counter (#48) *(closed this release)*
- Version badge popup — revisit behavior (#49)
- Soft warning for exceeding 60-card main deck limit (#53) *(closed this release)*
- Clicking blue dot indicator in dropdown switches active deck without closing dropdown (#55) *(closed this release)*
- Color progression on count indicators: green at cap, yellow at soft limit, red when exceeded (#56) *(closed this release)*
- Main/Side pill toggle colored to reflect current view state (#57) *(closed this release)*
- Sideboard pricing — show combined total with main deck by default (#58) ↑ priority
- Settings state does not persist on refresh (e.g. thumbnail toggle) (#59) ↑ priority *(closed this release)*
- Move cards between boards or decks (#62) ↑ priority
- Default new deck name is "Untitled" in gray; turns white and saves when user enters a name (#70) ↑ priority *(closed this release)*
- Grid view card icons and action buttons appear on hover/rollover — requires design session before building (#76)
- Deck dropdown radio buttons — inactive decks show hollow gray circle; click switches active deck without closing dropdown (#77)

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
   - **Note:** Claude Code prompts are always generated as `.md` files — never `.docx` or any other format.

3. `git checkout -b vX.X.X`
   > **Note:** WIP commits stay on the branch — never merge to main until APPROVED.

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
   - `git add CLAUDE.md CHANGELOG.md REVIEW.md BACKLOG.md && git commit -m "update CLAUDE.md, CHANGELOG.md, REVIEW.md, and BACKLOG.md post vX.X.X"`

8. `git checkout main && git merge vX.X.X && git push` — Claude Code handles this after APPROVED.

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

### Session Close Sweep
Before generating the Claude Code prompt, Claude Chat sweeps the full chat session for:
- Any emergent items discussed but not explicitly folded into CLAUDE.md — fold them in now or flag for Capture Log
- Any previously captured items made obsolete by decisions made during this session — remove or update them
No chat session ends without this sweep completing.

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
- UI state persistence keys: mtg-view-mode (visual/list), mtg-group-by-type, mtg-active-deck, mtg-deck-view-mode (main/sideboard), mtg-sort-preference, mtg-show-thumbnail
- Sideboard: enabled per-deck as sideboard?: DeckCard[] on the Deck type. undefined = no sideboard, [] = enabled but empty
- deckViewMode lives in useDeckManager context so both Sidebar and Workspace can read it
- REVIEW.md is the live session journal — written by Claude Code, read by all three parties. Never committed mid-session. Committed alongside CLAUDE.md and CHANGELOG.md at session end.
- Plan Review step: Claude Code always outputs a plan table to REVIEW.md before touching any files, then waits for PROCEED
- Capture Log chat URL: https://claude.ai/chat/39f0cbd5-b1f5-4995-8b54-c0f6769fcec7 — always find via recent_chats tool (not conversation_search by keyword, which is unreliable). At session start, only check that the latest consolidation timestamp in BACKLOG.md matches the most recent marker in the Capture Log summary — do not re-triage the full log.
- BACKLOG.md is owned by Claude Code — Claude Chat never drafts or edits it directly. Standard consolidation prompt lives at the top of BACKLOG.md. Promoted items move to CLAUDE.md Backlog with issue numbers, then cleared. Bundled into the final session commit alongside the other 3 files.
- Claude Chat never drafts, generates, or edits CLAUDE.md, BACKLOG.md, REVIEW.md, or CHANGELOG.md directly — not even as a helpful shortcut. Claude Chat designs and produces prompts. Claude Code owns all file changes. If Claude Chat catches itself about to generate one of these files, it should stop and write a prompt instead.
- One active machine per Claude Code session — git commit is the handoff between machines.
- Steam Deck is a second dev environment alongside Windows. Always git pull before starting a session and git push after. Node installed via nvm (not pacman) to survive SteamOS updates. Claude Code authenticated separately.
- Claude Code allowedTools whitelist: Bash(git *) and Bash(npm *) — reduces confirmation prompts. This is intentional.
- BACKLOG.md promoted item cleanup: after promoting items to CLAUDE.md in a session commit, always clear those promoted items from BACKLOG.md in the same commit. Timestamps and unpromoted items stay.