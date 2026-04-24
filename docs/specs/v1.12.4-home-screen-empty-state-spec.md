# Home Screen & Empty State Design Spec

> **Status:** DESIGN APPROVED
> **Date:** 2026-03-24
> **Designed in:** Claude Chat design session + interactive prototypes (v1–v4)
> **Prototype reference:** `thebrewlab_prototype_v4` (Claude Chat session)
> **Backlog items addressed:** Empty/cold-start state, onboarding hint layer, dotted New Deck slot in sidebar

---

## Summary

Replace the silent auto-create behaviour (app immediately creates a blank "Untitled" deck on first load) with a proper **Home Screen** that serves as the entry point whenever no deck is active. The home screen handles both zero-decks and has-decks states using the same component. A ghost card in the empty deck workspace bridges the user directly into search. A search takeover replaces the toolbar-area search on first entry from the ghost card.

---

## Goals

- Give new users a clear, warm entry point with no confusion about what to do first
- Establish "dashed outline = create something new" as a consistent design language across three surfaces: home screen, workspace, sidebar
- Teach the core loop (create deck → add card → search) through spatial metaphor rather than tooltips or modals
- Keep the minimal aesthetic — no onboarding wizards, no modal tours, no walls of instruction

---

## 1. Routing Changes (`page.tsx`)

### Current conditional
```
showSettings → <SettingsView />
activeTab === "search" → <SearchWorkspace />
activeTab === "decks" → <Workspace />
```

### New conditional
```
showSettings        → <SettingsView />
!activeDeck         → <HomeScreen />        ← new
activeTab==="search"→ <SearchWorkspace />
activeTab==="decks" → <Workspace />
```

The `!activeDeck` check must come **before** the tab conditionals. When no deck is active the home screen renders regardless of which sidebar tab is selected.

### Remove auto-create
In `Workspace.tsx`, remove the `useEffect` that calls `createNewDeck()` when `decks.length === 0`:

```tsx
// REMOVE THIS:
useEffect(() => {
  if (isMounted && !activeDeck) {
    if (decks.length === 0) createNewDeck();
    else setActiveDeckId(decks[0].id);
  }
}, [isMounted, activeDeck, decks, createNewDeck, setActiveDeckId]);
```

The "no active deck" state is now intentional and rendered as the home screen.

---

## 2. HomeScreen Component (`src/components/home/HomeScreen.tsx`)

### Layout

Full workspace area takeover. Sidebar remains visible and fully functional in all states (expanded, collapsed, mobile).

Vertical layout:
- `padding-top: 10%` — top-anchored with breathing room, not vertically centered
- Heading + tagline block, centered
- Deck covers grid, centered
- No toolbar

```tsx
<div className="flex-1 overflow-y-auto flex flex-col items-center"
     style={{ paddingTop: '10%' }} >
  {/* Heading block */}
  {/* Deck grid */}
</div>
```

### Heading block

```tsx
<div className="flex flex-col items-center gap-1.5 mb-6">
  <h2 className="text-base font-medium text-content-heading">
    What are you brewing?
  </h2>
  <p className="text-xs text-content-faint" id="home-tagline">
    {tagline}
  </p>
</div>
```

- Heading: `text-base font-medium text-content-heading`
- Tagline: `text-xs text-content-faint`
- No "↻ another" button — rotation is visit-only, invisible to user
- No app wordmark or logo — deferred to branding design session

### Deck covers grid

```tsx
<div className="flex flex-wrap gap-3 justify-center max-w-[520px]">
  {decks.map(deck => <DeckCoverCard key={deck.id} deck={deck} />)}
  <GhostDeckCard onClick={handleNewDeck} />
</div>
```

**Zero decks state:** only `<GhostDeckCard />` is rendered. No label above the grid — the heading handles context.

**Has decks state:** deck cover cards render first, ghost deck card always last.

---

## 3. DeckCoverCard Component

Placeholder implementation for v1 — no custom art yet. Art/cover image support is a future feature.

```
Width:  100px
Height: 140px
Border-radius: rounded-lg (8px)
Border: 0.5px solid border-line-default
Background: bg-surface-raised
```

Content (bottom-anchored):
- Deck name: `text-[10px] font-medium text-content-heading text-center px-1.5 leading-tight`
- Card count: `text-[9px] text-content-muted`

Subtle placeholder art using a gradient built from existing surface tokens — no images required for v1.

**On click:** sets that deck as `activeDeck`, sets `activeTab` to `"decks"`, navigates to workspace.

**Hover:** `hover:border-surface-hover` — subtle, no scale or shadow.

---

## 4. GhostDeckCard Component

Same dimensions as `DeckCoverCard` (100×140px). Reuses the dashed border pattern established in the workspace ghost card.

```
Border: 1.5px dashed — uses --input-edge-focus (accent color) at 50% opacity
Background: transparent
Opacity: 0.5 default → 1.0 on hover
Hover background: accent color at 5% opacity
```

Contents:
- `+` symbol: `text-2xl` in accent color
- Label: `text-[10px] text-center` in accent color — `"New Deck"`

**On click:**
1. Opens `FormatPicker` (same as existing `+ New Deck` button behaviour)
2. On format selected: creates deck, sets as `activeDeck`, sets `activeTab` to `"decks"`, navigates to workspace (which shows the empty deck state with ghost card)

---

## 5. Rotating Tagline (`src/config/taglines.ts`)

Single exported array. **Thurgood: to add, remove, or edit lines, edit only this file.**

```ts
// src/config/taglines.ts
// Edit this array to change the rotating taglines on the home screen.
// One line is shown per visit, chosen at random.

export const HOME_TAGLINES: string[] = [
  "Every great deck starts with a single card.",
  "Brew something worth playing.",
  "Today's experiment, tomorrow's gameplan.",
  "What's on tap?",
  "Tinker. Test. Iterate.",
  "The pile doesn't build itself.",
  "Your next 99 is in here somewhere.",
  "New deck, new problem to solve.",
  "No wrong answers. Only bad mana curves.",
  "The sideboard can wait.",
  "Another deck you'll never goldfish enough.",
  "It's not netdecking if you change one card.",
  "Your opponent won't see it coming.",
];
```

**Selection logic:**
- On first render, pick a random index: `Math.floor(Math.random() * HOME_TAGLINES.length)`
- Store in `sessionStorage` key `tbl-tagline-index`
- On subsequent renders within the same session, read from session storage (tagline does not re-roll mid-session)
- New session = new random tagline

---

## 6. Empty Deck State (Workspace)

When `activeDeck` exists but `activeDeck.cards.length === 0`, the workspace grid renders a single ghost card instead of an empty grid.

### Ghost card dimensions
Same as a real card tile in the current grid. Matches the tile size at default zoom level.

```
Border: 1.5px dashed — uses --input-edge-focus (accent color) at 45% opacity
Opacity: 0.45 default → 1.0 on hover
Hover background: accent color at 5% opacity
```

Contents:
- `+` symbol in accent color
- Label: `"Add your first card"` in accent color, `text-[8px] text-center leading-tight`

**On click:**
1. Sets `activeTab` to `"search"`
2. Sets a new boolean state `showSearchTakeover: true` in search context or page state
3. Renders `SearchTakeover` instead of normal `SearchWorkspace`

**Persistence:** Ghost card disappears the moment `activeDeck.cards.length > 0`. It reappears if all cards are removed (deck emptied).

---

## 7. Search Takeover (`SearchWorkspace` or new `SearchTakeover` component)

Shown **only** when `showSearchTakeover === true`. Replaces the normal search toolbar + results view entirely.

### Layout

Same top-anchored pattern: `padding-top: 10%`, flex column, centered, no toolbar.

```
"What are you building with?"    ← text-base font-medium text-content-heading
[         Search for a card…   ] ← large input, max-w-[380px]
   or start with a category      ← text-xs text-content-faint
[ Ramp ] [ Removal ] [ Card Draw ] [ Wipes ] [ Tokens ] [ Creatures ] [ Burn ] [ Lands ]
```

### Input styling
Larger than the normal toolbar search input:
- `text-sm` (14px) vs normal `text-xs` (11px)
- `py-2.5 px-3.5` padding
- `max-w-[380px] w-full`
- Focus ring: `border-input-edge-focus`
- `autoFocus` — cursor lands in the input immediately on render

### Category tags
Same quick-tag set as the sidebar Search tab. Styled larger than sidebar tags:
- `text-xs py-1.5 px-3.5 rounded-full`
- Default: `bg-surface-raised border-line-default text-content-secondary`
- Hover: accent color background tint, accent border, accent text

### Dismissal — snaps back to normal search
`showSearchTakeover` is set to `false` when **either**:
- User types in the search input and submits (Enter or debounced search fires)
- User clicks a category tag

After dismissal, normal `SearchWorkspace` renders with the search term or tag pre-populated and results visible. The toolbar search bar is back in its normal position. `showSearchTakeover` never returns to `true` for this deck unless the deck is emptied and re-entered via the ghost card.

**Edge case:** If the user navigates away (switches to Decks tab) without searching, `showSearchTakeover` resets to `false`. Returning to Search tab shows normal search.

---

## 8. Sidebar — Decks Tab New Deck Slot (`SidebarDecksTab.tsx`)

Replace the current `+ New Deck` button at the bottom of the deck list with a dashed ghost slot that mirrors the workspace and home screen pattern.

### Current
```tsx
<button className="...text button...">+ New Deck</button>
```

### New
```tsx
<div
  onClick={handleNewDeck}
  className="mx-2 my-1 border border-dashed rounded-md
             flex items-center justify-center gap-1.5
             py-1.5 cursor-pointer transition-colors
             border-line-default text-content-faint
             hover:border-input-edge-focus hover:text-content-muted"
>
  <Plus className="w-3 h-3" />
  <span className="text-[10px]">New Deck</span>
</div>
```

- Dashed border: `border-dashed border-line-default` → `hover:border-input-edge-focus`
- Text + icon: `text-content-faint` → `hover:text-content-muted`
- No fill background — transparent, consistent with ghost card language
- Rounded: `rounded-md`
- Full-width within sidebar padding: `mx-2`
- Opens `FormatPicker` on click — same behaviour as existing button

---

## 9. Sidebar Footer — Home Icon (Expanded)

### Current expanded footer
```
[ v1.12.3 ]
```

### New expanded footer
```
[ ⌂ ]  [ v1.12.3 ]
```

- Home icon (`Home` from lucide-react): `w-3.5 h-3.5`
- Button: `w-7 h-7 rounded-md flex items-center justify-center text-content-muted hover:text-content-primary hover:bg-surface-raised transition-colors`
- Version badge: unchanged, pushed right via `ml-auto` or flex gap
- **When already on home screen:** home button is `text-content-disabled cursor-default` — clicking does nothing (`onClick` is a no-op)

---

## 10. Sidebar Rail — Home Icon (Collapsed)

### Current rail bottom (top → bottom)
```
[ ☕ ]  Buy Me a Coffee
[ ⚙ ]  Settings
```

### New rail bottom
```
[ ☕ ]  Buy Me a Coffee
[ ⚙ ]  Settings
[ ⌂ ]  Home
```

Home icon sits below Settings, at the very bottom of the rail above the footer container.

- Same `w-9 h-9 rounded-full` button style as other rail icons
- Tooltip: `"Home"`
- **When already on home screen:** `text-content-disabled cursor-not-allowed` — no onClick
- **When on any other screen:** `text-content-muted hover:text-content-primary hover:bg-surface-raised` — onClick calls `setActiveDeckId(null)`

---

## 11. "Go Home" Action — `setActiveDeckId(null)`

The home screen is reached by setting `activeDeck` to null. This already works structurally once the auto-create `useEffect` is removed.

**Entry points:**
- Home icon in expanded sidebar footer
- Home icon in collapsed rail
- (Future) logo/wordmark click — not in scope for this release

**No "close deck" language is used anywhere.** The action is always framed as navigation ("go home"), not as closing or discarding work.

---

## 12. State Summary

| State | `activeDeck` | `showSettings` | Rendered |
|---|---|---|---|
| Home (no decks) | null | false | `<HomeScreen />` — ghost deck only |
| Home (has decks) | null | false | `<HomeScreen />` — covers + ghost deck |
| Empty deck | set | false | `<Workspace />` — ghost card in grid |
| Search takeover | set | false | `<SearchTakeover />` — full workspace |
| Normal search | set | false | `<SearchWorkspace />` — toolbar + results |
| Deck workspace | set | false | `<Workspace />` — card grid |
| Settings | any | true | `<SettingsView />` |

---

## 13. New localStorage / sessionStorage Keys

| Key | Storage | Value | Notes |
|---|---|---|---|
| `tbl-tagline-index` | `sessionStorage` | number | Index into `HOME_TAGLINES` array. New session = new random pick. |

No new `localStorage` keys. `activeDeckId` persistence behaviour is unchanged.

---

## 14. Files Touched

| File | Change |
|---|---|
| `src/app/page.tsx` | Add `!activeDeck` routing condition before tab conditionals |
| `src/components/workspace/Workspace.tsx` | Remove auto-create `useEffect`; add ghost card to empty grid |
| `src/components/home/HomeScreen.tsx` | **New file** |
| `src/components/home/DeckCoverCard.tsx` | **New file** |
| `src/components/home/GhostDeckCard.tsx` | **New file** |
| `src/components/search/SearchWorkspace.tsx` | Add `showSearchTakeover` state + `SearchTakeover` render path |
| `src/components/search/SearchTakeover.tsx` | **New file** (or inline in SearchWorkspace) |
| `src/components/layout/SidebarDecksTab.tsx` | Replace `+ New Deck` button with ghost slot |
| `src/components/layout/Sidebar.tsx` | Add home icon to expanded footer |
| `src/components/layout/SidebarRail.tsx` | Add home icon below Settings |
| `src/config/taglines.ts` | **New file** |

---

## 15. Out of Scope (Captured for Future)

- Deck cover art / custom images — v2 feature, `DeckCoverCard` is placeholder-ready
- Logo/wordmark as home button — pending branding design session
- Home screen as "recent decks" hub with richer metadata — natural evolution of this pattern
- Mobile-specific home screen layout adjustments
