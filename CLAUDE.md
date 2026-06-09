# CLAUDE.md — Project Brew

Personal MTG deck builder, designed for Thurgood (13) and shared with anyone who finds it useful. Currently accessible via Vercel link; heading toward public free release with optional accounts.

Authors: Phi & Thurgood Nguyen.

> **The current foundation reset governs all upcoming work.** See `docs/PRODUCT.md` and `docs/DECISIONS.md` for the strategic direction. Hybrid rebuild strategy: keep the engine, rebuild the surface.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Vercel. Local-first (localStorage) with optional Supabase cloud sync + Google auth (v2.0.0, gated on env vars).

IDE: Zed (Windows primary, Steam Deck/Linux secondary).

## Hard Rules

- Accounts are **optional and local-first** (v2.0.0). Google sign-in + Supabase cloud sync exist, but the app must always work signed out — never make a feature require an account. Default mental model is still single-user-per-device; sync is additive.
- Never prepend `cd` to git or npm commands — already in project root.
- One active machine per Claude Code session. `git pull` before starting, `git push` after. Git commit is the handoff.
- Safe handoff: every Claude Code prompt must leave the app in a stable, testable state.
- Root cause before fix. Diagnose intended behavior before writing any fix spec.
- Engine vs. surface: the engine (data, format rules, Scryfall integration, types) is stable. Surface (IA, components, mobile) is being rebuilt. Be aware which layer you're touching.

## Working Tiers

Default to direct work. Tier up only when the change earns it.

**Direct work** — bug fixes, polish, copy changes, dependency bumps, obvious-design features. Just do it. No spec, no plan, no approval gate. Explain what changed in the commit or PR.

**Lightweight spec** — features with one or two real decisions but no data model changes or cross-screen flows. A short note in `docs/specs/` covering the decisions. No template required, no checklist required.

**Full spec from Claude.ai** — data model changes, multi-screen flows, real UX tradeoffs, anything touching the engine layer's contracts. Phi designs these in Claude.ai; the resulting spec is the implementation contract, committed before building.

## Development Rules

- **Token optimization.** Targeted reads only. No full-file cats when a grep will do.
- **Proactive suggestions.** Flag gaps, new docs, or tooling improvements before creating them.
- **Speak up when something feels wrong.** If a request removes a working pattern, reverses a recent decision, or feels worth sitting with — raise it in one sentence before doing the work. Don't ask when the request feels right.
- **Version sync.** `APP_VERSION` in `src/config/version.ts` is the source of truth. On every version bump, also update `CHANGELOG.md`. Two files change together.
- **Commits.** Conventional format: `feat:` `fix:` `docs:` `chore:`. One-liner unless the why isn't obvious from the diff. GitHub issue syntax: `Closes #27, Closes #28` (each separately).
- **Specs are immutable after implementation.** Never edit a spec in place — create a new versioned file.
- **Emergent tasks/bugs.** Add to `docs/BACKLOG.md` inbox section during sessions. Triage when inbox has new items.

## Versioning & Docs

- **Semver**: major.minor.patch.
- **Source of truth**: `src/config/version.ts`. CHANGELOG.md mirrors it.

### File Map

| File | Owner | Purpose |
|------|-------|---------|
| `CLAUDE.md` | Claude Code | Agent briefing — stack, rules, tiers |
| `docs/PRODUCT.md` | Claude.ai / Phi | What the app is, who it's for, why it exists |
| `docs/DECISIONS.md` | Claude.ai / Phi | Product decision log with rationale |
| `docs/specs/*.md` | Claude.ai | Handoff contracts — immutable after implementation |
| `docs/ARCHITECTURE.md` | Claude Code | Technical patterns, file structure, gotchas |
| `docs/SCHEMA.md` | Claude Code | Data shapes (localStorage, future Supabase) |
| `docs/BACKLOG.md` | Shared | Inbox → triaged → parked items |
| `docs/WORKFLOW.md` | Claude Code | Human-readable workflow reference |
| `CHANGELOG.md` | Claude Code | Version history |

**Ownership rule:** Claude.ai owns the *why and what* (PRODUCT, DECISIONS, specs). Claude Code owns the *how* (everything else). Claude Code does not edit PRODUCT.md, DECISIONS.md, or specs — flag changes to Phi instead.

## Workflow Shortcuts

- `/plan` — invoke when you want to see the plan before work starts. Optional, not the default. Use it for tricky changes, data model work, or anything you want a second pass on.
- `/commit-release vX.X.X` — post-QA commit, merge, and push.

## Current Version

`v2.0.0` — Google auth + cloud deck sync. Optional accounts so a signed-in user's decks follow them across devices, and each invited tester gets a private, RLS-isolated library. **Local-first**: signed out, the app is localStorage-only exactly as before; gated entirely on `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (absent → `isSupabaseConfigured` false, `supabase` null, no Account UI, behaviour identical to v1.x). Stack: `@supabase/supabase-js` (browser client, `detectSessionInUrl` so OAuth needs no callback route), Supabase Auth Google provider, Postgres + Row-Level Security. New `src/lib/supabase.ts` (null-when-unconfigured client), `src/hooks/useAuth.tsx` (`AuthProvider`: `status`/`user`/`signInWithGoogle`/`signOut`), `src/lib/deckStore.ts` (shared `migrateDecks`/`loadLocalDecks`, row⇄deck mappers, `SupabaseDeckStore` per-deck `loadAll`/`upsert`/`remove`). `layout.tsx` wraps `AuthProvider` → `DeckProvider`. `DeckProvider` keeps its whole-array localStorage write (warm offline cache) and adds cloud sync: on sign-in it loads cloud decks + (once per user per device, guarded by `mtg-merged-<userId>`) merges local-only decks up; deck changes are diffed against a last-synced snapshot and debounced-pushed (800ms) per deck; sign-out reverts to the local cache. Conflicts: last-write-wins per deck by `updated_at`. Decks stored as JSONB blobs (`cards`/`sideboard`/`commander_ids`; the latter two nullable to preserve the no-sideboard / no-commander vs. empty-array distinction). Settings (theme/view/tile size) stay device-local — not synced. `SettingsView` gains an `AccountSection` (sign in/out + sync status, renders null when unconfigured). `supabase/schema.sql` holds the table + RLS (run once); `.env.example` documents the vars. Spec: `docs/specs/v2.0.0-google-auth-cloud-sync.md`. **Requires one-time setup before it activates** (Supabase project, Google OAuth client, run the SQL, set Vercel env) — see the spec's Setup section.

Prior: `v1.34.0` — PWA install icons & web manifest. The app had no install identity (no manifest, no icons), so Add-to-Home-Screen / desktop-PWA install produced a blank placeholder and the tab used the default favicon. Adds a brand mark for **Project Brew** — a brewing flask whose potion is layered in the five Magic colors (W/U/B/R/G), with a spark, on the Warm Stone surface (`#1c1917`). SVG sources live in `assets/icons/` (`icon.svg`, `icon-maskable.svg`, `apple-icon.svg`) and regenerate via `node assets/icons/generate.mjs` (`sharp` + `png-to-ico`) into `public/icons/` (192/512 `any` + `maskable`, 180px apple-touch-icon, 16/32 favicons) plus `src/app/favicon.ico`. New App Router `src/app/manifest.ts` serves `/manifest.webmanifest` (name "Project Brew" / short "Brew", `standalone`, theme/bg `#1c1917`). `layout.tsx` wires up `manifest`, `icons`, and `appleWebApp`; document title is "Project Brew".

Prior: `v1.33.0` — Mobile simulator layout. The Opening Hand Simulator (`SampleHandModal.tsx`) was unusable on a phone: the `flex-col lg:flex-row` split stacked the stats sidebar (mana curve + current hand + draw odds) full-width **above** the card grid, burying the drawn hand — the main view — below the fold. The card grid is now the primary mobile view (desktop sidebar gated behind `hidden lg:block`); the three stats sections collapse into a slide-up bottom **sheet** (`absolute inset-0 z-30`, `animate-in slide-in-from-bottom`, `max-h-[85%]`, dismiss via X / backdrop) toggled by a new **Stats** button in a thumb-reachable mobile action bar (`lg:hidden`) that also holds **Draw / Mulligan** (44px targets, `env(safe-area-inset-bottom)` padding). Both layouts render one shared `statsSections` node so they can't drift; card tiles gained `active:scale-95` (pin-on-tap means no hover-gated affordances). Desktop (`lg+`) unchanged — inline sidebar, Draw/Mulligan in header.

Prior: `v1.32.4` — Mobile grid edit-bar: lined-up counters & bottom-rail ✓. Follow-up to 1.32.3. The single `[− owned +] / [− qty +]` row left the owned counter offset by the `/`. The touch edit bar in `VisualCard` now **stacks** the owned stepper above the qty stepper, each with a fixed-width `Own` / `Qty` label, so the `− N +` controls line up in one column (no `/`). The owned `✓` toggle is no longer a bar child: the bottom-rail qty badge itself flips into the ✓ owned toggle when the bar opens (`badgeAsOwnedToggle` / `badgeShowsCheck`) — it stays pinned at `-12px` bottom-centre, rises to `z-46`, and tapping it toggles owned (mirroring the desktop hover flip). The bar reserves `pb-7` to clear it; dismissal is via tapping the art / outside. Desktop unchanged.

Prior: `v1.32.3` — Mobile grid edit-bar legibility & layout. The touch edit bar in `VisualCard` (tap a card's qty badge in grid view) was hard to read and lopsided: a `bg-gradient-to-t … to-transparent` let card art bleed through behind the upper steppers, and the leading owned `✓` shoved the `− owned + / − qty +` numbers off-centre. The bar now uses the desktop overlay's solid `bg-black/85 backdrop-blur-sm`. Desktop/pointer behaviour unchanged.

Prior: `v1.32.2` — One-line list rows in landscape. The mobile list row (`renderTouchRow`) stacked the name over a mana+type subline; in landscape / on tablets there's room for one line. The name cell is now `flex-col` on narrow and `sm:flex-row sm:items-center` at ≥640px (name `sm:flex-1` truncating, meta `sm:shrink-0`), with cells `sm:align-middle`. `renderTouchRow` only renders on touch, so the `sm:` rules never touch the desktop table.

Prior: `v1.32.1` — Stronger list color tints on Light theme. The list view shades each row by card color via `getRowTint`/`getRowHoverTint`; those alphas (8–15% rest) were dark-theme-tuned and washed out on the light cream surface (`#faf7f2`). Both functions now take an `isLight` flag and return a stronger, saturated palette on Light (≈22–34% rest), via a shared `getColorKey()` helper. A new in-file `useIsLightTheme()` hook tracks `<html data-theme="light">` through a `MutationObserver` so tints update live on theme/OS change. Dark themes unchanged.

Prior: `v1.32.0` — Themed mobile status bar. The mobile browser chrome (status bar with clock/battery/signal) now matches the active theme. The app emitted no `<meta name="theme-color">`, so browsers used their default chrome (or iOS Safari unreliably sampled the page background — why a dark theme only *sometimes* tinted it). New `applyThemeColor()` + exported `THEME_COLORS` map in `src/lib/theme.ts` create/update the meta tag to the palette's `--surface-base` (`#1c1917` Warm Stone · `#282c34` Zed Dark · `#faf7f2` Light); called from `applyTheme()` so runtime switches update it. The `layout.tsx` no-flash script sets it before first paint and on OS dark/light flips while preference is `system` (inlined color map kept in sync). See `docs/ARCHITECTURE.md` → **Design Token System**.

Prior: `v1.31.2` — Mobile art-strip centering fix. Tapping a deck card opens the `FindByNameBar` preview and scrolls the art-variants strip to that card's current printing. The strip-scroll `useLayoutEffect` derived tile width from a hardcoded 318px strip height — correct on desktop (`md:h-[318px]`) but wrong on mobile, where the full-screen preview makes the strip `flex-1` (taller, variable height), so the active printing landed off-center. It now measures the real tile element (`data-printing-id` + `getBoundingClientRect`) instead of computing from a fixed height, centering correctly at any strip height. See the scroll-to-printing effect in `FindByNameBar.tsx`.

Prior: `v1.31.1` — Mobile list readability. Follow-up to 1.31.0, reported on the Light theme: the touch list card name was a hardcoded `text-neutral-100` (≈ #f5f5f5) — washed out on the light cream background. Now uses the theme-aware `text-content-primary` token (also fixes the same latent bug in desktop `renderRow`). The touch name is also larger/bolder (`text-[15px] font-semibold`, `min-w-0`), and the name gets more width: qty column `w-14 → w-12`, tighter padding, and the `Workspace` scroll container gutter is `px-2 sm:px-4` (narrower on phones, desktop unchanged).

Prior: `v1.31.0` — List view on mobile. The list (table) view now works on touch, mirroring the grid-view touch pass (1.27.0). The desktop list is a wide 7-column `table-fixed` (~656px of fixed columns) with hover-revealed steppers — unusable on a phone. On touch (`useIsTouch` → `(hover: none)`) `ListCardTable` renders a compact 4-column row (owned ✓ · name with mana+type subline · qty chip · price) via a new `renderTouchRow`; tapping the qty chip expands an inline edit sub-row (owned toggle, owned/qty steppers with tap-to-edit numbers, red remove ✕). A fixed `<colgroup>` keeps columns stable; the desktop `<thead>` is hidden on touch. The commander crown becomes an always-visible per-row tap (shared `getCrownDecision` helper). Desktop (`renderRow`) is unchanged. See `docs/ARCHITECTURE.md` → **Touch & Sizing System**.

Prior: `v1.30.2` — Tools button border fix. The mobile "Tools" button in `WorkspaceToolbar` is now borderless — dropped `bg-surface-base border border-line-subtle shadow-sm` for a plain `text-content-muted` / `hover:bg-surface-raised` icon button, matching the site's other chrome icon buttons (hamburger, sidebar rail, search-bar menu). The boxed look was inconsistent.

Prior: `v1.30.1` — Mobile toolbar & delete polish. The mobile-only "Tools" button in `WorkspaceToolbar` is now icon-only (44px square, `SlidersHorizontal`, no label) to reclaim toolbar width. The grid card's touch remove (✕) in `VisualCard` — shown while the tap-to-edit bar is open — is now tinted red (`bg-red-900 text-red-300`) instead of neutral surface, since touch has no hover to signal the destructive action; desktop hover-to-red is unchanged.

Prior: `v1.30.0` — Light theme + match system. Adds a third palette, **Light** (`[data-theme="light"]`, warm light — the daylight counterpart to Warm Stone), and a **System** preference (now the default) that follows the OS: dark OS → Warm Stone, light OS → Light, updating live on OS flip. Theme logic centralized in `src/lib/theme.ts` (preference `system|warm-stone|zed-dark|light` vs. resolved theme); `mtg-theme` now stores the preference (absent = system). The `layout.tsx` no-flash init script resolves `system` before first paint and listens for OS changes. Picker in `SettingsView` is now four swatches (`THEME_OPTIONS`). Removed the dead `prefers-color-scheme` CSS block (resolution is JS-driven now). See `docs/ARCHITECTURE.md` → **Design Token System**.

Prior: `v1.29.0` — Undoable deck deletion. The sidebar deck-row ✕ menu's "Delete Deck" / "Delete Sideboard" now show a 4s Undo toast that restores the exact prior state (`SidebarDecksTab.deleteDeckWithUndo` / `deleteSideboardWithUndo` → snapshot `decks` + active id → `replaceAllDecks` + `setActiveDeckId`). `showUndoToast` threaded `page.tsx → Sidebar → SidebarDecksTab`. Completes the undo-on-delete pass (cards in 1.28.0, decks now).

Prior: `v1.28.0` — Undoable card removal + safer touch delete (1.27.0 follow-up). Deleting a card now shows a 4s Undo toast that restores it at its original position (`Workspace.removeCard` / `removeSideboardCard` → `showUndoToast`); covers grid + list, desktop + touch. The grid touch bar's ✕ moved out of the bar to the top-right corner (its desktop-hover spot), shown only while the bar is open — it was too easy to tap ✕ to dismiss the bar and delete by accident. Dismiss the bar by tapping the art / outside instead.

Prior: `v1.27.0` — Grid-view editing on touch (the 1.26.0 follow-up). On touch only (`useIsTouch` → `(hover: none)`), tapping the always-on quantity badge reveals a slim bottom bar (owned ✓ toggle, owned + qty steppers with tap-to-edit numbers). The Commander crown becomes an always-visible corner tap on touch. Desktop/pointer behaviour unchanged. Pattern in `docs/ARCHITECTURE.md` → **Touch & Sizing System** (Grid tile editing).

Prior: `v1.26.0` — Site-wide touch & sizing pass. One unified, finger-friendly scale across desktop and touch (no responsive split): 11px text floor, 44px standalone chrome buttons, dense inline controls un-gated from `opacity-0 group-hover` and always visible at ~28px, explicit `viewport-fit=cover`. Standard in `docs/ARCHITECTURE.md` → **Touch & Sizing System**.

## Post-Version Checklist

Trim. Most steps fold into the work itself.

1. **Version sync** — `version.ts` and `CHANGELOG.md` updated together.
2. **Staleness scan** — flag any doc with a `<!-- Last updated: vX.X.X -->` header two or more versions behind.
3. **Flag PRODUCT.md / DECISIONS.md changes to Phi** — Claude Code doesn't edit these directly.
