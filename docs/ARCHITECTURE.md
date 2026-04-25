<!-- Updated by Claude Code after each release. Last updated: v1.21.0 -->

# MTG Deck Builder — Architecture Reference

Living reference for file structure, state ownership, and key technical patterns. Updated after each release when components, state, or patterns change.

---

## Component Tree

### `src/app/`

| File | Responsibility |
|---|---|
| `layout.tsx` | Next.js root layout; wraps app in `DeckProvider`; inline `<script>` in `<head>` applies saved theme before first paint to prevent flash |
| `page.tsx` (Dashboard) | Top-level shell; owns settings open/tab state, tile size, toast, drag-drop handling, and import plumbing; decides which main-area panel renders (HomeScreen / Workspace / SettingsView) |

### `src/components/layout/`

| File | Responsibility |
|---|---|
| `Sidebar.tsx` | Outer shell; renders collapsed rail or expanded Decks tab content; manages collapsed/expanded state; enforces settings overlay close contract |
| `SidebarRail.tsx` | Collapsed 48px icon strip — decks, home, settings icons |
| `SidebarDecksTab.tsx` | Deck list with create/delete/format/sideboard/import/export/buy actions |
| `CardModal.tsx` | Full-screen card detail overlay; `context='deck'` (default) → "Confirm Art Swap" |
| `SampleHandModal.tsx` | Opening hand simulator — 7-card draw, mana curve histogram, draw odds per card; all commanders excluded from library |
| `FormatPicker.tsx` | Popover format selector (Freeform / Standard / Commander); opens downward or upward based on available space |
| `DropOverlay.tsx` | Full-viewport fixed overlay (`z-[9999]`); shown during URL drag-enter; pointer-events-none so it doesn't block the drag |

### `src/components/workspace/`

| File | Responsibility |
|---|---|
| `Workspace.tsx` | Active deck view; renders grid or list, sorts/groups cards, handles format-change dialog, triggers color identity backfill on Commander switch |
| `FindByNameBar.tsx` | Persistent find-by-name bar pinned above the deck workspace; autocomplete (150ms debounce, max 8 suggestions), card preview panel (art + printings strip + CardModal-style info), add to main/sideboard; overlay uses `z-[60]` stacking context on container, `z-[100]` on the preview overlay itself |
| `WorkspaceToolbar.tsx` | Two-row toolbar above deck (row 1: name + format badge; row 2: stats + view controls + sort) |
| `VisualCard.tsx` | Single grid tile; always-visible price badge (bottom-right, scales XS–XL); ownership badge at bottom-center animates to overlay-top on hover and becomes ✓ toggle (neutral/partial-green/full-green/warning-red); unified `[− owned +] / [− qty +]` row with progressive disclosure steppers; `tileSize` prop drives price badge sizing |
| `ListCardTable.tsx` | Table view; column order: Owned (circle ✓ toggle) | Qty (X/Y steppers) | Name | Type | Mana | Price | ×; `table-fixed` prevents horizontal overflow |
| `ImportModal.tsx` | Resolves a pending import into current deck or new deck |
| `TileSizeSlider.tsx` | Tile size snap slider popover (XS / S / M / L / XL) |
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

### `src/config/`

| File | Responsibility |
|---|---|
| `version.ts` | `APP_VERSION` string (bump each release); `CHANGELOG` record keyed by version — entries are `string[]`, one string per bullet |
| `gridConfig.ts` | `TILE_SIZE_STOPS`, `TileSizeKey`, `DEFAULT_TILE_SIZE`, `TILE_SIZE_STORAGE_KEY` — shared between deck and search grids |

### `src/types/`

| File | Responsibility |
|---|---|
| `index.ts` | `ScryfallCard`, `DeckCard` (extends ScryfallCard with `quantity`, `ownedQty`, `isOwned`), `Deck` |

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
| `showSettings` / `settingsTab` | Settings overlay state — NOT auto-cleared by routing; any navigation must call `onCloseSettings?.()` |
| `tileSize` | `TileSizeKey` — persists to `mtg-tile-size` |
| `toastMessage` / `toastAction` | Toast message + optional inline action (e.g. Undo); 2s plain, 4s undo variant |
| `isDragActive` / `dragDepthRef` | Drop overlay visibility; depth counter prevents flicker on child element drag-leave |

### localStorage Keys

| Key | Value | Owner |
|---|---|---|
| `mtg_builder_decks` | `JSON` array of `Deck[]` | `useDeckManager` |
| `mtg-active-deck` | deck id string | `useDeckManager` |
| `mtg-deck-view-mode` | `"main" \| "sideboard"` | `useDeckManager` |
| `mtg-sort-preference` | `{ by, dir }` JSON | `useDeckManager` |
| `mtg-show-thumbnail` | `"true" \| "false"` | `useDeckManager` |
| `mtg-tile-size` | `"xs" \| "s" \| "m" \| "l" \| "xl"` | `page.tsx` / `gridConfig` |
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
            └─▶ Workspace
                    │
                    ├─▶ FindByNameBar  (autocomplete → printings → add card)
                    │       └─▶ scryfall.ts  (autocompleteCards, searchCards, getCardPrintings)
                    │
                    ├─▶ WorkspaceToolbar  (deck name, format, sort, view controls)
                    │
                    ├─▶ VisualCard / ListCardTable  (deck cards)
                    │
                    └─▶ useDeckStats  (derived: totalCards, totalValue, remainingCost)
```

**Card add flow (FindByNameBar):**
1. User selects a suggestion → `searchCards(`!"name"`)` resolves canonical card → `getCardPrintings()` loads all variants
2. User picks a printing; clicks Add
3. Price rescue: if `prices.usd` is null or `"0.00"`, fetch `prices` only from a `searchCards` with `order:usd` result (only `prices` field is patched — art/set/image of the selected printing are preserved)
4. `updateActiveDeck` writes the new `DeckCard` into context
5. `setLastAddedId` triggers scroll+highlight in `Workspace`; `Workspace` clears `lastAddedId` after animation

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

### FindByNameBar

`autocompleteCards(query)` — fires after 150ms debounce when `query.length >= 2`; results capped at 8; used for name-only suggestions. On selection: `searchCards(`!"name"`)` → `getCardPrintings(name, oracle_id)` → variant strip.

Stacking context: the `FindByNameBar` container is `relative z-[60]`, which creates a stacking context at z=60. This beats `VisualCard`'s price badge (`z-[50]`) and hover roll-up (`z-20` via CSS transform). The preview overlay itself is `z-[100]` within that context.

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
