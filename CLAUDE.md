# MTG Deck Builder & Simulator — Source of Truth
Authors: Phi & Thurgood Nguyen
Stack: Next.js + TypeScript + Tailwind CSS
Deployed: Vercel | Repo: GitHub (itsmephi/mtg-deck-builder)
IDE: VS Code (Windows, primary) · Zed on Steam Deck (Linux, secondary)
Current Version: v1.2.0 — see CHANGELOG.md for full history

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
- `backlog-and-capture.md` — BACKLOG.md lifecycle, consolidation, triage process
- `session-close.md` — end-of-session sweep rules

---

## Session Start Checklist
- [ ] Confirm REVIEW.md shows APPROVED ✅ with no open carry-forwards
- [ ] Confirm version in CLAUDE.md matches latest CHANGELOG.md entry
- [ ] Confirm no unclosed GitHub issues from last session
- [ ] Flag any of the above as blockers before proceeding

Capture Log URL: https://claude.ai/chat/39f0cbd5-b1f5-4995-8b54-c0f6769fcec7
Consolidation is Phi's responsibility — BACKLOG.md is always treated as the current backlog regardless of Capture Log state.

---

## Active Milestone
→ TBD — Design session required before building next milestone

---

## GitHub Issue Convention
Commit message syntax: `Closes #27, Closes #28` (each separately — not `Closes #27 #28`)
Labels: bug · feature · enhancement · chore · high · med · low

---

## File Structure
```
src/
  app/               → layout.tsx, page.tsx, globals.css
  config/            → version.ts ← bump APP_VERSION each release
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
- handleAddCard is async — rescue happens before updateActiveDeck
- lastAddedId in context: set by Sidebar on add, cleared by Workspace after scroll+highlight
- setCardRef(id) curried helper for card refs — inline { if(el) } causes parse errors
- duplicate ))} bug: caused by stacked .map() closings — always verify only one per map
- TCGPlayer format: "1 Memnite [BRO]" — Card Kingdom: name only
- contentEditable abandoned for deck name input — use size={Math.max(10, name.length)}
- table-fixed on ListCardTable prevents horizontal overflow
- Workspace scroll container uses p-1 pb-20 (not overflow-x-hidden) for tooltips and ring-offset
- 4-copy rule exemptions: check type_line for "Basic Land" and oracle_text for "A deck can have any number"
- Qty 0: card stays in deck, grays out, excluded from total count and to-buy cost
- 4-copy rule is a soft warning (highlight) not a hard cap
- UI state persistence keys: mtg-view-mode, mtg-group-by-type, mtg-active-deck, mtg-deck-view-mode, mtg-sort-preference, mtg-show-thumbnail
- Sideboard: enabled per-deck as sideboard?: DeckCard[] — undefined = no sideboard, [] = enabled but empty
- deckViewMode lives in useDeckManager context

---

## Workflow Rules (always active)
- REVIEW.md: live session journal. Never committed mid-session. Committed at session end alongside CLAUDE.md, CHANGELOG.md, BACKLOG.md.
- Plan Review: Claude Code outputs plan table to REVIEW.md before touching files, waits for PROCEED.
- One active machine per Claude Code session — git commit is the handoff. Always git pull before starting, git push after.
- Claude Code allowedTools whitelist: Bash(git *) and Bash(npm *). Intentional.
- Design before build, always. No prompt generation until design is fully signed off.
- Root cause before fix. Diagnose intended behavior before writing any fix spec.
