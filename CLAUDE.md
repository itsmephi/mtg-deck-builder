# MTG Deck Builder & Simulator — Source of Truth
Authors: Phi & Thurgood Nguyen
Stack: Next.js + TypeScript + Tailwind CSS
Deployed: Vercel | Repo: GitHub (itsmephi/mtg-deck-builder)
IDE: VS Code (Windows, primary) · Zed on Steam Deck (Linux, secondary)
Current Version: v1.13.0 — see CHANGELOG.md for full history

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

**Claude Chat deliverable format:** spec and prompts must always be separate files. Spec = one reference doc committed to `docs/`. Each Claude Code prompt = its own standalone paste-ready `.md` file. Never combine spec + prompts into a single document.

Triage and milestone planning now run in Claude Code via `/triage`. After triage, take promoted items to Claude Chat for design if they need it.

For straightforward bug fixes and small enhancements, `/plan` → PROCEED → build → QA → APPROVED → `/commit-release` can run entirely in Claude Code.

---

## Active Milestone
→ v1.14.0 (5 items: CardModal fwd/back nav, Submit a Bug button, search format badge, set abbreviation click, artist name click)

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
                       gridConfig.ts ← shared tile size stops, TileSizeKey type, DEFAULT_TILE_SIZE, TILE_SIZE_STORAGE_KEY
  components/
    layout/          → Sidebar.tsx (shell), SidebarRail.tsx, SidebarSearchTab.tsx, SidebarDecksTab.tsx, CardModal.tsx, SampleHandModal.tsx, FormatPicker.tsx, CategoryChips.tsx, FilterPanel.tsx
    workspace/       → Workspace.tsx, WorkspaceToolbar.tsx, VisualCard.tsx, ListCardTable.tsx, ImportModal.tsx, SearchWorkspace.tsx, SearchBar.tsx, TileSizeSlider.tsx
                       (DeckDropdown.tsx retired v1.3.0 — absorbed into SidebarDecksTab)
  hooks/             → useDeckManager.tsx, useDeckImportExport.tsx, useDeckStats.ts
  lib/               → scryfall.ts, formatRules.ts, nlpParser.ts
  types/             → index.ts
```

---

## Key Technical Notes
- Scryfall API: searchCards appends order:usd to prefer priced printings
- $0.00 rescue: check !prices.usd || prices.usd === "0.00" — both cases need rescue
- handleAddCard is async — rescue happens before updateActiveDeck
- lastAddedId in context: set by Sidebar on add, cleared by Workspace after scroll+highlight
- Settings overlay contract: any action that navigates away (tab click, deck name click, home button) MUST call `onCloseSettings?.()` — `showSettings` is not auto-cleared by routing; failures here cause the settings view to persist silently. Design checklist item: "does this navigation action need to close settings?"
- setCardRef(id) curried helper for card refs — inline { if(el) } causes parse errors
- duplicate ))} bug: caused by stacked .map() closings — always verify only one per map
- TCGPlayer format: "1 Memnite [BRO]" — Card Kingdom: name only
- contentEditable abandoned for deck name input — use size={Math.max(10, name.length)}
- table-fixed on ListCardTable prevents horizontal overflow
- Workspace scroll container uses p-4 pb-20 (not overflow-x-hidden) for tooltips, ring-offset, and badge overhang clearance
- 4-copy rule exemptions: check type_line for "Basic Land" and oracle_text for "A deck can have any number"
- Qty 0: card stays in deck, grays out, excluded from total count and to-buy cost
- 4-copy rule is a soft warning (highlight) not a hard cap
- UI state persistence keys: mtg-view-mode, mtg-group-by-type, mtg-active-deck, mtg-deck-view-mode, mtg-sort-preference, mtg-show-thumbnail, mtg-sidebar-collapsed, mtg-sidebar-active-tab, mtg-tile-size (values: "xs"|"s"|"m"|"l"|"xl", default "m"), mtg-sidebar-filters (serialized FilterState — price, anyPrice, rarities, types, colors, yearMin, yearMax)
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
- NLP parser: `parseSearchQuery(input)` in `lib/nlpParser.ts` — returns `{ tokens, scryfallQuery, remainder }`; `ParsedToken` has `matchedText` field used for token removal via `query.replace(token.matchedText, '')`
- Sidebar filter state: `FilterState` + `DEFAULT_FILTERS` + `buildSidebarFilterSyntax()` + `serializeFilters()` + `deserializeFilters()` + `SIDEBAR_FILTERS_STORAGE_KEY` exported from `FilterPanel.tsx`; full state persists to `mtg-sidebar-filters` localStorage key
- Autocomplete: `autocompleteCards(query)` in `scryfall.ts` calls Scryfall `/cards/autocomplete?q=...`, returns `string[]` of card names
- SearchWorkspace query assembly order: format filter + chip-or-NLP + sidebar filter syntax — all three joined by space
- CardModal `context` prop: `'search'` shows "+ Add to Deck" button (calls `onAddToDeck(previewCard)` then `setView("details")`); `'deck'` (default) shows "Confirm Art Swap" — backwards compatible, Workspace.tsx passes no context
- `lookupSetCode(name)` in `scryfall.ts`: fetches `/sets` once, caches module-level; normalizes to words; returns best all-words-match scored by `queryWords.length / setWords.length` (higher = more specific)
- `setMatch` state in SearchWorkspace: debounced 500ms lookup fires when `parsed.remainder` has 2+ words; injects `e:CODE` into scryfallQuery; guarded by `setMatch.query === parsed.remainder`
- `anyPrice: boolean` in FilterState: when true, `buildSidebarFilterSyntax` skips all price clauses; slider/inputs dim via `opacity-30 pointer-events-none`
- `yearMin`/`yearMax` in FilterState: default last 5 years (CURRENT_YEAR-4 to CURRENT_YEAR); year syntax only injected when `yearMin > 1993` or `yearMax < CURRENT_YEAR`; presets: "This Year" (currentYear–currentYear), "Last 5 Yrs" (default), "All" (1993–currentYear); `released_at?: string` on `ScryfallCard` (ISO date "YYYY-MM-DD") — displayed in CardModal Product Details
- `isEligibleCommander`: requires `type_line` contains "Legendary" AND "Creature", OR `oracle_text` contains "can be your commander", OR `type_line` contains "Legendary" AND ("Vehicle" OR "Spacecraft") AND card has `power`/`toughness` defined; falls back to `card_faces[0]` for reversible cards where root `type_line`/`oracle_text` may be absent
- `groupCardsByType` in Workspace: prepends `Commander` group when `format === "commander" && commanderId && deckViewMode === "main"`; commander card is routed there instead of its type bucket
- Design token system: 25 semantic CSS custom properties; dual palette — Warm Stone default (`:root`), Zed Dark alt (`[data-theme="zed-dark"]`). Registered via `@theme inline` as Tailwind utilities. Token categories: `surface-base/raised/overlay/backdrop/panel/panel-raised/deep/hover` → `bg-surface-*`; `input-surface/edge/edge-focus/value/placeholder` → `bg-input-surface`, `border-input-edge/edge-focus`, `text-input-value/placeholder`; `content-primary/heading/secondary/tertiary/muted/faint/disabled` → `text-content-*`; `line-default/subtle/panel/focus/hover` → `border-line-*`. Depth model: Warm Stone sidebar RAISED (panel lighter than base), Zed Dark sidebar RECESSED (panel darker than base) — same token names, theme handles difference. Theme switching: `document.documentElement.dataset.theme = 'zed-dark'` / `delete document.documentElement.dataset.theme` — UI toggle in Settings Hub → Preferences tab; persists to `localStorage` key `mtg-theme`; initialized via inline `<script>` in `layout.tsx` `<head>` to prevent flash. NOT tokenized: opacity variants (e.g. `bg-neutral-800/50`), accent colors, `text-neutral-100`. All other flagged mid-tones resolved: `text-neutral-700` → `text-content-disabled`, `bg-neutral-950` → `bg-surface-deep`, `hover:bg-neutral-600` → `hover:bg-surface-hover`, `border-neutral-600` → `border-line-hover`, `focus-within:border-neutral-600` → `focus-within:border-input-edge-focus`. Naming rule: `@theme inline` generates `[property-prefix]-[color-name]` — color name must not repeat the property prefix (e.g. `--color-text-*` would generate `text-text-*`; `--color-border-*` would generate `border-border-*`).

---

## Workflow Rules (always active)
- REVIEW.md: live session journal. Never committed mid-session. Committed at session end alongside CLAUDE.md, CHANGELOG.md, BACKLOG.md.
- Plan Review: Claude Code outputs plan table to REVIEW.md before touching files, waits for PROCEED.
- One active machine per Claude Code session — git commit is the handoff. Always git pull before starting, git push after.
- Claude Code allowedTools whitelist: Bash(git *) and Bash(npm *). Intentional.
- Never prepend cd to git or npm commands — already in the project root.
- Design before build, always. No prompt generation until design is fully signed off.
- Safe handoff: every Claude Code prompt must leave the app in a stable, testable state. No prompt should introduce known regressions that require the next prompt to fix. After each prompt, WIP commit on the branch and push — this is the machine handoff point (workstation ↔ Steam Deck). Only `/commit-release` merges to main.
- Carry-forward fixes: if QA surfaces 2+ bugs, they become their own dedicated fix prompt (not bundled into the next feature prompt). This keeps each prompt's QA surface small and ensures the app is stable before new features land. A single minor fix can still be bundled as a carry-forward at the top of the next prompt.
- Root cause before fix. Diagnose intended behavior before writing any fix spec.
