# MTG Deck Builder & Simulator — Source of Truth
Authors: Phi & Thurgood Nguyen
Stack: Next.js + TypeScript + Tailwind CSS
Deployed: Vercel | Repo: GitHub (itsmephi/mtg-deck-builder)
IDE: VS Code (Windows, primary) · Zed on Steam Deck (Linux, secondary)
Current Version: v1.5.2 — see CHANGELOG.md for full history

---

## How This Project Works

| File | Written by | Read by |
|---|---|---|
| CLAUDE.md | Claude Code only | All three (Claude Chat, Claude Code, Phi) |
| BACKLOG.md | Claude Code only | All three |
| REVIEW.md | Claude Code only | All three |
| CHANGELOG.md | Claude Code only | All three |

Claude Chat never drafts, generates, or edits these files directly. Claude Chat designs and produces Claude Code prompts. Claude Code owns all file changes.

Process documentation lives in `.claude/rules/` — Claude Code loads these on demand:
- `release-workflow.md` — full release steps, carry-forward rules
- `design-checklist.md` — feature design and UI behavior checklists
- `backlog-and-capture.md` — BACKLOG.md lifecycle and triage process
- `docs/WORKFLOW.md` — human-readable workflow reference for Phi and Thurgood

---

## Workflow Shortcuts
- `/capture` — add bugs, features, and ideas directly to BACKLOG.md Pipeline
- `/triage` — review and categorize all Pipeline items (promote, keep, defer, discard)
- `/plan` — plan an implementation before building (flags complex changes for Claude Chat review)
- `/commit-release vX.X.X` — post-APPROVED commit, merge, and push

## When to Involve Claude Chat
- Feature design sessions (requirements, UX decisions, spec sign-off)
- Complex features — ask for a **prototype first**, then spec
- Any `/plan` output that flags ⚠️ (5+ files or new components)
- Workflow process changes

Triage and milestone planning now run in Claude Code via `/triage`. After triage, take promoted items to Claude Chat for design if they need it.

For straightforward bug fixes and small enhancements, `/plan` → PROCEED → build → QA → APPROVED → `/commit-release` can run entirely in Claude Code.

---

## Active Milestone
→ v1.5.0 shipped. Active milestone cleared. See BACKLOG.md Pipeline for next items.

---

## GitHub Issue Convention
Commit message syntax: `Closes #27, Closes #28` (each separately — not `Closes #27 #28`)
Labels: bug · feature · enhancement · chore · high · med · low

---

## File Structure
```
src/
  app/               → layout.tsx, page.tsx, globals.css
  config/            → version.ts ← bump APP_VERSION each release; CHANGELOG entries are string[] (one string per bullet point, not a single paragraph)
  components/
    layout/          → Sidebar.tsx (shell), SidebarRail.tsx, SidebarSearchTab.tsx, SidebarDecksTab.tsx, CardModal.tsx, SampleHandModal.tsx, FormatPicker.tsx
    workspace/       → Workspace.tsx, WorkspaceToolbar.tsx, VisualCard.tsx, ListCardTable.tsx, ImportModal.tsx
                       (DeckDropdown.tsx retired v1.3.0 — absorbed into SidebarDecksTab)
  hooks/             → useDeckManager.tsx, useDeckImportExport.tsx, useDeckStats.ts
  lib/               → scryfall.ts, formatRules.ts
  types/             → index.ts
```

---

## Key Technical Notes
- Scryfall API: searchCards appends order:usd to prefer priced printings
- $0.00 rescue: check !prices.usd || prices.usd === "0.00" — both cases need rescue
- handleAddCard is async — rescue happens before updateActiveDeck
- lastAddedId in context: set by Sidebar on add, cleared by Workspace after scroll+highlight
- setCardRef(id) curried helper for card refs — inline { if(el) } causes parse errors
- duplicate ))} bug: caused by stacked .map() closings — always verify only one per map
- TCGPlayer format: "1 Memnite [BRO]" — Card Kingdom: name only
- contentEditable abandoned for deck name input — use size={Math.max(10, name.length)}
- table-fixed on ListCardTable prevents horizontal overflow
- Workspace scroll container uses p-4 pb-20 (not overflow-x-hidden) for tooltips, ring-offset, and badge overhang clearance
- 4-copy rule exemptions: check type_line for "Basic Land" and oracle_text for "A deck can have any number"
- Qty 0: card stays in deck, grays out, excluded from total count and to-buy cost
- 4-copy rule is a soft warning (highlight) not a hard cap
- UI state persistence keys: mtg-view-mode, mtg-group-by-type, mtg-active-deck, mtg-deck-view-mode, mtg-sort-preference, mtg-show-thumbnail, mtg-sidebar-collapsed, mtg-sidebar-active-tab
- Sideboard: enabled per-deck as sideboard?: DeckCard[] — undefined = no sideboard, [] = enabled but empty
- deckViewMode lives in useDeckManager context
- `format` and `commanderId` persisted as part of deck data in `mtg_builder_decks` localStorage
- `commanderId` references `DeckCard.id` — dangling refs (card removed) treated as "no commander"
- Color identity check: `cardIdentity.every(c => commanderIdentity.includes(c))`
- Copy limit exemptions unchanged: Basic Land + "any number" oracle text
- Commander eligibility: `type_line` contains "Legendary" OR `oracle_text` contains "can be your commander" — soft check only
- Format rules: `getFormatRules(format)` is the single source of truth for all format-specific behavior
- Lazy backfill: `backfillColorIdentity(cards)` triggered in Workspace useEffect when activeDeck switches to Commander; uses Scryfall `/cards/collection`; silent failure
- Simulator thresholds: 8%/4% (Freeform/Standard 60-card), 5%/2% (Commander 100-card) — set in `formatRules.ts` as `probGreen`/`probYellow`
- List view column order: Qty, Owned, Name, Type, Mana, Price, ×

---

## Workflow Rules (always active)
- REVIEW.md: live session journal. Never committed mid-session. Committed at session end alongside CLAUDE.md, CHANGELOG.md, BACKLOG.md.
- Plan Review: Claude Code outputs plan table to REVIEW.md before touching files, waits for PROCEED.
- One active machine per Claude Code session — git commit is the handoff. Always git pull before starting, git push after.
- Claude Code allowedTools whitelist: Bash(git *) and Bash(npm *). Intentional.
- Never prepend cd to git or npm commands — already in the project root.
- Design before build, always. No prompt generation until design is fully signed off.
- Root cause before fix. Diagnose intended behavior before writing any fix spec.
