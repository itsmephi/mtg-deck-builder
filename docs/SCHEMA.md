# Schema — MTG Deck Builder
<!-- Last updated: v2.0.0 -->

## Client State

Primary state lives in `useDeckManager` (hook) and is threaded down via props. No global store (no Zustand/Redux). Theme and sidebar state are component-local with localStorage backing.

## localStorage

| Key | Type | Notes |
|-----|------|-------|
| `mtg_builder_decks` | `Deck[]` (JSON) | All saved decks — main data store |
| `mtg-active-deck` | `string` | ID of the last active deck |
| `mtg-deck-view-mode` | `'main' \| 'sideboard'` | Which deck pane is visible |
| `mtg-sort-preference` | `{ by: SortBy, dir: 'asc' \| 'desc' }` (JSON) | Deck card sort setting |
| `mtg-show-thumbnail` | `'true' \| 'false'` | Card preview toggle in deck view |
| `mtg-view-mode` | `'grid' \| 'list'` | Deck view display mode |
| `mtg-group-by-type` | `'true' \| 'false'` | Group cards by type in deck view |
| `mtg-tile-size` | `'xs' \| 's' \| 'm' \| 'l' \| 'xl'` | Shared tile size for both grid views |
| `mtg-sidebar-collapsed` | `'true' \| 'false'` | Sidebar expanded/collapsed state |
| `mtg-theme` | `'warm-stone' \| 'zed-dark' \| 'light'` | Theme *preference*. Absent = `system` (default → dark OS: Warm Stone, light OS: Light) |
| `mtg-last-backup` | ISO date string | Timestamp of last deck backup |
| `mtg-merged-<userId>` | `'true'` | v2.0.0 — set once after a user's local decks are merged up to the cloud, so sign-in never re-uploads (and never resurrects cloud-deleted decks) |
| `sb-<ref>-auth-token` | JSON | v2.0.0 — Supabase session (set/managed by `@supabase/supabase-js`; present only when signed in) |

## sessionStorage

| Key | Type | Notes |
|-----|------|-------|
| `tbl-tagline-index` | `string` (number) | Home screen tagline index — same tagline per session, new each session |

## IndexedDB

Not used.

## External APIs

- **Scryfall** (`api.scryfall.com`) — card search, autocomplete, printings lookup, set data. No API key required.

## Supabase (v2.0.0)

Cloud sync is **local-first and optional**: signed out, the app is localStorage-only
exactly as before; signed in, decks sync to Postgres. Enabled only when
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set (absent =
local-only, no sign-in UI). Auth: Supabase Auth, Google provider only. Full
schema in `supabase/schema.sql`; design rationale in
`docs/specs/v2.0.0-google-auth-cloud-sync.md`.

### Table: `decks`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | Client-generated (`crypto.randomUUID`); same id as the local deck |
| `user_id` | `uuid` FK → `auth.users` | `on delete cascade`; RLS scopes every query to `auth.uid()` |
| `name` | `text` | |
| `format` | `text` | `freeform \| standard \| commander` |
| `commander_ids` | `jsonb` (nullable) | `string[]`; **null = no commander** (vs. `[]`) |
| `cards` | `jsonb` | `DeckCard[]` — main deck, full card objects (mirrors local shape) |
| `sideboard` | `jsonb` (nullable) | `DeckCard[]`; **null = sideboard not enabled** (vs. `[]` = enabled-empty) |
| `updated_at` | `timestamptz` | Stamped on each upsert; basis for last-write-wins |
| `created_at` | `timestamptz` | Load order |

**RLS:** select/insert/update/delete all gated on `auth.uid() = user_id` — the
isolation that makes inviting testers safe.

**Sync model:** per-deck upsert/remove diffed against a last-synced snapshot,
debounced 800ms (`DeckProvider`). Conflicts: last-write-wins per deck by
`updated_at`. Preferences (theme/view/tile size) are **not** synced — they stay
device-local.

### Not synced
The 10 non-deck localStorage preference keys above remain device-local by design.
No `user_preferences` table. No normalized per-card table (cards are blobs).
