# Changelog

All notable changes to **MTG Deck Builder & Simulator** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.23.1] — Wheel-scroll regression fix + loading spinner

### Fixed
- **Mouse-wheel horizontal scroll** on the search-preview art strip — regressed under React 19 (`onWheel` registered as passive, so `e.preventDefault()` was silently ignored and the parent panel's `overflow-y-auto` swallowed the wheel event before the strip could scroll); restored via a window-level non-passive wheel listener delegated to `[data-art-strip]`

### Added
- **Loading spinner** on the search-preview panel and on the artist/set browse strip — `Loader2` icon centered over the existing skeleton placeholders so slow Scryfall queries get a clear in-flight indicator

---

## [1.23.0] — Card modal replacement

### Changed
- **Clicking a deck card** now opens FindByNameBar preview with that card's current printing pre-selected in the art strip — CardModal is gone
- **Art strip CTA**: shows `Swap art` in deck-entry mode (immediately updates the card's variant, no confirm step) and `+ Add` in search-entry mode
- **Art strip scroll**: on deck-entry open, the strip scrolls to the card's current printing so Thurgood sees exactly where he is before browsing

### Removed
- **CardModal** — deleted; all entry paths rewired through FindByNameBar preview

---

## [1.22.0] — Capture path

### Fixed
- **TCGPlayer URL drop**: dragging a product URL now resolves the exact printing the URL points to — product ID extracted from the URL path and passed to Scryfall `/cards/tcgplayer/:id`; falls back to the existing slug-based name resolution on 404

### Added
- **Text drag + paste capture**: paste (`Cmd/Ctrl+V`) or drag highlighted text anywhere into the app to capture a card or decklist
  - Single card name → opens FindByNameBar preview pre-populated with that card; set code hints (e.g. `[FIN]`) pre-select the matching printing in the art strip
  - Multi-line decklist (2+ quantity lines) → opens ImportModal; supports `3 Ba Sing Se`, `3 Ba Sing Se [TLA]`, and `// Commander:` headers
  - Paste is ignored while ImportModal or FindByNameBar preview is open, and while any text input is focused

---

## [1.21.6] — 2-column search preview + tile hover actions

### Changed
- **Preview panel**: large card image column removed — info panel is now the left column with more horizontal space; art strip fills the rest
- **Hover overlay on art tiles**: hovering any printing tile shows `+ Add` and `↔ Flip` (DFC cards only) buttons; clicking `+ Add` selects the tile and adds it to the deck
- **Flip in FindByNameBar**: active tile in the printings strip updates to back-face art when flipped; info column shows back-face oracle text, flavor text, and artist

---

## [1.21.5] — FindByNameBar focus polish

### Added
- **Workspace backdrop**: workspace dims and blurs behind the FindByNameBar when the autocomplete dropdown or preview panel is open — same `bg-surface-backdrop backdrop-blur-sm` treatment as CardModal; clicking the backdrop dismisses the bar entirely
- **Wheel-to-scroll on art strip**: mouse wheel scrolls the printings/browse strip horizontally when hovering over it; trackpad two-finger horizontal swipe passes through unaffected

---

## [1.21.4] — Prefix syntax in FindByNameBar

### Added
- **`a:` and `e:` prefix search**: typing `a:anna steinbauer` or `e:SLD` in the find-by-name bar suppresses name autocomplete and shows a single hint row — `Search artist "anna steinbauer" →` or `Search set SLD →`; clicking the row or pressing Enter fires the browse search; quotes around artist names are stripped automatically

---

## [1.21.3] — CardModal links to FindByNameBar browse

### Changed
- **CardModal artist/set links**: clicking artist or set in the CardModal Product Details now closes the modal and fires the corresponding browse search in FindByNameBar — same result as clicking those links in the preview panel

---

## [1.21.2] — Set Browse

### Added
- **Set browse in preview**: set code in the FindByNameBar Product Details section is now a tappable blue link — clicking it runs an `e:{setCode}` query and populates the right-column strip with all cards from that set; uses the same browse pattern as artist search

---

## [1.21.1] — Artist Search

### Added
- **Artist search in preview**: artist name in the FindByNameBar Product Details section is now a tappable blue link — clicking it runs an `a:"artist name"` query and populates the right-column strip with all cards by that artist; first result loads as the active card; the input bar updates to show the artist query

---

## [1.21.0] — Search as Find-by-Name

### Changed
- **Search rebuilt as find-by-name**: replaced search workspace with an inline bar at the top of the deck workspace — type a name, pick from autocomplete, choose art printing, add. No modal, no overlay, deck stays visible throughout.
- **Sidebar**: removed Search tab and category chips; sidebar now shows only the Decks tab
- **Discovery scaffolding removed**: NLP parser routing, sort/filter UI, view-mode toggle, and per-deck filter state cleared from active surface (nlpParser.ts stays, untouched)
- **Format warning pills**: legality, color-identity, and copy-limit warnings surface inline in the preview before you add — soft warnings, add always enabled
- **Sideboard-aware**: add button label changes to "+ Add to sideboard" when sideboard view is active
- **Stale localStorage keys cleaned up on mount**: `mtg-search-view-mode`, `mtg-search-sort-direction`, `mtg-sidebar-active-tab`, `mtg-sidebar-filters`, `mtg-search-filter-active` and per-deck variants

---

## [1.20.0] — Foundation Reset

### Changed
- **Product direction**: rebuilt PRODUCT.md and DECISIONS.md with full strategic context — audience, principles, rebuild strategy, and decision log
- **CLAUDE.md**: updated to reflect v1.20.0 direction; added engine-vs-surface rule and ownership clarification

---

## [1.19.3] — Project Brew Rename

### Changed
- **App name**: renamed throughout UI to "Project Brew" — browser tab title, Settings Hub header, About tab description, legal disclaimers (WotC Fan Content, Scryfall attribution), Support tab intro copy, and exported backup filename (`project-brew-backup-*.json`)
- Internal code name (`thebrewlab`) and backup JSON validation identifier unchanged for backward compatibility

---

## [1.19.2] — Tab Drop

### Added
- **TCGPlayer tab drop**: drag the address bar URL of any TCGPlayer product page onto the app to add the card instantly — works from any view (deck, search, home screen, settings, modal open)
- **Drop overlay**: full-viewport overlay appears on drag-enter to signal the drop zone; disappears on drop or drag-leave
- **Undo toast**: 4-second bottom-center toast with inline Undo button after a successful drop-add; Undo reverses the add (or deletes auto-created deck if dropped onto Home screen)
- **Auto-deck creation**: dropping onto the Home screen (no active deck) creates a new deck named `"{Card Name} Deck"` and sets it active
- **Set-aware resolution**: TCGPlayer set slug detected via `lookupSetCode` for a set-specific Scryfall printing; falls back to default printing when unrecognized
- **Treatment-suffix stripping**: variant suffixes in TCGPlayer slugs (`borderless`, `foil`, `showcase`, `extended art`, etc.) are stripped before name resolution so they don't corrupt the card name search
- **Fuzzy name fallback**: uses Scryfall's `/cards/named?fuzzy=` endpoint as a final fallback when exact name search returns nothing, handling article differences and minor name discrepancies

---

## [1.19.1] — Search List View Fixes

### Fixed
- **Hydration mismatch warning**: added `suppressHydrationWarning` to `<html>` in `layout.tsx` — pre-hydration theme script sets `data-theme` before React hydrates, causing an expected but noisy mismatch
- **Own column spacing**: widened Own column (`w-5 px-1` → `w-8 px-2`) so the green dot and Name text read as clearly separate columns

---

## [1.19.0] — Search List View

### Added
- **Search list view toggle**: grid/list view buttons in search toolbar; list view renders results as a color-tinted table (`SearchListTable`) with dedicated "Own" column (green dot), mana symbol rendering, hover-reveal + add button with tooltip, and cursor-follow thumbnail (controlled by Show Thumbnail preference)
- **`mtg-search-view-mode` localStorage key**: persists grid/list choice across sessions
- **`TileSizeSlider` disables in list mode**: visually dimmed with `opacity-30` and `pointer-events-none`

---

## [1.18.1] — Rail Tab Switch Without Expand

### Enhanced
- **Collapsed sidebar rail**: Search and Decks icon buttons now switch the workspace tab without expanding the sidebar — only the expand arrow and background click open the full panel

---

## [1.18.0] — Unified Qty/Owned Input

### Added
- **`isOwned` flag on DeckCard**: boolean tracks whether ownership is actively being counted for a card; separate from `ownedQty` (which retains its value when toggled off for easy re-activation)
- **Ownership toggle badge**: qty badge at bottom-center of grid tiles now animates to overlay-top on card hover and becomes a ✓ toggle — click to mark/unmark owned; badge colors reflect state (neutral / partial-green / full-green / warning-red)
- **Unified overlay number row**: single `[− owned +] / [− qty +]` row replaces separate stepper rows; each group's buttons reveal on hover (progressive disclosure); owned controls always enabled (incrementing from 0 auto-activates ownership)
- **List view ownership column**: circle ✓ toggle with 3 states (not-owned hidden at rest, partial dark-green, full solid-green); hover on any owned state → red warning for easy unmark

### Enhanced
- **Toggle retain behavior**: toggling owned off retains `ownedQty` so re-activation restores the prior count; only first-time activation (qty=0) fills to deck quantity
- **Warning badge**: grid tile badge shows neutral dark bg + red border + red number when any format violation exists (copy limit exceeded, commander color identity, singleton rule) — resolves green/red conflict when card is both owned and invalid
- **Remaining cost accuracy**: `useDeckStats` `remainingCost` and TCGPlayer/CardKingdom buy lists now use `isOwned ? ownedQty : 0` — toggling off ownership correctly restores the card's full cost to the "remaining to buy" total
- **Owned counter dimming**: when `isOwned=false`, the ownedQty number in the overlay and list view shows as disabled/dim even if the value is non-zero internally

### Technical
- `DeckCard.isOwned: boolean` added to `src/types/index.ts`
- `migrateDecks()` backfills `isOwned` from `ownedQty > 0` for existing decks; `isOwned: false` added to all new card construction sites in `SearchWorkspace.tsx` and `useDeckImportExport.tsx`
- `toggleIsOwned(cardId)` action in `useDeckManager`; `toggleSideboardIsOwned` mirrors the same logic in `Workspace.tsx`
- `updateOwnedQty` auto-sets `isOwned = newQty > 0` so stepper/inline-edit paths don't require a separate toggle

---

## [1.17.1] — Price Badge on Card Tiles

### Enhanced
- **Always-visible price badge**: both deck grid and search grid now show a persistent price pill in the bottom-right corner of every card tile — no hover required; fades out when the slide-up overlay is active
- **Tile-size scaling**: badge font size and padding scale across all five tile sizes (XS 9px → XL 13px) matching the card art proportions
- **No-price fallback**: cards without USD pricing show `—` at reduced opacity instead of hiding the badge
- **Deck overlay unified**: hover overlay in deck mode now shows card name and type line above qty controls — consistent with the search overlay
- **Search overlay simplified**: price line removed from search hover overlay (redundant with persistent badge)

### Technical
- `VisualCard`: new `tileSize?: TileSizeKey` prop; `PRICE_BADGE_SIZES` lookup table maps each stop to font/padding/position values; price pill uses inline styles for sub-pixel positioning outside the `overflow:hidden` clip boundary
- `Workspace.tsx` and `SearchWorkspace.tsx` both pass `tileSize` down to `VisualCard`

---

## [1.16.0] — Partner Commander Support

### Added
- **Partner Commander support**: Commander decks now support two commanders when both cards have compatible partner abilities — generic Partner, Partner With [named card], or Friends Forever
- **Partner detection**: `getPartnerType(card)` checks Scryfall `keywords` array first, falls back to `oracle_text` parsing for cards stored before this release; handles all three partner types
- **Partner validation**: `canPartnerWith(a, b)` validates all combinations — Partner+Partner ✓, Friends Forever+Friends Forever ✓, Partner With [name] + named partner ✓; incompatible pairings show a soft warning without blocking
- **Crown state machine**: crown tooltip context-sensitive — "Set as Commander" (replace) or "Set as Partner" (add as second slot) based on whether both the existing commander and hovered card have any partner ability
- **Red crown**: invalid partner pairings show a red crown badge on commander slot 2 in grid view (`bg-red-500`) and a red crown icon + amber `!` in list view; tooltip shows the specific incompatibility reason
- **Commander 1 always yellow**: only the partner (slot 2) can show red; slot 0 is always yellow

### Enhanced
- **Commander pinning**: both commanders pin to the top of card grid and list view; divider appears below both
- **Type grouping**: both commanders route to the "Commander" group when Group by Type is enabled
- **Color identity**: union of all commanders' color_identity arrays used for warnings and search filter `id<=` clause
- **Sample Hand Simulator**: all commanders excluded from library; library count reflects both exclusions
- **Import/Export**: exports two `// Commander:` lines for partner pairs; imports handle multiple `// Commander:` lines; backward compatible with single-commander files
- **Art swap**: swapping a commander's art correctly updates its entry in commanderIds

### Technical
- `Deck.commanderIds?: string[]` replaces `commanderId?: string` (max 2 entries); localStorage migration converts existing single-commander decks automatically on load
- `ScryfallCard.keywords?: string[]` added — Scryfall already returns this field, now typed
- `useDeckManager`: `setCommanderIds`, `addCommander`, `removeCommander`, `replaceCommander` replace `setCommanderId`; `removeCard` clears the card's commanderIds entry
- Partner helpers in `formatRules.ts`: `PartnerType`, `getPartnerType`, `getPartnerWithName`, `hasPartnerAbility`, `canPartnerWith`

---

## [1.14.0] — CardModal & Search Polish

### Added
- **CardModal fwd/back navigation** (#77): Prev/Next chevron buttons in search context navigate through the current results array; buttons hide when ≤1 result; keyboard arrow keys still work
- **Set code click** (#80): Set abbreviation in CardModal Product Details is clickable (blue, underline on hover); fires `e:{setCode}` search; works from both deck and search contexts; modal closes on click
- **Artist name click** (#81): Artist name in Product Details is clickable; fires `a:"artist name"` search; works from both deck and search contexts; row hidden when no artist field is present
- **Sort direction toggle**: asc/desc arrow button next to sort dropdown in search toolbar; mirrors deck view pattern; persists to `localStorage` (`mtg-search-sort-direction`); disabled at Relevance

### Also Shipped (pre-release polish)
- Search filter defaults: Price Any, Release Year All, format badge off by default
- Per-deck format badge persistence (`mtg-search-filter-active-{deckId}`) — new decks default OFF; existing decks respect saved preference; deck switches re-read per-deck key
- "Reset to defaults" button in sidebar filter panel — appears only when filters differ from defaults

### Fixed
- **Search loading spinner invisible**: `border-t-tertiary` is an unmapped token resolving to transparent; fixed to `border-t-blue-400` (same root cause as the CardModal spinner fix in v1.13.0)
- **Autocomplete dropdown opening on programmatic searches**: clicking set/artist set the query via state, triggering the autocomplete effect; suppressed with `suppressAutocompleteRef` flag for one cycle

### Technical
- `CardModal` — `onSearchQuery?: (query: string) => void` prop; clickable set/artist conditionally rendered when prop is present
- `SearchWorkspace` — `triggerSearch`/`onTriggerSearchConsumed` props for cross-context search triggers; `suppressAutocompleteRef` for autocomplete suppression; `SORT_ORDER_MAP` collapsed `price_asc`/`price_desc` into `price` + `dir:` clause
- `Workspace` — `onSearchQuery` prop threaded to CardModal
- `page.tsx` — `pendingSearch` state bridges deck-context set/artist clicks to SearchWorkspace query

---

## [1.13.0] — Commander Eligibility Fixes + Vehicle/Spacecraft Support

### Fixed
- **Reversible card commander eligibility**: Secret Lair display commanders (e.g. Atraxa, Praetors' Voice) failed `isEligibleCommander` because their `type_line` lives in `card_faces[0]`, not the root. `isEligibleCommander` now falls back to `card_faces[0].type_line` and `card_faces[0].oracle_text` for reversible cards.
- **Swap Art variant picker empty for reversible cards**: `getCardPrintings` used `oracle_id` lookup, which doesn't return results for reversible/Secret Lair layouts. Now uses Scryfall exact name search (`!"name"`) for DFCs and `oracle_id` for standard single-faced cards.
- **Swap Art loading spinner invisible**: spinner used `border-t-tertiary`, an unmapped token that resolved to transparent. Fixed to `border-t-blue-400`; spinner container changed to `h-48` with centered alignment.

### Added
- **Vehicle/Spacecraft commander support**: July 2025 rules update — legendary Vehicles and Spacecraft with defined P/T are now eligible commanders. `isEligibleCommander` checks `type_line` for `Vehicle` or `Spacecraft` alongside existing Legendary Creature and oracle text checks.
- **Interactive crown badge tooltip**: replaces the browser `title` attribute with a styled hover div. Shows "Set as Commander" for eligible creatures; adds a blue ⓘ info icon for eligible Vehicles/Spacecraft linking to the WotC Edge of Eternities mechanics article.
- **Tooltip dismiss delay**: 150ms timeout before hiding the tooltip — allows the mouse to travel from the crown badge to the ⓘ link without it disappearing. Applies to both grid view (VisualCard) and list view (ListCardTable).

### Technical
- `ScryfallCard` type extended with optional `power?: string` and `toughness?: string` fields
- `isVehicleOrSpacecraftCommander(card)` exported from `formatRules.ts` — used by VisualCard and ListCardTable to conditionally render the ⓘ link
- `getCardPrintings` signature updated to `(cardName: string, oracleId: string)` — DFC detection via `cardName.includes(' // ')`

---

## [1.12.5] — Hotfix: Home Screen & Settings Navigation

### Fixed
- **Home button from settings (prohibition cursor)**: `isOnHomeScreen` was `!activeDeck` — when settings is open over the home screen, `activeDeck` is null so the button was disabled. Now `isOnHomeScreen = !activeDeck && !showSettings`, so the button stays active when settings is the overlay.
- **Home button from settings (does nothing)**: `onGoHome` only called `setActiveDeckId(null)` without clearing `showSettings`. Settings view persisted because `showSettings ? <SettingsView>` guards before the `!activeDeck` routing check. `onGoHome` now also calls `setShowSettings(false)`.
- **Deck cover card count**: card count on home screen showed unique entry count (`cards.length`) instead of total quantity. Now sums `card.quantity` across all entries.
- **Deck click doesn't close settings**: clicking a deck name or the sideboard icon in the Decks tab while settings is open now calls `onCloseSettings` — settings closes and the deck view renders immediately without requiring a manual tab click first.

### Technical
- `DeckCoverCard` and `HomeScreen` local `Deck` interface: `cards` narrowed from `unknown[]` to `{ quantity: number }[]`
- `SidebarDecksTab` receives `onCloseSettings?: () => void` from `Sidebar` and calls it on deck selection and sideboard activation
- Settings overlay contract documented in CLAUDE.md Key Technical Notes

---

## [1.12.4] — Home Screen & Empty State

### Added
- **Home screen** (`HomeScreen.tsx`): app opens to a welcome screen on first visit or after navigating home — heading "What are you brewing?", rotating tagline, deck cover cards, and a ghost deck card for creating a new deck
- **Rotating taglines**: 13 taglines in `src/config/taglines.ts`, chosen randomly per session via `useHomeTagline` hook (sessionStorage-backed — same tagline on refresh, new one per session)
- **Deck cover cards** (`DeckCoverCard.tsx`): each saved deck appears as a card tile with a deterministic gradient tint derived from the deck name; click to open directly
- **Ghost deck card** (`GhostDeckCard.tsx`): dashed card tile on the home screen opens the FormatPicker to create a new deck
- **Ghost card in empty workspace**: empty deck shows a dashed card-shaped ghost tile in the grid at current tile size — click triggers the search takeover
- **Search takeover** (`SearchTakeover.tsx`): empty-deck-aware search entry point — heading "What are you building with?", autofocused input field, quick-tag buttons (Ramp, Removal, Card Draw, Wipes, Tokens, Creatures, Burn, Lands); opens when ghost card is clicked; dismisses on query submit or tag select, firing the search immediately
- **Home icon** in expanded sidebar footer (left of version badge) and collapsed rail (below Settings icon) — dimmed/non-interactive when already on home screen

### Changed
- **Sidebar "New Deck"**: text button replaced with a dashed ghost slot (`border-dashed border-line-default`); same FormatPicker behaviour, quieter visual presence
- **Page title**: browser tab title updated from "MTG Deck Builder" to "TheBrewLab"
- **`useDeckManager`**: removed auto-create on first load and last-deck delete — both now set `activeDeck` to null, routing to the home screen instead of a blank Untitled deck

### Technical
- `src/config/taglines.ts` — 13 tagline strings, editable
- `src/hooks/useHomeTagline.ts` — sessionStorage-backed random tagline hook
- `src/components/home/` — new directory: `HomeScreen.tsx`, `DeckCoverCard.tsx`, `GhostDeckCard.tsx`
- `src/components/workspace/SearchTakeover.tsx` — new search entry component
- `page.tsx` — `!activeDeck` routing condition gates home screen vs workspace; `showSearchTakeover` state wired through to `SearchWorkspace`
- `Sidebar.tsx` + `SidebarRail.tsx` — `onGoHome` / `isOnHomeScreen` props forwarded from `page.tsx`

---

## [1.12.3] — Hotfix: The Brew Lab Rename

### Fixed
- Renamed "TheBrewLab" → "The Brew Lab" throughout Settings Hub: header title, About description, legal disclaimers (WotC Fan Content, Scryfall attribution), and Support tab intro copy
- About description rewritten: adds project name inline, expands purpose to include "teaching, learning, and experimentation"
- Team monogram updated: `"P"` → `"PT"` to represent Phi & Thurgood together

---

## [1.12.2] — Sidebar Tabs + Search Sort Fix

### Fixed
- **Sidebar tab bar** restyled with a seamless physical tab metaphor: active tab uses `bg-surface-panel` with a transparent bottom border so it blends into the sidebar body; inactive tab uses `bg-surface-deep` with a visible bottom edge, sitting recessed below the active tab; blue underline indicator bar removed
- Inactive tab hover lifts background to `bg-surface-panel` and brightens text — provides affordance without the full active treatment
- Collapse button (desktop) and mobile gear icon gain `bg-surface-deep border-b border-line-subtle` to match the recessed tab row
- **Search sort dropdown** now functional — selecting Name, Price ↑, Price ↓, Mana Value, or Color re-fetches results with the correct Scryfall `order:` clause; Relevance omits the clause for natural Scryfall ranking; default is Price ↓

### Technical
- `searchCards` in `scryfall.ts` no longer hardcodes `order:usd`; sort is now fully caller-controlled
- `SearchWorkspace` adds `SORT_ORDER_MAP` constant and `sortOrder` state; sort clause appended to `scryfallQuery` useMemo
- Price rescue in `handleAdd` explicitly appends `order:usd` to preserve priced-printing preference independent of the active sort

---

## [1.12.1] — Search Toolbar Polish

### Changed
- Search toolbar rows now match the deck toolbar's height rhythm: `pt-4 pb-3 gap-2` wrapper aligns the divider to the same Y position as the deck view on tab switch
- Search bar taller: inner container min-height raised from 32px to 40px to fill the matched Row 1 height
- Search Row 2 controls bumped from `h-7` to `h-8` to match deck toolbar control height
- Search toolbar Row 2 controls grouped into a single pill container matching the deck toolbar's `bg-surface-base border border-line-subtle rounded-lg shadow-sm` style — sort select, tile slider, and view toggles unified in one group

---

## [1.12.0] — Settings Hub

### Added
- **Settings Hub** (`SettingsView.tsx`): full workspace-takeover settings view — replaces the sidebar footer accordions. Opens from the version badge (→ What's New tab), collapsed rail gear icon (→ Preferences tab), or mobile gear in the sidebar tab bar (→ Preferences tab). Back chevron and Escape close the hub.
- **Preferences tab**: Card Preview toggle (existing) + Theme picker — select Warm Stone or Zed Dark theme via gradient swatches; persists to `localStorage` key `mtg-theme`; future placeholder block for upcoming preferences
- **What's New tab**: last 5 changelog versions; current version gets a blue pill badge
- **About tab**: project intro paragraph, Team (Phi & Thurgood Nguyen, Claude · Anthropic), Powered By (Scryfall, Next.js + Vercel, Tailwind CSS), Legal disclaimers (WotC Fan Content, Scryfall attribution, trademark notice)
- **Support tab**: Buy Me a Coffee and GitHub external links; future placeholder block
- **Theme no-flash init**: inline `<script>` in `layout.tsx` `<head>` reads `mtg-theme` from localStorage and applies `data-theme` before first render

### Changed
- Sidebar expanded footer simplified to version badge only — clicking opens Settings Hub → What's New tab
- Coffee icon and gear icon removed from expanded sidebar footer; coffee stays in collapsed rail
- Collapsed rail gear icon now opens Settings Hub (Preferences tab) directly — sidebar stays collapsed
- Mobile sidebar tab bar gains a gear icon (right-aligned); clicking any Search/Decks tab while settings is open closes the hub and returns to deck view

### Removed
- Sidebar settings accordion (Card Preview toggle, Sort By, Sort Direction)
- Sidebar changelog accordion (inline What's New)
- `isSettingsOpen`, `isChangelogOpen` state from Sidebar.tsx
- Sort controls from settings (Sort By + Sort Direction live in WorkspaceToolbar only)

---

## [1.11.1] — Focus Ring Polish

### Changed
- Focus ring color muted in Warm Stone palette: `--input-edge-focus` and `--border-line-focus` changed from `#c07a50` (bright copper) to `#a0725c` (darker, less visually heavy) — Zed Dark focus ring (`#528bff`) unchanged

---

## [1.11.0] — Dual-Palette Theme System

### Added
- Dual-palette system: **Warm Stone** (default, `:root`) with brown undertones and copper accents; **Zed Dark** alt-theme (`[data-theme="zed-dark"]`) with blue-gray tones and blue accents — switch via `document.documentElement.dataset.theme`, no UI toggle yet
- Token count expanded from 12 to 25 — new categories: sidebar panel surfaces (`bg-surface-panel`, `bg-surface-panel-raised`, `border-line-panel`), input field tokens (`bg-input-surface`, `border-input-edge`, `border-input-edge-focus`, `text-input-value`, `text-input-placeholder`), focus/hover borders (`border-line-focus`, `border-line-hover`), and resolved flagged classes (`text-content-disabled`, `bg-surface-deep`, `bg-surface-hover`)

### Changed
- Sidebar panel depth: Warm Stone sidebar is **raised** (lighter than workspace background); Zed Dark sidebar is **recessed** (darker than workspace background) — same token names, palette drives the difference
- Input fields migrated to dedicated raised tokens across search bar, filter panel, workspace toolbar name input — inputs sit above their parent surface in both themes
- All v1.10.0 flagged mid-tone classes resolved: `text-neutral-700` → `text-content-disabled`, `bg-neutral-950` → `bg-surface-deep`, `hover:bg-neutral-600` → `hover:bg-surface-hover`, `border-neutral-600` → `border-line-hover`, `focus-within:border-neutral-600` → `focus-within:border-input-edge-focus`

### Not tokenized (intentional)
- Opacity variants (`bg-neutral-800/50`, `border-neutral-700/50`, etc.) — unchanged
- Accent colors (blue, red, green, yellow, amber) — remain as raw Tailwind
- `text-neutral-100` — no lighter-than-primary token defined yet
- `ring-offset-neutral-950` (highlight ring offsets in Workspace), `focus:border-neutral-500` (FilterPanel input focus) — contextual states not in migration map

---

## [1.10.0] — Design Token System

### Added
- 12 semantic CSS custom properties in `globals.css` `:root` block — surfaces (`surface-base/raised/overlay/backdrop`), text content (`text-primary/heading/secondary/tertiary/muted/faint`), and borders (`border-line-default/line-subtle`)
- All tokens registered via Tailwind v4 `@theme inline` as utility classes: `bg-surface-*`, `text-content-*`, `border-line-*`

### Changed
- All hardcoded `bg-neutral-*`, `text-neutral-*`, and `border-neutral-*` classes replaced with semantic token utilities across 17 files — changing a theme color now requires editing one place in `globals.css`
- Token naming follows Tailwind v4 `@theme inline` rule: `--color-X` generates `[prefix]-X` (not doubled) — text tokens use `--color-content-*`, border tokens use `--color-line-*`

### Not tokenized (intentional)
- Opacity variants (e.g. `bg-neutral-800/50`) — Tailwind v4 doesn't support opacity-modified tokens in `@theme inline`
- Accent colors (blue, red, green, yellow, amber) — remain as raw Tailwind
- Mid-tone flagged classes (`text-neutral-700`, `bg-neutral-950`, `border-neutral-600`, `hover:bg-neutral-600`) — contextual states with no direct token mapping

---

## [1.9.0] — Release Year Filter + CardModal Release Date

### Added
- Release year filter in the sidebar filter panel — dual text inputs (year from / to) with three quick-select presets: "This Year", "Last 5 Yrs" (default), and "All"; active by default showing the past 5 years
- Year filter injects `year>=` / `year<=` Scryfall clauses only when the range is meaningfully constrained; "All" (1993–current year) produces no syntax
- CardModal Product Details: "Released" date row added below Price, showing the printing's Scryfall release date (YYYY-MM-DD)
- Year filter persists to `mtg-sidebar-filters` localStorage key alongside all other filter state; old saved state without year fields falls back to defaults gracefully

---

## [1.8.4] — Hydration Fix for Filter Persistence

### Fixed
- Resolved Next.js hydration mismatch caused by reading localStorage in a lazy `useState` initializer — server rendered with defaults while client hydrated with stored values; now uses the mount-effect pattern (same as tile size) so server and client always agree on first render

---

## [1.8.3] — Slider Polish + Filter Persistence

### Changed
- Tile size slider thumb restyled to match price slider graphic language — white fill, blue border, neutral drop shadow (was blue fill with blue glow)
- Price slider thumb now shows grab/grabbing cursor during drag

### Added
- Filter state (price, anyPrice, rarities, types, colors) persists to localStorage (`mtg-sidebar-filters`) and is restored on page refresh

---

## [1.8.2] — Price Filter UX Fixes

### Fixed
- Default $100 price ceiling now correctly filters out cards over $100 — removed an incorrect `< 100` guard in `buildSidebarFilterSyntax` that caused the `usd<=` clause to never be appended at the default value
- Price inputs now auto-select all text on focus — no more manual cursor positioning
- Price inputs accept free-form editing — `$` sign is a static label; validation and clamping are deferred to blur/Enter so intermediate states (empty field, partial number) are allowed while typing
- Price range slider upgraded from click-only to drag — includes a drag dot at the max handle position, the max price input updates live during drag, and the value commits on mouse release

---

## [1.8.1] — Deck Rename Jitter Fix

### Fixed
- Deck name input no longer shifts/jitters on each keystroke when renaming — replaced hidden-span JS measurement with CSS `field-sizing: content` so the browser natively auto-sizes the input to its value with no double-render (#73)

---

## [1.8.0] — Tile Size Parity + Snap Slider

### Added
- Tile size snap slider: new toolbar control in both deck and search views — 5 presets (XS / S / M / L / XL) accessed via a vertical popover slider with drag-to-snap, click-to-jump interaction, and card-shape visual hints at top and bottom
- `gridConfig.ts`: shared tile size configuration consumed by both grid views — single source of truth for `minWidth`, `gap`, stop keys, default, and localStorage key

### Changed
- Deck grid and search grid now use identical `repeat(auto-fill, minmax(...px, 1fr))` layout driven by `gridConfig.ts` — tile sizes are fully unified across views
- Tile size persists to localStorage (`mtg-tile-size`) and is shared across both views: changing the slider in deck view is reflected immediately in search view and vice versa
- Deck view outer wrapper padding reduced from `md:p-8` to `p-4` — aligns effective grid width with search view for consistent column counts at all size stops
- Default tile size (M) targets ~8 columns at 1920px with sidebar expanded; XL targets ~4 columns; XS targets ~12 columns

---

## [1.7.0] — Search Polish + Commander Fixes

### Fixed
- Planeswalker commander eligibility: `isEligibleCommander` now requires `Legendary` AND `Creature` in `type_line` — Legendary Planeswalkers no longer qualify unless oracle text contains "can be your commander"

### Added
- Natural language set name search: type "jaws secret lair" or "The Brothers War" — the app fuzzy-matches against all Scryfall sets (cached after first fetch) and injects `e:CODE` into the search query; a "Set: [name] ×" chip appears in the results toolbar
- `set:CODE` NLP passthrough token: users who know set codes can type `set:BRO` directly as an alternative to the natural language lookup
- Discard archetype NLP token: typing "discard" maps to `o:"discard"` Scryfall syntax
- CardModal Swap Art tab: loading spinner shown while printings are fetching
- CardModal (search context): modal stays open after clicking "+ Add to Deck" and returns to Details tab — matches deck view Confirm Art Swap behavior
- Group by type — Commander floats to top: when Group by Type is on in Commander format, the designated commander card appears in its own "Commander" group above the type buckets
- Search view in-deck green dot: tooltip "Already in deck" on hover
- Filter panel All/None toggle: each filter group (Rarity, Card Type, Colors) gets an inline All/None button that selects or clears the whole group in one click
- Color filter chip tints: active color chips use per-color styling — W stone, U blue, B dark-neutral, R red, G green, C gray
- Price filter "Any" toggle: enabling "Any" removes price ceiling entirely and dims the slider; disabling restores the slider-based filter

---

## [1.6.0] — Search Overhaul

### Added
- Two-tab app architecture: Search tab opens a full-width card grid workspace; Decks tab shows the deck builder. Both tabs always mounted — state persists across switches.
- NLP search parser with ~30 natural language patterns: colors ("black", "blue"), types ("creatures", "instants"), keywords ("flying", "trample"), price ("under $2", "budget"), CMC ("under 3 mana"), archetypes ("ramp", "removal", "counterspells", "wipes"), and rarity. Matched tokens appear as removable chips inline in the search bar.
- Context-aware filter badge: auto-filters by active deck's format legality (`legal:commander`, `legal:standard`) and commander color identity (`id<=WUB`). Badge colors are format-specific — Commander gold, Standard blue, Freeform neutral. Toggle on/off by clicking the badge.
- Autocomplete dropdown: Scryfall card name suggestions appear after 2 characters typed; cards already in the active deck show a green indicator dot; Escape or Enter closes the dropdown.
- Category chips in sidebar Search tab: format-relevant quick-search shortcuts (Ramp, Removal, Card Draw, Wipes, Tokens, Creatures — plus Counters/Tutors/Lands for Commander, Burn for Standard/Freeform). Clicking a chip fires a prebuilt Scryfall query; clicking again deactivates it.
- Sidebar filter controls: price range (text inputs + visual bar), rarity toggles (Common/Uncommon/Rare/Mythic), card type toggles (7 types), color toggles (6 colors with mana pip icons). All combine live into the Scryfall query. Default state (all on) appends no extra syntax.
- Search results in-deck indicator: cards already in the active deck show a green dot and 40% opacity dim.
- CardModal context-aware action button: opened from search shows "+ Add to Deck" (blue, always active, adds current or Swap Art–selected variant printing and closes modal); opened from deck view shows "Confirm Art Swap" (existing behavior, unchanged).
- Toast notification on add from search: "Added {name} to {deck}"; duplicate adds show "(×N)" count. Auto-dismisses after 2s; rapid adds replace the previous toast.

---

## [1.5.4] — UX Polish & List Performance

### Changed
- Delete Deck and Delete Sideboard in the sidebar dropdown no longer show a second confirmation dialog — clicking the action executes immediately
- Owned −/+ increment buttons added to list view alongside the X/Y owned display — hover-visible, matching the qty button pattern; owned column widened to fit
- Owned −/+ increment buttons added to grid view hover overlay — flanking the owned counter in the slide-up panel, matching the qty row above
- List view hover performance improved: mouse movement no longer triggers full Workspace re-renders — tooltip repositions via direct DOM update instead of setState, eliminating per-frame row color recalculations

---

## [1.5.3] — Warning Color Consistency

### Changed
- Format violation warning bar (grid hover overlay) color updated from amber to red — background `rgba(239,68,68,0.15)`, border `rgba(239,68,68,0.3)`, text and icon `#f87171`
- Grid qty pill badge warning state updated from amber (`bg-orange-900 text-orange-400`) to red (`bg-red-900 text-red-400`)
- List view warning triangle icon updated from amber (`#f59e0b`) to red (`#f87171`) to match grid
- Qty number color logic simplified across both views: green when fully owned, red when over copy limit, gray otherwise — at-copy-limit no longer applies a special color to the qty number

---

## [1.5.2] — Toolbar Layout & Grid Spacing Polish

### Changed
- Workspace toolbar split into two rows: row 1 is deck name + format badge pill only; row 2 is stats and all controls — eliminates name truncation and button crowding on long deck names
- Deck name input now auto-sizes to exact rendered text width using a hidden measurer span — format badge sits immediately after the last character with no visible gap regardless of font rendering
- Deck name size increased to `text-3xl` for visual emphasis as a heading
- Grid view gap increased from `gap-3` to `gap-x-5 gap-y-7` — provides clearance so qty pill badge (`-bottom-2`, 8px overhang) and crown badge (`-top-3.5 -left-3.5`, 14px overhang) no longer encroach on adjacent cards

---

## [1.5.1] — Grid Warning Redesign

### Changed
- Grid view warning indicator replaced: corner triangle badge (top-right, straddling card edge) removed; amber warning bar now appears at the top of the slide-up hover overlay with ⚠ icon and warning text — clearly scoped to the card and always readable
- Color identity warning text simplified: "Outside commander's color identity (has {G})" → "Outside commander's color identity" — removes abstract mana symbol notation from the warning message

---

## [1.5.0] — Grid Polish + Bug Fixes

### Fixed
- FormatPicker popover now opens downward when more room exists below the trigger, and upward when near the bottom of the viewport — applies to all three trigger points: `+ New Deck` button, sidebar deck row format badge, and toolbar format badge pill
- Collapsed sidebar rail `+` icon now opens a FormatPicker popover positioned to the right of the icon instead of immediately creating a deck — deck is only created after format selection; Escape or click-outside cancels without creating a deck
- Commander eligibility check hardened from soft warning to full block — cards without `"Legendary"` in `type_line` and without `"can be your commander"` in `oracle_text` cannot be designated as commander; click is a no-op in both list view and grid view; tooltip now reads "Must be Legendary to set as Commander"

### Added
- Grid view crown badge is now an interactive commander toggle — replaces the `"Set as Commander"` / `"Commander ✓"` text button that previously lived inside the hover overlay
- Commander format: all non-commander cards show a dim gray crown badge on card hover; eligible (Legendary) cards light up gold on crown hover with `pointer` cursor and a scale affordance; ineligible cards stay dim gray with `not-allowed` cursor and no color change
- Active commander crown badge: always visible, solid yellow circle (`bg-yellow-500`), scales on hover; clicking deselects the commander designation
- Persistent qty pill badge on every grid tile: circular `w-6 h-6` badge at bottom center straddling the card edge (`-bottom-2`); green (`bg-green-800 / text-green-400`) when fully owned, amber (`bg-orange-900 / text-orange-400`) when at copy-limit warning, neutral (`bg-neutral-900 / text-neutral-400`) otherwise; fades out (`opacity-0`) when the hover overlay slides up

---

## [1.4.1] — Grid Badge Polish

### Fixed
- Warning badge in grid view redesigned: filled amber triangle (raw SVG) replaces filled amber circle — amber body with no stroke outline, white `!` line and dot rendered as separate SVG paths for full control
- Warning badge repositioned from top-left to top-right corner in grid view (was stacked below crown in the same flex-col)
- Crown badge in grid view now renders as a simple positioned `div` at top-left — flex-col wrapper removed since warning no longer shares that corner
- Crown SVG inside the badge bumped from 16×16 to 18×18 (better fill inside the `w-7 h-7` circle)
- × remove button moved from straddling the corner edge (`-top-3 -right-3`, outside the overflow-hidden wrapper) to inset inside the card art (`top-1.5 right-1.5`, clipped by `rounded-xl`)
- List view warning icon updated to matching raw SVG triangle (16×16) for consistency with grid view

---

## [1.4.0] — Standard & Commander Format Support

### Added
- Deck format system: per-deck format field (`"freeform"` | `"standard"` | `"commander"`) with centralized `formatRules.ts` rules engine (`getFormatRules`, `getCardWarnings`, `isEligibleCommander`)
- Commander support: designate a commander card per deck; color identity validation, singleton enforcement (soft warning), copy limit threshold set to 2 for Commander
- Format picker popover (`FormatPicker.tsx`): shared component accessible from sidebar badge click, toolbar badge click, and "+ New Deck" button
- Format badges in sidebar deck rows: "STD" (blue) for Standard, "CMD" (yellow) for Commander, "FF" (neutral) for Freeform — all clickable to open format picker
- Format badge pill in workspace toolbar: "Standard" (blue), "Commander" (yellow), "Freeform" (neutral) — all clickable to open format picker
- Commander visual treatment — grid view: yellow crown badge (w-7 h-7, bg-yellow-500) on designated commander card; crown button in hover overlay to designate/remove
- Commander visual treatment — list view: persistent filled crown icon before name on commander row; hover-only outline crown on all other rows (clickable to designate)
- Warning badge system: filled amber circle with white `!` on cards with format violations (legality, color identity, copy limit) — rendered identically in grid view (top-left) and list view (after name); combined tooltip shows all warnings
- Commander card pinning: always first in grid and list regardless of sort, with an `h-3` spacer row below (matches sort group separator pattern)
- Sideboard-to-Commander confirmation dialog: when switching to Commander with sideboard cards, prompts "Merge into Main Deck" or "Delete Sideboard"; Escape key closes without making changes
- Format-aware Opening Hand Simulator: probability thresholds recalibrated per format — 8%/4% (Freeform/Standard), 5%/2% (Commander); commander card excluded from library and Draw Odds list when `commanderId` is set
- `color_identity` field on `ScryfallCard`; lazy backfill via Scryfall `/cards/collection` triggered when active deck switches to Commander format
- Import/export format metadata: `// Format:` and `// Commander:` comment headers on Standard/Commander exports; parsed on import for full round-trip fidelity
- Format-aware deck stats: `targetDeckSize`, `isAtTarget`, `isOverTarget` returned from `useDeckStats`

### Changed
- Sidebar expanded width: 240px → 256px
- Sidebar layers icon grayed out (always rendered, not hidden) and disabled for Commander decks
- Main/Side pill toggle hidden entirely for Commander decks (Commander has no sideboard)
- Card count colors in toolbar now format-aware: green at target (60 for Freeform/Standard, 100 for Commander), red above target
- Sideboard count shows "Side: X / 15" with red-above-15 indicator for Standard; Freeform retains existing plain display
- List view column order reordered: `[−qty+] [Owned] [Name] [Type] [Mana] [Price] [×]`
- List view Owned column simplified to `X/Y` inline-editable text only (checkbox, minus/plus stepper, and progress bar removed)
- Qty column `−/+` buttons in list view use new `w-5 h-5 rounded-full` style, hover-only visibility (always visible for commander row)
- Copy limit soft-warning threshold is now format-aware: 5 (Freeform/Standard) or 2 (Commander singleton)
- New deck creation always prompts for format selection via FormatPicker popover

**Closes #17**

---

## [1.3.2] — UI Polish: Sidebar Rail, Pricing, Deck Name Dedup, Grid Tile

### Changed
- Grid view card tiles no longer show an always-visible qty badge at rest. The tile at rest displays only card art. Qty controls remain fully accessible in the hover overlay.
- Value and To Buy stats in the workspace toolbar now show a combined main + sideboard total (with a muted `(M+S)` label) when the active deck has a sideboard enabled.
- Collapsed sidebar rail now has a `PanelLeftOpen` icon at the top as a dedicated expand control. Clicking anywhere on the rail background also expands to the last active tab.
- Expanded sidebar collapse button changed from `ChevronLeft` (`‹`) to `PanelRightOpen` for visual clarity.
- Version badge in sidebar footer now toggles an inline changelog section instead of a browser alert popup.
- Buy link buttons (TCGPlayer, Card Kingdom) in the sidebar actions strip now use `text-[10px]` so "Card Kingdom" fits on one line at 240px sidebar width.

### Fixed
- Creating a new deck when a deck with the same name exists no longer produces malformed names. Auto-appends `(2)`, `(3)`, etc. starting at 2. Untitled decks follow the same rule: first stays unnamed, subsequent get `Untitled (2)`, `Untitled (3)`, etc.
- Import "Create New Deck" now uses the same deduplication rule — appends `(2)`, `(3)` if the filename conflicts with an existing deck name.
- Card Kingdom button text wrapping in sidebar actions strip fixed via reduced font size. Closes #58.

### Added
- Collapsed sidebar rail: hovering any icon shows a right-positioned tooltip (Expand Sidebar, Search, Decks, New Deck, Buy Me a Coffee, Settings).
- Collapsed sidebar rail: `Plus` icon between Decks and spacer creates a new deck without expanding the sidebar.

---

## [1.3.1] — Hot Fix: Badge Readability, Overlay Color, Toolbar Overflow, Mana Symbols

### Fixed
- Grid view qty badge and × remove button now use solid backgrounds (`bg-neutral-900`, `bg-green-600`, `bg-red-600`) instead of semi-transparent overlays — always readable regardless of card art.
- Grid view overlay qty number now reflects copy-limit color logic: green at exactly 4 copies, red at 5+, white otherwise. Exempt cards (Basic Lands, "any number" cards) always show white.
- Deck name input in workspace toolbar now caps at 200px and truncates with ellipsis when not focused, preventing long names from pushing stats and controls off-screen.
- Search result mana symbols updated to spec color palette: W warm gold, U blue with dark text, B dark neutral, R red with light text, G green with light text, colorless/generic neutral gray. Double-faced cards fall back to first face mana cost.

---

## [1.3.0] — Sidebar Redesign + Grid View Overlay

### Added
- Collapsible sidebar with Search/Decks tab system. Sidebar collapses to a 48px icon rail via `‹` chevron in the tab bar; click Search or Decks icon on the rail to re-expand to the correct tab. Expanded width 240px, collapsed 48px, smooth 300ms cubic-bezier transition. Collapse state and active tab persist to localStorage (`mtg-sidebar-collapsed`, `mtg-sidebar-active-tab`).
- Search tab: clear button (×) inside the search input — clears query and instantly restores cached category results with no re-fetch. Inline mana cost symbols on each result row (colored circles: W cream, U blue, B dark, R red, G green, numerics gray). Circular `+` button on hover replaces the old rectangular badge.
- Decks tab: full deck management panel — deck list rows with active indicator, card count, Layers icon (creates/switches sideboard), hover-only × icon with absolute-positioned delete dropdown ("Delete Deck" always, "Delete Sideboard" conditional). Import/Export buttons and TCGPlayer/Card Kingdom buy links moved here from workspace toolbar.
- Grid view hover overlay: hovering a card tile reveals a slide-up frosted-glass overlay from the bottom (`bg-black/75 backdrop-blur-sm`) with circular `−` qty `+` controls and an `Owned: X/Y` inline-editable counter. Circular × remove button at top-right, also hover-revealed.
- Grid view qty badge: always-visible circular badge at top-left of each tile. Color-coded: gray ≤ 3 copies, green at exactly 4 (at limit), red at 5+ (over limit). Replaces the old separate 4-copy warning badge.

### Changed
- Workspace toolbar slimmed from three rows to a single row. Left side: deck name input + card count + value + to buy. Right side: Simulator button + Main/Side pill + sort/group/view controls. Deck dropdown, import/export buttons, and buy links removed from toolbar.
- Grid card tiles redesigned: card art fills the entire tile. Always-visible bottom bar with `− qty +` controls, progress bar, owned stepper, and checkbox removed. Default state shows only the circular qty badge.
- `useDeckImportExport` lifted to `page.tsx` (common parent of sidebar and workspace) so import/export callbacks can be shared across sibling components without duplication.
- "Test Deck" simulator button renamed to "Simulator".

### Removed
- `DeckDropdown.tsx` retired — functionality absorbed into `SidebarDecksTab.tsx`.
- GitHub icon removed from sidebar footer.
- Expand/collapse chevron removed from sidebar footer (moved to tab bar).
- Grid view ownership progress bar removed from default tile view (ownership visible in hover overlay).
- Grid view "mark owned" checkbox and owned stepper removed from default tile view (owned editing in hover overlay).
- Double-faced card flip animation removed from grid tiles (flip animation conflicted with hover overlay system; flip remains accessible via CardModal).

---

## [1.2.1] — Bug Fix: Land Sort Group Spacer

### Fixed
- Land cards (Basic lands, fetchlands, Triomes, dual lands) now appear in their own sort group when sorting by Color in list view. Previously, all lands fell through to the colorless group because their `mana_cost` is empty — causing them to be indistinguishable from colorless non-lands and missing the visual spacer that should appear between groups. Fixed in both `getGroupKey()` (spacer logic) and `colorSortKey()` (sort order) using the same `type_line?.includes("Land")` check established in v1.1.6.

---

## [1.2.0] — Opening Hand Simulator Stats Panel

### Added
- Mana curve histogram in Opening Hand Simulator sidebar: spells only (lands excluded), CMC buckets 1–7+ (CMC ≥ 7 grouped into 7+), bars normalized to tallest bucket, count label above each bar, CMC label below. (Closes #4)
- Lands strip below histogram: emerald color swatch, land count, percentage of deck. Static — does not update as cards are drawn.
- Current Hand stats panel: cards in hand, land count, avg CMC of spells only (shows `—` when hand contains no spells). Updates live on every Draw and Mulligan.
- Draw Odds list in Opening Hand Simulator sidebar: one row per unique card remaining in library, showing live next-draw probability as a percentage with a normalized bar that depletes as copies are drawn. Color thresholds: green ≥ 8%, yellow ≥ 4%, red < 4%. Bar color and % number always match. Cards with 0 copies remaining are hidden. (Closes #7)
- Lands toggle in Draw Odds header: default on; instantly filters lands in/out of the list. Active state uses emerald accent.
- Pin interaction: click a card row in Draw Odds or click a card image in the hand grid to toggle pin. Pinned rows float to top of Draw Odds list with blue background, border, filled star icon, and blue name text. Pinned card images show blue ring and star badge. Multiple cards can be pinned simultaneously. Mulligan clears all pins.
- Mulligan counter in Opening Hand Simulator header subtitle alongside Hand and Library counts. Starts at 0 on modal open, increments by 1 on each Mulligan, resets when modal is closed and reopened. (Closes #9)
- Named probability threshold constants at top of file: `PROB_GREEN = 0.08`, `PROB_YELLOW = 0.04` — calibrated for 60-card decks; pre-named for Commander recalibration when that mode ships.

---

## [1.1.7] — Bug Fix Sprint

### Fixed
- List view hover highlight restored: hovering a tinted row now brightens the tint color subtly. Yellow highlight still overrides hover (yellow wins). Regression from v1.1.6 color tint implementation.
- Colorless vs Land tint differentiated in list view: Land cards (type_line-based detection) now show tan/brown (`rgba(180, 140, 90, 0.15)`); colorless non-land cards show neutral gray (`rgba(150, 150, 150, 0.12)`). Correctly handles Basic Lands, fetchlands, Triomes, and dual lands.
- Deck name click in dropdown no longer closes it — now behaves identically to the radio button (switches active deck, stays open).
- 4-copy badge color follows gray → green → red progression: gray at ≤ 3 copies (badge absent), green at exactly 4 (at the legal limit), red at 5+ (over the limit). Applied in both grid and list view.
- Unnamed decks now show "Untitled" in muted gray in the deck dropdown. Named decks unaffected.

---

## [1.1.6] — UI Polish + Workflow Fixes

### Added
- Deck dropdown radio buttons: inactive decks show a hollow gray circle; clicking it switches the active deck without closing the dropdown. Clicking the active dot is a no-op. Clicking the deck name still closes the dropdown. Tooltip "Switch deck" on inactive radio button. (Closes #77)

### Changed
- Card count in toolbar now turns green at exactly 60 cards and red above 60 — was flat yellow at ≥ 60 (Closes #53, Closes #56)
- 4-copy warning badge in grid and list view changed from yellow to red to match the exceeded-limit signal
- Active Main/Side pill is now blue (`bg-blue-600`) instead of dark gray; inactive remains gray (Closes #57)
- List view adds vertical spacing between sort groups when sorting by Color or Mana Value with group-by-type off (Closes #47)
- List view rows are now tinted by card color identity: white, blue, black, red, green, gold (multicolor), gray (colorless/land) (Closes #13)
- Deck name input now shows gray "Untitled" placeholder when the name is empty; new decks start unnamed; text turns white on first keystroke (Closes #70)

### Fixed
- BACKLOG.md promoted items now correctly cleared in session commit alongside CLAUDE.md updates; behavior rule added to Key Technical Notes

---

## [1.1.5] — Bug Fix Sprint

### Fixed
- Blue dot active deck indicator in dropdown no longer triggers dropdown close (Closes #55)
- Card thumbnail toggle setting now persists across page refreshes via localStorage key `mtg-show-thumbnail` (Closes #59)
- Owned counter now supports inline typing in both grid and list view — behavior mirrors qty counter; validation matches existing `updateOwnedQty` rules (Closes #48)

### Housekeeping
- Backlog triage: closed #18, #23, #25, #52, #67, #72, #73 (discarded)
- Moved #50, #51, #54, #60, #71 to v2.0
- Promoted #76 — Grid view hover controls
- Priority bumps: #26, #58, #62, #70
- Triage process defined and added to CLAUDE.md Session Start
- BACKLOG.md consolidation prompt updated: guards against empty consolidation, enforces items-before-timestamp order

---

## [1.1.4] — Tooltip Consistency + REVIEW.md Workflow

### Fixed
- Grid view 4-copy warning tooltip now reads "Exceeds 4-copy limit" — matches list view text updated in v1.1.3 (Closes #45)
- All tooltip spans now have `max-w-xs whitespace-normal` so long text wraps instead of overflowing the viewport (Closes #46)

### Added
- **REVIEW.md session journal workflow**: Claude Code writes a plan review table before touching any files (waits for PROCEED), then writes a testing checklist after build (waits for APPROVED), then writes a session summary before final commit

---

## [1.1.3] — Tooltip Consistency Pass

### Fixed
- 4-copy badge tooltip in list view shortened to "Exceeds 4-copy limit" — no longer clips (Closes #42)
- X (remove card) tooltip removed from grid view — list view already had no tooltip; both views now consistent (Closes #43)

### Added
- Main/Side pill toggle now has tooltips: "Switch to main deck" / "Switch to sideboard" (Closes #44)

---

## [1.1.2] — Tooltip Clip + Highlight Ring Fixes

### Fixed
- 4-copy warning tooltip in list view now renders **below** the qty number (`top-full`) instead of above, avoiding clip at scroll container top edge (Closes #39)
- Yellow highlight ring now fully visible on top-row and left-column cards — scroll container uses `p-1 pb-20` to give ring-offset space on all edges (Closes #40)

### Changed
- Removed "Increase" and "Decrease" tooltips from +/− qty buttons in grid view — X button tooltip also removed (Closes #41). List view had no tooltips on these controls already; both views now consistent.

---

## [1.1.1] — Hot Fix: Sideboard UX + Persistence + Overflow

### Fixed
- Clicking **+** on any deck row in the dropdown now: activates that deck, enables its sideboard, switches workspace to sideboard view, and closes the dropdown (Closes #36)
- `deckViewMode` (main/sideboard) now persisted to `localStorage` under `mtg-deck-view-mode` and restored on refresh; gracefully falls back to `main` if active deck has no sideboard (Closes #37)
- Removed `overflow-x-hidden` from workspace outer wrapper and scroll container — tooltips and highlight rings no longer clipped by overflow context (Closes #38)

---

## [1.1.0] — Sideboard Support + UI Persistence + Tooltip Fixes

### Added
- **Sideboard per deck**: enable from the deck dropdown (+ icon → Layers icon). 15-card soft limit with yellow warning when exceeded (Closes #19)
- **Main / Side pill toggle** in toolbar row 3 — switches workspace between main deck and sideboard view. "Side" grayed out when no sideboard exists (Closes #20)
- Deck dropdown redesigned: ● active indicator, + icon to add sideboard, Layers icon to view sideboard, "Delete Sideboard" action with confirmation
- Confirmation dialogs on Delete Deck (mentions sideboard if present) and Delete Sideboard
- Search adds cards to sideboard when in sideboard view
- Sideboard card count shown as `X / 15` in toolbar when in sideboard view
- Goldfish Simulator always uses main deck only
- Import: detects `Sideboard` section header and auto-enables + populates sideboard (Closes #33)
- Export: appends `Sideboard` section when active deck has a sideboard
- 4-copy soft warning checks combined main + sideboard quantities
- **UI persistence**: grid/list view (`mtg-view-mode`), group-by-type (`mtg-group-by-type`), last active deck (`mtg-active-deck`) all saved to localStorage and restored on refresh (Closes #33)
- Sort direction toggle (↑/↓) now has tooltip "Sort ascending" / "Sort descending" (Closes #35)

### Fixed
- 4-copy badge tooltip initial fix in list view (Closes #34)

### Changed
- `Deck` type gains optional `sideboard?: DeckCard[]` field
- `useDeckManager` context gains `enableSideboard`, `deleteSideboard`, `activeSideboardCards`, `deckViewMode`, `setDeckViewMode`
- `deckViewMode` lives in context so Sidebar and Workspace both read it
- `useDeckImportExport` refactored to support sideboard import/export
- `ListCardTable` `overflow-hidden` wrapper removed to fix tooltip clipping
- Scroll container padding: `p-1 pb-20` (was `pr-1 pb-20`) for highlight ring edge space

---

## [1.0.7] — Inline Quantity Editing & Sort Controls

### Added
- **Inline qty editing (grid + list)**: click any quantity number to edit it inline; input selects all on focus; text/pointer cursor signals clickability
- **Enter or blur** commits; **Escape** reverts without saving; non-numeric input silently reverts
- **0 or empty** sets quantity to 0 — card grays out and stays in the deck, matching existing `−` button behavior
- Values above 4 are accepted with a yellow warning highlight — soft warning only, matching existing `+` button behavior; Basic Lands and "A deck can have any number" cards are exempt
- **Sort By dropdown** in toolbar: Original · Name · Color · Mana Value
- **Direction toggle** (↑/↓) in toolbar: flips ascending/descending, disabled when Original is selected
- Color sort order: White → Blue → Black → Red → Green → multicolor (grouped by color pair/combination) → colorless; cards missing color or CMC data sort to the bottom
- Sort applies to both grid and list view
- Sort preference (type + direction) persisted to `localStorage` under key `mtg-sort-preference`
- Sort By and Direction controls also surfaced in the Settings sidebar

### Changed
- `SortBy` and `SortDir` types exported from `useDeckManager`; sort state lives in context (was local `useState` in Workspace)
- Grid view bottom bar: `− qty +` controls now grouped and centered (were corner-pinned with `justify-between`)
- `setQuantity(id, qty)` handler added to Workspace — sets an absolute value instead of a delta; qty=0 grays out rather than removes

### Housekeeping
- Closed #21, #24, #29 — no code changes required

---

## [1.0.6] — Owned Quantity Tracking

### Changed
- `isOwned: boolean` replaced with `ownedQty: number` on `DeckCard` type
- `updateOwnedQty(cardId, qty)` added to `useDeckManager` context (clamped 0–quantity)

### Added
- **Grid view**: owned count badge (visible when `ownedQty > 0`), soft green progress bar above quantity controls, gray overlay on card image that scales proportionally with ownership
- **List view**: Owned column (checkbox + count + mini progress bar), row opacity fades as ownership increases; columns reordered to Qty | Name | Type | Mana | Price | Owned | ✕
- **Buy lists**: TCGPlayer and Card Kingdom export `quantity - ownedQty` per card; fully owned cards excluded entirely
- **Export**: `.txt` format encodes owned qty as `[owned:N]` tag
- **Import**: parses `[owned:N]` (new) and `[owned]` (legacy, treated as fully owned)
- **Migration**: loading old saves with `isOwned: true` → `ownedQty = quantity`; `isOwned: false` → `ownedQty = 0`; existing `ownedQty` values preserved as-is

---

## [1.0.5] — Patch Fixes

### Added
- ⚠️ badge in list view when a card's quantity reaches 5+ (soft 4-copy limit warning)
- Tooltip on badge: "Exceeds the 4-copy limit for standard play"
- Exempt: Basic Lands and cards with "A deck can have any number" oracle text

### Fixed
- TCGPlayer and Card Kingdom buy lists now exclude fully owned cards (`isOwned === true`)
- Swap Art confirm button now shows as active blue by default (was rendering as gray/disabled on open)

### Verified
- `handleAddCard` in Sidebar.tsx is still async with $0.00 / null pricing rescue intact after v1.0.4 refactor

---

## [1.0.4] — Refactor

### Changed
- Extracted `WorkspaceToolbar.tsx` from `Workspace.tsx` (3-row header, import/export, buy links, view controls)
- Extracted `DeckDropdown.tsx` — self-contained with own open state, ref, and click-outside effect
- Extracted `useDeckStats.ts` hook — `totalCards`, `totalValue`, `remainingCost`, `hasPriceData`, `buyOnTCGPlayer`, `buyOnCardKingdom`
- `Workspace.tsx` reduced from 607 → 333 lines
- `fileInputRef` internalized to `WorkspaceToolbar` (no longer threaded through Workspace)

---

## [1.0.3] — Exports, Scroll & Settings

### Added
- Full fidelity export: `[SET]` and `[owned]` tags in `.txt` format
- Full fidelity import: parses `[SET]` and `[owned]` tags, passes owned status through
- Auto-scroll to card in workspace when added from sidebar (grid + list view)
- Yellow ring highlight on added card, fades after 1 second
- `lastAddedId` shared via `useDeckManager` context
- Settings menu in footer (gear icon) with Card Preview toggle
- Card preview toggle shared via `useDeckManager` context (`showThumbnail`)
- Themed dark scrollbars (4px, neutral-700, rounded)

### Fixed
- `$0.00` pricing rescue on card add from search (`handleAddCard` now async)
- `$0.00` pricing rescue on import (in addition to null rescue)
- Scryfall collection fetch uses set identifier when available

### Removed
- Eye/EyeOff icons removed from search bar and workspace toolbar

---

## [1.0.2] — UI Overhaul & List View

### Added
- Owned cards green tint in list view (name + price)
- 60 card yellow highlight on card count
- WotC Fan Content disclaimer in footer
- Type column added to list view
- Collapsible footer (collapsed by default)
- Footer: version badge opens changelog, coffee icon, GitHub icon
- Version config extracted to `src/config/version.ts`
- TCGPlayer export with set code format `[SET]`

### Changed
- Deck name + dropdown unified (chevron on left, click to switch decks)
- Auto-highlight search field text on click
- Mana column renamed from "Cost"
- Set name removed from list view (visible in modal)
- Toolbar restructured: 3 rows (deck name / stats / actions)
- Actions row: left-justified buy buttons, right-justified controls
- Opening Hand Simulator renamed
- Search sidebar spacing tightened

### Fixed
- Horizontal scroll eliminated

---

## [1.0.1] — Card Modal Polish

### Added
- Inline mana symbols in oracle text
- Flavor text in card modal
- Full set name in modal subtitle and list view
- Price added to card modal product details
- N/A pricing for cards with no USD data
- Import pricing rescue lookup for `$0.00` cards

### Fixed
- Confirm swap button always visible, no flicker
- Art fills modal panel properly
- localStorage silent failure recovery
- Scryfall network error handling

### Changed
- Test Deck rename
- "To Buy" label UI polish

---

## [1.0.0] — Initial Release

### Added
- Deck builder with visual grid + list view
- Scryfall search with EDHREC category browsing
- Goldfish Simulator with Fisher-Yates shuffle and stats
- Import/export (`.txt` decklist format)
- TCGPlayer + Card Kingdom buy links
- Card Modal with art swap, rulings, legalities
