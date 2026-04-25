# Schema — MTG Deck Builder
<!-- Last updated: v1.21.0 -->

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
| `mtg-theme` | `'zed-dark'` | Absent = Warm Stone (default) |
| `mtg-last-backup` | ISO date string | Timestamp of last deck backup |

## sessionStorage

| Key | Type | Notes |
|-----|------|-------|
| `tbl-tagline-index` | `string` (number) | Home screen tagline index — same tagline per session, new each session |

## IndexedDB

Not used.

## External APIs

- **Scryfall** (`api.scryfall.com`) — card search, autocomplete, printings lookup, set data. No API key required.

## Future: Supabase

When the migration happens, tables go here. Currently a backlog item (v2.0).
