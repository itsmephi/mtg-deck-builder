# Search Overhaul — Design Spec
**Milestone:** Search Improvements (#72 format/color filtering, #26 EDHREC suggestions)
**Prototype:** `search-overhaul-v3b.html` (open in browser for visual reference)
**Status:** DESIGNED — ready for implementation phasing

---

## 1. Architecture: Two-Tab App

The three-tab layout (Search / Browse / Decks) is replaced with a two-tab layout:

| Tab | Sidebar shows | Workspace shows |
|---|---|---|
| **Search** | Category chips + filter controls | Card grid of search results |
| **Decks** | Deck management list (unchanged) | Deck grid/list view (unchanged) |

Clicking Search switches both sidebar and workspace to search mode. Clicking Decks switches both back to deck mode. The tab bar replaces the current Search / Decks tab bar — same position, same styling, just without the Browse tab.

**Scope boundary:** The Decks tab (sidebar and workspace) is completely unchanged by this milestone. Do not modify deck management, deck grid, deck list, WorkspaceToolbar in deck mode, or any deck-related components. The prototype's deck view is approximate — reference the existing codebase for deck view, not the prototype.

---

## 2. Search Workspace Toolbar (Two Rows)

The search workspace uses a two-row toolbar matching the deck workspace's two-row pattern:

### Row 1 — Search Bar

A full-width search input spanning the toolbar. Contains, left to right:

1. **Search icon** (magnifying glass, `text-neutral-400`, non-interactive)
2. **Filter badge** — inline tag showing the active deck's format and color identity
3. **Search tokens** — NLP-parsed chips (zero or more)
4. **Text input** — flex-1, takes remaining space
5. **Clear button** (× icon, visible only when input has text)

The search bar container uses `bg-neutral-950`, `border border-neutral-800`, `rounded-lg`, with `focus-within:border-neutral-600` transition. Internal items are inline-flex with `gap-1` (4px).

### Row 2 — Sort & View Controls

- Result count: `"{n} results"` — updates on every search/filter change
- Sort dropdown: Relevance (default), Name, Price ↑, Price ↓, Mana Value, Color
- Divider
- Grid view button (active by default)
- List view button (disabled/placeholder for now — list view is a backlog item)

Row 2 mirrors the deck toolbar's row 2 layout: stats on the left, controls on the right with `ml-auto`.

---

## 3. Filter Badge

A small inline tag inside the search bar that displays the active deck's format and commander color identity.

**Appearance:** `bg-blue-900/30 border border-blue-500/25 rounded text-blue-400 text-[10px] px-1.5 py-0.5` with a small lock icon, format name, mana pips (if Commander with a commander set), and an × button.

**Behavior:**
- **On by default** when the active deck has a format set (Standard, Commander)
- **Freeform decks:** Badge shows "Freeform" with no actual filtering applied (no Scryfall syntax appended)
- **Commander with commander set:** Badge shows "Commander" + color identity mana pips. Appends `legal:commander id<=RG` (or whatever the identity is) to Scryfall queries.
- **Commander without commander:** Badge shows "Commander · any colors". Appends `legal:commander` only (no color restriction — user needs to search for their commander).
- **Standard:** Badge shows "Standard". Appends `legal:standard`.
- **Toggling off:** Click the badge or its × button. Badge visually dims (`bg-neutral-800 border-neutral-700 text-neutral-500`). No format/color syntax appended to queries.
- **Toggling on:** Click the dimmed badge. Restores active appearance and filtering.
- **Persistence:** Toggle state is session-only (not localStorage). Resets to "on" when switching decks.
- **No active deck:** Filter badge is hidden entirely.

---

## 4. NLP Parser (Client-Side)

A client-side pattern matching system that translates natural language search queries into Scryfall search syntax.

### How It Works

1. User types in the search bar
2. Parser runs on every input change (no debounce needed — it's local string matching)
3. Matched patterns are extracted as **search tokens** displayed inline in the search bar
4. Unmatched text is passed through as plain Scryfall text search
5. The final Scryfall query is: `{filter badge syntax} {token scryfall values} {remaining text}`

### Pattern Dictionary

| User types | Token label | Token value | Scryfall translation |
|---|---|---|---|
| "red", "green", "blue", "white", "black" | color | Red, Green, etc. | `c:R`, `c:G`, `c:U`, `c:W`, `c:B` |
| "colorless" | color | Colorless | `c:C` |
| "creature", "instant", "sorcery", "enchantment", "artifact", "land", "planeswalker" | type | Creature, etc. | `t:creature`, etc. |
| "flying", "trample", "deathtouch", "lifelink", "haste", "menace", "hexproof", "indestructible", "ward", "fear", "double strike" | kw | Flying, etc. | `o:flying`, etc. |
| "legendary" | type | Legendary | `t:legendary` |
| "under $X", "less than $X" | price | < $X | `usd<X` |
| "under X mana", "X mana or less" | cmc | ≤ X | `cmc<=X` |
| "X drop" | cmc | = X | `cmc=X` |
| "budget" | price | < $2 | `usd<2` |
| "ramp" | archetype | Ramp | `o:"add" (t:creature OR t:artifact OR t:sorcery)` |
| "board wipe", "wrath" | archetype | Board Wipe | `o:"destroy all" OR o:"exile all"` |
| "removal" | archetype | Removal | `o:"destroy target" OR o:"exile target"` |
| "card draw" | archetype | Card Draw | `o:"draw" -t:land` |
| "tutor" | archetype | Tutor | `o:"search your library"` |
| "counterspell", "counter" | archetype | Counterspell | `o:"counter target"` |
| "protection" | archetype | Protection | `o:"hexproof" OR o:"indestructible"` |
| "token", "token maker" | archetype | Token Maker | `o:"create" o:"token"` |
| "lifegain" | archetype | Lifegain | `o:"gain" o:"life"` |
| "common", "uncommon", "rare", "mythic" | rarity | Common, etc. | `r:common`, etc. |

This dictionary is extensible — new patterns can be added without structural changes. Start with these ~30 high-value patterns.

### Search Token Appearance

Each token is an inline chip inside the search bar: `bg-neutral-800 border border-neutral-700 rounded text-neutral-300 text-[10px] px-1.5 py-0.5`.

Contents: `{label}: {value} ×` where label is uppercase dimmed text (`text-neutral-500 text-[9px] uppercase tracking-wide`) and × is hidden by default, shown on hover.

**Interaction:** Click a token to remove it. The search re-runs without that token's Scryfall syntax. Hover shows the × and the token border changes to `border-red-500 text-red-400`.

---

## 5. Autocomplete Dropdown

Appears below the search bar after 2+ characters are typed. Two sections:

### Section 1 — Card Name Matches

Uses Scryfall's `/autocomplete` endpoint (fast, returns up to 20 names). Display up to 5 matches, deduplicated by name. Each row shows:

- Green dot (6px) if the card is already in the active deck
- Card name
- Mana cost pips (right-aligned)

Clicking a card name sets the search input to that name and runs the search.

### Section 2 — Parsed Query Preview

Shows the NLP parser's output for the current input. Only visible when the parser extracted at least one token. Displays the parsed tokens as the same chip style used in the search bar, with the same click-to-remove interaction.

**Dropdown styling:** `bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl` positioned absolutely below the search bar with a 4px gap. Closes on click outside or Escape.

---

## 6. Category Chips (Sidebar)

Replace the current category dropdown with a wrap-layout chip bar in the sidebar.

**Position:** Top of the sidebar content area, below a "Categories" label, above the filter controls. Separated from filters by a `border-b border-neutral-800`.

**Chips are format-relevant.** When the active deck's format changes, the chip set updates:

| Deck format | Categories shown |
|---|---|
| Commander | Commander Staples, Mana Rocks, Lands, Tribal, Removal, Card Draw |
| Standard | Meta Staples, Budget Picks, Aggro, Control, Midrange, New Set |
| Freeform | Top 50 Trending, New Releases, Removal, Card Draw, Tribal, Ramp |

Each chip has an icon (emoji or small symbol) and a short label. Clicking a chip runs a pre-built Scryfall query for that category (appending any active filter badge syntax). Active chip gets `bg-blue-900/30 border-blue-500/30 text-blue-400`.

Only one chip is active at a time. Typing in the search bar deactivates the active chip (search overrides category browsing). Clearing the search re-activates the last category if one was selected.

---

## 7. Sidebar Filter Controls

Below the category chips, a scrollable panel of filter controls:

### Price Range
- Two editable text inputs: min (`$0` default) and max (`$100` default)
- A slider bar between them (click to adjust visually)
- Inputs accept typed values — user can enter `$0` to `$500` or any amount
- Applies `usd>=X usd<=Y` to Scryfall queries

### Rarity
- Toggle buttons: Common, Uncommon, Rare, Mythic
- All on by default. Toggling one off excludes that rarity.
- Applies `r:common OR r:uncommon` etc. (only include active rarities)

### Card Type
- Toggle buttons: Creature, Instant, Sorcery, Enchantment, Artifact, Land, Planeswalker
- All on by default. Toggling one off excludes that type.
- Applies `t:creature OR t:instant` etc.

### Colors
- Toggle buttons with mana pip icons: W, U, B, R, G, C
- All on by default. Toggling one off excludes that color.
- Applies color filtering via Scryfall `c:` syntax

**Toggle button styling:** `bg-neutral-800 border border-neutral-700 rounded text-[10px] px-1.5 py-0.5`. Active: `bg-blue-900/30 border-blue-500/30 text-blue-400`.

**Filter application:** All sidebar filters are combined with search bar input and filter badge to build the final Scryfall query. Filters apply in real-time (no "Apply" button).

---

## 8. Search Result Card Grid

The workspace body shows search results as a card grid using the same tile component as the deck grid view (`VisualCard.tsx` or equivalent).

### Grid layout
- `grid-template-columns: repeat(auto-fill, minmax(175px, 1fr))`
- `gap: 12px`, `padding: 14px`
- Scroll: vertical overflow auto

### Card tile behavior

**Default state (no hover):**
- Full card art image
- **In-deck indicator:** Green dot (8px), positioned `top-6 left-6`, with `box-shadow: 0 0 0 2px var(--bg-app)` ring. Only visible if the card is already in the active deck.
- No other badges or controls visible

**Hover state:**
- Card lifts: `translateY(-3px)`, `box-shadow: 0 8px 24px #0006`
- Slide-up overlay from bottom (same as deck grid overlay):
  - Card name (bold, white, truncated)
  - Price + type line (small, muted)
  - **"+ Add to Deck"** button — full-width, `bg-blue-500 text-white rounded-md py-1.5 font-semibold`

**Click:** Opens CardModal in search context.

---

## 9. CardModal Behavior

The existing CardModal is reused with context-dependent behavior.

### Layout (unchanged)
- Left panel: Card art + Details/Swap Art tabs + contextual action button
- Right panel: Scrollable details (name, set, type, oracle text, flavor, product details, legalities)

### Contextual action button (left panel, below tabs — always visible)

| Context | Tab | Button text | Button style | Action |
|---|---|---|---|---|
| Search | Details | + Add to Deck | Blue (active) | Adds card (current printing) to deck |
| Search | Swap Art | + Add to Deck | Blue (active) | Adds card (selected printing) to deck |
| Deck | Details | Confirm Art Swap | Gray (disabled) | No action (no variant selected yet) |
| Deck | Swap Art | Confirm Art Swap | Gray (active) | Swaps art to selected variant |

This means:
- **From search:** The button is always "+ Add to Deck" regardless of which tab you're on. The Swap Art tab lets you choose a printing, then "+ Add to Deck" adds that specific printing.
- **From deck:** The button is always "Confirm Art Swap" — disabled in Details (nothing to confirm), active in Swap Art (once you pick a variant). This matches the current app behavior.

### Opening from search vs deck
- **From search grid:** CardModal receives the card's Scryfall data. Right panel shows full details. Left panel shows card art for the default printing. Swap Art tab loads the card's `prints_search_uri` to show variant thumbnails.
- **From deck grid:** CardModal receives the `DeckCard` data. Behavior matches current implementation exactly.

---

## 10. Interaction Flows

### Flow 1: Basic search
1. User clicks Search tab → workspace switches to search grid, sidebar shows categories + filters
2. Search input auto-focuses
3. User types "rat" → autocomplete shows card matches + parsed tokens (none for "rat")
4. After debounce, Scryfall query fires: `rat` (+ filter badge syntax if active)
5. Results render as card grid
6. User hovers a card → overlay slides up with name, price, "+ Add to Deck"
7. User clicks "+ Add to Deck" → toast confirms, card added to active deck

### Flow 2: NLP search
1. User types "black creatures under $5" in search bar
2. Parser extracts: `color: Black`, `type: Creature`, `price: < $5`
3. Three search tokens appear inline in the search bar
4. Scryfall query: `c:B t:creature usd<5` (+ filter badge syntax)
5. User removes the price token by clicking it → query becomes `c:B t:creature`
6. Results update in real-time

### Flow 3: Category browsing
1. User clicks "Removal" chip in sidebar
2. Pre-built query fires: `o:"destroy target" OR o:"exile target"` (+ filter badge)
3. Results show removal spells for the deck's format/colors
4. User starts typing in search bar → chip deactivates, search takes over
5. User clears search → chip re-activates if one was previously selected

### Flow 4: Art variant selection (from search)
1. User opens CardModal from search grid
2. Default printing shown. Button says "+ Add to Deck"
3. User clicks "Swap Art" tab → variant thumbnails load in right panel
4. User clicks a variant → left panel updates to show that printing's art
5. Button still says "+ Add to Deck"
6. User clicks "+ Add to Deck" → that specific printing is added to the deck

### Flow 5: Filter refinement
1. User has search results visible
2. User toggles off "Artifact" in sidebar Card Type filter → artifacts removed from results
3. User types "$0" to "$3" in price range inputs → only budget cards shown
4. All filters combine with search bar input and filter badge

---

## 11. Technical Notes

### New localStorage keys
- `mtg-sidebar-active-tab` — value: `"search"` | `"decks"`, default `"decks"`

### Existing keys unchanged
- `mtg-sidebar-collapsed` — still controls sidebar collapse
- All deck-related keys unchanged

### Scryfall API usage
- Search: existing `searchCards()` function in `scryfall.ts` — extend to accept additional filter syntax
- Autocomplete: new call to Scryfall `/cards/autocomplete?q={text}` endpoint
- Prints: existing `prints_search_uri` field on card objects (already used by Swap Art)

### New components (suggested)
- `SearchWorkspace.tsx` — the search-mode workspace (toolbar + grid)
- `SearchBar.tsx` — the search input with filter badge, tokens, autocomplete
- `FilterPanel.tsx` — sidebar filter controls (price, rarity, type, color)
- `CategoryChips.tsx` — sidebar category chip bar
- `NLPParser.ts` — utility: `parseQuery(text) => { tokens: Token[], remainder: string, scryfallQuery: string }`

### Modified components
- `Sidebar.tsx` — add Search tab content (CategoryChips + FilterPanel)
- `SidebarSearchTab.tsx` — repurpose or replace: no longer shows search results list, just hosts FilterPanel and CategoryChips
- `page.tsx` — workspace area conditionally renders SearchWorkspace or current deck workspace based on active tab

### Components NOT modified
- `VisualCard.tsx` — reused as-is for search grid tiles (pass different overlay content via props)
- `CardModal.tsx` — minimal changes: accept `context: 'search' | 'deck'` prop to control button behavior
- `ListCardTable.tsx` — unchanged
- `WorkspaceToolbar.tsx` — unchanged (only used in deck mode)
- `SidebarDecksTab.tsx` — unchanged
- `useDeckManager.tsx` — unchanged
- All deck-related components — unchanged

---

## 12. Deferred Items (Backlog)

| Item | Disposition |
|---|---|
| Search list view (grid/list toggle) | Backlog — patch feature |
| Deck health panel (gap analysis) | Separate future feature |
| Hold-to-peek (peek at deck from search) | Backlog capture |
| Art variant browsing from search | Phase 2 of this milestone (wiring only — CardModal Swap Art already exists) |
| Emoji in deck names | Backlog capture — optional personalization feature |

---

## 13. Glossary

| Term | Definition |
|---|---|
| **Filter badge** | Inline tag in search bar showing deck format + color identity |
| **Search tokens** | NLP-parsed chips in search bar, each removable |
| **Category chips** | Sidebar browse shortcuts (format-relevant) |
| **Filter controls** | Sidebar panel: price range, rarity, type, color toggles |
| **Context** | Whether CardModal was opened from search or deck — determines button behavior |
