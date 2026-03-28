<!-- Updated by Claude Code after each release. Last updated: v1.17.0 -->

# MTG Deck Builder — Architecture Reference

Living reference for file structure, state ownership, and key technical patterns. Updated after each release when components, state, or patterns change.

---

## Component Tree

### `src/app/`

| File | Responsibility |
|---|---|
| `layout.tsx` | Next.js root layout; wraps app in `DeckProvider`; inline `<script>` in `<head>` applies saved theme before first paint to prevent flash |
| `page.tsx` (Dashboard) | Top-level shell; owns sidebar tab state, settings open/tab state, tile size, chip state, sidebar filters, toast, and import plumbing; decides which main-area panel renders (HomeScreen / SearchWorkspace / Workspace / SettingsView) |

### `src/components/layout/`

| File | Responsibility |
|---|---|
| `Sidebar.tsx` | Outer shell; renders collapsed rail or expanded tab bar + tab content; manages collapsed/expanded state; enforces settings overlay close contract |
| `SidebarRail.tsx` | Collapsed 48px icon strip — search, decks, home, settings icons |
| `SidebarSearchTab.tsx` | Search tab: `CategoryChips` + `FilterPanel` |
| `SidebarDecksTab.tsx` | Deck list with create/delete/format/sideboard/import/export actions |
| `CardModal.tsx` | Full-screen card detail overlay; `context='search'` → "+ Add to Deck"; `context='deck'` (default) → "Confirm Art Swap" |
| `SampleHandModal.tsx` | Opening hand simulator — 7-card draw, mana curve histogram, draw odds per card; all commanders excluded from library |
| `FormatPicker.tsx` | Popover format selector (Freeform / Standard / Commander); opens downward or upward based on available space |
| `CategoryChips.tsx` | Format-aware quick-search chips (Ramp, Removal, Card Draw, etc.) shown in search tab |
| `FilterPanel.tsx` | Sidebar filter controls (price, rarity, type, color, year); exports `FilterState`, `DEFAULT_FILTERS`, `buildSidebarFilterSyntax()`, `serializeFilters()`, `deserializeFilters()`, `SIDEBAR_FILTERS_STORAGE_KEY` |

### `src/components/workspace/`

| File | Responsibility |
|---|---|
| `Workspace.tsx` | Active deck view; renders grid or list, sorts/groups cards, handles format-change dialog, triggers color identity backfill on Commander switch |
| `WorkspaceToolbar.tsx` | Two-row toolbar above deck (row 1: name + format badge; row 2: stats + view controls + sort) |
| `VisualCard.tsx` | Single grid tile; always-visible price badge (bottom-right, scales XS–XL); hover overlay with card name, type, qty controls, ownership counter, commander crown badge, warning indicator; `tileSize` prop drives badge sizing |
| `ListCardTable.tsx` | Table view; column order: Qty, Owned, Name, Type, Mana, Price, ×; `table-fixed` prevents horizontal overflow |
| `ImportModal.tsx` | Resolves a pending import into current deck or new deck |
| `SearchWorkspace.tsx` | Search tab main area; assembles Scryfall query from format filter + NLP chip/query + sidebar filter syntax; owns autocomplete, set-match detection |
| `SearchBar.tsx` | Search input with removable NLP token chips and autocomplete dropdown |
| `TileSizeSlider.tsx` | Tile size snap slider popover (XS / S / M / L / XL) |
| `SearchTakeover.tsx` | Empty-deck-aware search overlay with autofocus and quick-tag buttons |
| `SettingsView.tsx` | Full workspace-takeover settings hub (Preferences, What's New, About, Support tabs) |
| `HomeScreen.tsx` | Welcome screen when no active deck; shows deck cover cards and ghost create slot |

### `src/hooks/`

| File | Responsibility |
|---|---|
| `useDeckManager.tsx` | `DeckProvider` + `useDeckManager` — all deck CRUD, commander ops, sideboard ops, sort state, thumbnail toggle, `lastAddedId`; persists to localStorage |
| `useDeckImportExport.tsx` | File import parsing (`.txt` deck lists) and export formatting; owned by `page.tsx` |
| `useDeckStats.ts` | Pure derived stats from `activeDeck` — `totalCards`, `totalValue`, `remainingCost`, `hasPriceData`, `targetDeckSize`, `isAtTarget`, `isOverTarget`, `buyOnTCGPlayer()`, `buyOnCardKingdom()` |

### `src/lib/`

| File | Responsibility |
|---|---|
| `scryfall.ts` | All Scryfall API calls: `searchCards`, `getCardPrintings`, `autocompleteCards`, `lookupSetCode`, `backfillColorIdentity`, `getCardRulings`, `getTopCards` |
| `formatRules.ts` | Single source of truth for format behavior: `getFormatRules()`, `getCardWarnings()`, `isEligibleCommander()`, `getPartnerType()`, `canPartnerWith()`, `isVehicleOrSpacecraftCommander()` |
| `nlpParser.ts` | `parseSearchQuery(input)` — returns `{ tokens, scryfallQuery, remainder }`; `ParsedToken.matchedText` used for chip removal |

### `src/config/`

| File | Responsibility |
|---|---|
| `version.ts` | `APP_VERSION` string (bump each release); `CHANGELOG` record keyed by version — entries are `string[]`, one string per bullet |
| `gridConfig.ts` | `TILE_SIZE_STOPS`, `TileSizeKey`, `DEFAULT_TILE_SIZE`, `TILE_SIZE_STORAGE_KEY` — shared between deck and search grids |

### `src/types/`

| File | Responsibility |
|---|---|
| `index.ts` | `ScryfallCard`, `DeckCard` (extends ScryfallCard with `quantity`, `ownedQty`), `Deck` |

---

## State Ownership

### React Context (`useDeckManager`)

All deck data lives here. Persists to `localStorage` via `useEffect` watchers gated on `isMounted`.

| State | Type | Notes |
|---|---|---|
| `decks` | `Deck[]` | Full deck list; source of truth |
| `activeDeckId` | `string \| null` | Null = home screen |
| `deckViewMode` | `"main" \| "sideboard"` | Falls back to `"main"` if deck has no sideboard |
| `sortBy` / `sortDir` | `SortBy` / `SortDir` | Deck card sort preference |
| `showThumbnail` | `boolean` | Card preview toggle |
| `lastAddedId` | `string \| null` | Set by Sidebar on add; cleared by Workspace after scroll+highlight |
| `isMounted` | `boolean` | Guards localStorage writes; prevents SSR/client hydration mismatch |

### Page-Level State (`page.tsx`)

| State | Notes |
|---|---|
| `activeTab` | `"search" \| "decks"` — persists to `mtg-sidebar-active-tab` |
| `showSettings` / `settingsTab` | Settings overlay state — NOT auto-cleared by routing; any navigation must call `onCloseSettings?.()` |
| `sidebarFilters` | `FilterState` — persists to `mtg-sidebar-filters` |
| `tileSize` | `TileSizeKey` — persists to `mtg-tile-size`; shared by both grids |
| `activeChipId` / `activeChipQuery` | Active category chip |
| `toastMessage` | 2-second auto-dismiss toast |
| `pendingSearch` | Triggers a search in SearchWorkspace from Workspace (e.g. clicking a set code in CardModal) |

### localStorage Keys

| Key | Value | Owner |
|---|---|---|
| `mtg_builder_decks` | `JSON` array of `Deck[]` | `useDeckManager` |
| `mtg-active-deck` | deck id string | `useDeckManager` |
| `mtg-deck-view-mode` | `"main" \| "sideboard"` | `useDeckManager` |
| `mtg-sort-preference` | `{ by, dir }` JSON | `useDeckManager` |
| `mtg-show-thumbnail` | `"true" \| "false"` | `useDeckManager` |
| `mtg-sidebar-active-tab` | `"search" \| "decks"` | `page.tsx` |
| `mtg-sidebar-filters` | serialized `FilterState` | `page.tsx` / `FilterPanel` |
| `mtg-tile-size` | `"xs" \| "s" \| "m" \| "l" \| "xl"` | `page.tsx` / `gridConfig` |
| `mtg-search-filter-active-{deckId}` | `"true" \| "false"` — per-deck key; absent = false | `SearchWorkspace` |
| `mtg-search-sort-direction` | `"asc" \| "desc"` | `SearchWorkspace` |
| `mtg-theme` | `"zed-dark"` or absent (Warm Stone) | `SettingsView` / `layout.tsx` |
| `mtg-last-backup` | ISO 8601 timestamp of last backup | `SettingsView` |

---

## Data Flow

```
localStorage
    │
    ▼ (on mount, via migrateDecks)
DeckProvider (useDeckManager)
    │
    ├─▶ Sidebar → SidebarDecksTab  (read decks list, deck actions)
    │
    └─▶ page.tsx
            │
            ├─▶ Workspace  (activeDeck → VisualCard / ListCardTable)
            │       │
            │       └─▶ useDeckStats  (derived: totalCards, totalValue, remainingCost)
            │
            └─▶ SearchWorkspace  (reads activeDeck for format filter + commander color identity)
                        │
                        ├─▶ nlpParser  (query → tokens + scryfallQuery + remainder)
                        ├─▶ FilterPanel  (sidebar filters → buildSidebarFilterSyntax)
                        └─▶ scryfall.ts  (assembled query → ScryfallCard[])
```

**Card add flow:**
1. `SearchWorkspace` / `CardModal` calls `handleAddCard` (async) in Sidebar
2. Price rescue: if `prices.usd` is null or `"0.00"`, fetch a priced printing via `searchCards` with `order:usd` before adding
3. `updateActiveDeck` writes the new `DeckCard` into context
4. `setLastAddedId` triggers scroll+highlight in `Workspace`; `Workspace` clears `lastAddedId` after animation

**Import flow:**
`handleImportFile` (useDeckImportExport) → `pendingImport` state → `ImportModal` → `processImport("current" | "new")` → `updateActiveDeck` or `createNewDeck`

---

## Key Patterns

### Scryfall API

- Base URL: `https://api.scryfall.com` — `User-Agent` header required
- `searchCards` does **not** append `order:usd` by default; SearchWorkspace controls sort order via `SORT_ORDER_MAP`; price rescue uses a separate `order:usd` fetch in the add handler
- `$0.00` rescue: check `!prices.usd || prices.usd === "0.00"` — both null and zero-string need rescue
- Double-faced cards (DFC): `getCardPrintings` uses `!"frontFaceName"` name search instead of `oracle_id` (oracle_id misses single-face reprintings of DFCs)
- `lookupSetCode`: fetches `/sets` once, caches module-level in `setsCache`; scores matches by `queryWords.length / setWords.length` (higher = more specific)
- `backfillColorIdentity`: POST to `/cards/collection` in 75-card chunks; triggered lazily in Workspace when `activeDeck` switches to Commander format; fails silently

### Format Rules (`formatRules.ts`)

`getFormatRules(format)` is the single source of truth. Key differences:

| Rule | Freeform | Standard | Commander |
|---|---|---|---|
| Target size | none | 60 | 100 |
| Copy limit | 4 | 4 | 1 |
| Sideboard | allowed | 15 max | not allowed |
| Commander slot | no | no | yes |
| Color identity check | no | no | yes |
| Simulator green/yellow | 8% / 4% | 8% / 4% | 5% / 2% |

Copy limit exemptions: `type_line` contains `"Basic Land"` OR `oracle_text` contains `"A deck can have any number"`. Violations are **soft warnings** (highlight), never hard caps.

**Commander eligibility** (`isEligibleCommander`): `type_line` contains "Legendary" AND "Creature" — OR — `oracle_text` contains "can be your commander" — OR — Legendary Vehicle/Spacecraft with `power`/`toughness` defined. Falls back to `card_faces[0]` for reversible cards.

**Partner detection** (`getPartnerType`): checks `keywords` array first; falls back to `oracle_text` regex. Types: `'partner'`, `'partner-with'`, `'friends-forever'`, `null`. `canPartnerWith(a, b)` returns `{ valid, warning? }` — soft warning only, never blocks.

**Color identity**: union of all commanders' `color_identity` arrays — `[...new Set(commanderCards.flatMap(c => c.color_identity ?? []))]`.

### Search Query Assembly (SearchWorkspace)

Three parts joined by space, in this order:
1. **Format filter** — `legal:{format}` + commander color identity clause (when format filter badge is active)
2. **Chip or NLP** — active category chip query, or `parseSearchQuery(input).scryfallQuery`
3. **Sidebar filter syntax** — `buildSidebarFilterSyntax(sidebarFilters)`

**Set match**: debounced 500ms, fires when `parsed.remainder` has 2+ words; injects `e:CODE` into the query; guarded by `setMatch.query === parsed.remainder` to prevent stale injection.

### NLP Parser

`parseSearchQuery(input)` in `lib/nlpParser.ts` returns:
- `tokens` — matched NLP tokens with `matchedText` (used for chip removal via `query.replace(token.matchedText, '')`)
- `scryfallQuery` — assembled Scryfall syntax
- `remainder` — unmatched text passed through as a name/text search

### Commander Grouping (`Workspace`)

`groupCardsByType` prepends a `Commander` group when `format === "commander" && commanderIds?.length && deckViewMode === "main"`. All commander-designated cards route there instead of their type bucket.

### Settings Overlay Contract

Any navigation action (tab click, deck name click, home button) **must** call `onCloseSettings?.()`. `showSettings` is not auto-cleared by routing — silent failure causes the settings view to persist over other views.

### Data Migration

`migrateDecks()` runs on every load from localStorage:
- Converts `commanderId` (singular string) → `commanderIds` (string array) for pre-v1.16 saves
- Converts `isOwned` (boolean) → `ownedQty` (number) for pre-v1.0.6 saves
- Defaults missing `format` to `"freeform"`

### Design Token System

25 semantic CSS custom properties in `globals.css`, registered via `@theme inline` as Tailwind utilities.

**Dual palette:** Warm Stone (`:root` default), Zed Dark (`[data-theme="zed-dark"]`). Switch via `document.documentElement.dataset.theme`.

**Token categories:**
- `bg-surface-base/raised/overlay/backdrop/panel/panel-raised/deep/hover`
- `bg-input-surface`, `border-input-edge/edge-focus`, `text-input-value/placeholder`
- `text-content-primary/heading/secondary/tertiary/muted/faint/disabled`
- `border-line-default/subtle/panel/focus/hover`

**Naming rule:** `@theme inline` generates `[property-prefix]-[color-name]` — the color name must not repeat the prefix (e.g., `--color-content-*` → `text-content-*` ✓; `--color-text-*` would generate `text-text-*` ✗).

**Not tokenized:** opacity variants (`bg-neutral-800/50`), accent colors, `text-neutral-100`.

**Depth model:** Warm Stone sidebar is RAISED (panel lighter than base); Zed Dark sidebar is RECESSED (panel darker than base) — same token names, theme handles the difference.

### React Patterns

- `setCardRef(id)` — curried helper for card refs; inline `{ if(el) }` causes parse errors in JSX
- `duplicate ))}` bug — caused by stacked `.map()` closings; always verify one closing per map
- `table-fixed` on `ListCardTable` — prevents horizontal overflow
- Workspace scroll container uses `p-4 pb-20` (not `overflow-x-hidden`) — needed for tooltips, ring-offset, and badge overhang clearance
- `contentEditable` abandoned for deck name input — use `size={Math.max(10, name.length)}`

### Import/Export Formats

- **TCGPlayer:** `1 Memnite [BRO]` (qty + name + set code)
- **Card Kingdom:** `1 Memnite` (qty + name only)
- **Deck file sections:** `// Commander:`, `// Sideboard:` headers for round-trip fidelity
- Partner pairs export two `// Commander:` lines; import handles multiple `// Commander:` lines
