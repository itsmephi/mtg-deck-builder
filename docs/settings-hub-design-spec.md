# Settings Hub Design Spec

> **Status:** DESIGN APPROVED — pending Claude Code prompt generation
> **Date:** 2026-03-22
> **Designed in:** Claude Chat design session + interactive prototypes
> **Prototype reference:** `settings-hub-v3-fullscreen.html` (in Claude project files)
> **Working app name:** TheBrewLab (may change — used throughout this spec and in all UI copy)

---

## Summary

Replace the cluttered sidebar footer (version badge + coffee icon + gear → tiny accordion settings panel) with a proper **Settings Hub** that takes over the workspace area. The sidebar stays visible; the workspace content swaps between deck view and settings view via a boolean state.

**Goals:**
- One-click access from any sidebar state (expanded, collapsed, mobile)
- Scalable section architecture for future content
- Proper home for changelog, credits, attribution, legal disclaimers, and support links
- Remove sort controls from settings (toolbar-only going forward)
- Mobile-ready — same component renders on all viewports

---

## 1. Interaction Model

### How It Opens

The settings hub is a **workspace takeover** — not a modal, not a slide-over panel. When active, the workspace area renders the settings view instead of the deck view. The sidebar remains visible and functional in all states.

Implementation: a boolean state (e.g. `showSettings`) in the shared context or page-level state. `showSettings ? <SettingsView /> : <Workspace />`.

| Entry point | Behavior | Default tab |
|---|---|---|
| **Version badge** (expanded sidebar footer) | Opens settings hub | What's New |
| **Gear icon** (collapsed rail, bottom) | Opens settings hub | Preferences |
| **Gear icon** (mobile tab bar) | Opens settings hub | Preferences |
| **Version badge clicked while hub is open** | Jumps to What's New tab | What's New |

### How It Closes

- **Back chevron** (`‹`) in the settings header — returns to deck view
- **Escape key** — returns to deck view
- Clicking any sidebar tab (Search / Decks) does NOT close settings — the sidebar and settings hub are independent

---

## 2. Sidebar Footer Changes

### Current Footer (removed)

```
[v1.11.1]  [☕]          [⚙]
```
Version badge + coffee icon + gear icon. Changelog accordion and settings accordion expand inline. Two clicks to reach settings.

### New Footer — Expanded Sidebar

```
[v1.11.1]
```

Single element: the version badge, left-aligned. Clicking it opens the settings hub to the What's New tab.

- Styling: same blue pill badge as today (`bg-blue-500/10 border-blue-500/20 text-blue-400`)
- Hover: `hover:bg-blue-500/20`
- Footer container: `border-t border-line-subtle`, minimal padding (`px-3 py-2`)

The coffee icon and gear icon are **removed from the expanded footer**. Coffee lives in the Support tab. Gear lives in the collapsed rail only.

### New Footer — Collapsed Rail

Bottom section of the rail (unchanged icons, new behavior):

```
[☕]   → external link (buymeacoffee.com) — unchanged
[⚙]   → opens settings hub, Preferences tab
```

Coffee stays in the rail as a quick-access external link. Gear opens the settings hub directly (one click, no sidebar expansion needed).

### Mobile

Gear icon appears in the sidebar tab bar, right-aligned next to Search and Decks tabs. Tapping it opens the settings hub (Preferences tab). The version badge is not shown on mobile — What's New is accessible via the tab once inside the hub.

---

## 3. Settings Hub Layout

### Header

```
[ ‹ ]  TheBrewLab                    [v1.11.1]
       Settings, info, and more
```

- Back chevron: `w-8 h-8 rounded-lg`, closes settings hub on click
- Title: `text-xl font-extrabold text-content-primary` — displays "TheBrewLab"
- Version badge: right-aligned, same blue pill style
- Subtitle: `text-xs text-content-muted` — "Settings, info, and more"

### Tab Bar

Horizontal tabs below the header, separated by `border-b border-line-subtle`:

```
Preferences    What's New    About    Support
```

- Active tab: `text-content-primary border-b-2 border-accent-copper` (copper underline)
- Inactive tab: `text-content-muted hover:text-content-secondary`
- Font: `text-xs font-semibold`
- Mobile: tabs scroll horizontally if needed (`overflow-x: auto`)

### Body

- Scrollable content area below tabs
- Padding: `p-7` desktop, `p-5` mobile
- Content constrained: `max-w-[560px]` for readability on wide screens
- Scrollbar: themed to match app (`scrollbar-width: thin`, overlay track)

---

## 4. Tab Content — Preferences

### Card Preview Toggle

```
Card Preview                          [====○]
Show card image on hover in search results
```

- Label: `text-sm text-content-heading`
- Hint: `text-xs text-content-muted`
- Toggle: existing `showThumbnail` state from `useDeckManager`
- Persists to `mtg-show-thumbnail` localStorage key (existing)

### Theme Picker

```
Theme
Choose your color palette

[ Warm Stone ]  [ Zed Dark ]
```

- Two swatch cards side by side (`w-[110px] h-16 rounded-lg`)
- Each swatch shows a gradient preview of the theme's surface colors
- Label overlay at bottom of swatch: `text-[9px] font-bold uppercase`
- Active swatch: `border-2 border-accent-copper` with subtle box shadow
- Inactive swatch: `border-2 border-line-default hover:border-line-hover`
- Persists: sets `data-theme` attribute on `<html>` element + localStorage key `mtg-theme`
- Default: Warm Stone (no `data-theme` attribute)

### Future Placeholder

```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│  More preferences coming soon │
│  Animations · Token Gallery · │
│  Display density              │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

- Dashed border box: `border border-dashed border-line-default rounded-lg p-6 text-center`
- Text: `text-xs text-content-disabled`
- Sub-label: `text-[10px] font-bold uppercase tracking-wide text-content-faint`

### Removed from Settings

- **Sort By dropdown** — removed. Lives only in WorkspaceToolbar.
- **Sort Direction toggle** — removed. Lives only in WorkspaceToolbar.
- The `sortBy` and `sortDir` imports from `useDeckManager` are no longer needed in Sidebar.tsx.

---

## 5. Tab Content — What's New

Renders the last 5 versions from the `CHANGELOG` object in `src/config/version.ts`.

### Current Version

```
[v1.11.1]  ← blue pill badge

– Focus ring muted on workspace scroll container
– Claude Chat deliverable format rule documented
```

- Version badge: same blue pill style as header
- List: `text-xs text-content-secondary leading-relaxed`
- Dash prefix: `text-content-disabled`

### Previous Versions

```
v1.11.0 — Theme System          ← muted header

– 25 semantic CSS custom properties with dual palette
– Warm Stone default, Zed Dark alternate theme
```

- Version header: `text-[10px] font-bold text-content-disabled`
- Separated by `border-b border-line-subtle` with `my-5` spacing
- Show up to 5 versions total (current + 4 previous)

### Data Source

Iterate over `Object.entries(CHANGELOG).slice(0, 5)` — the CHANGELOG object is already ordered newest-first. No new data structures needed.

---

## 6. Tab Content — About

### Intro

> A visual deck builder and goldfish simulator for Magic: The Gathering.
> A father-son project by Phi and Thurgood. Built for players who love the craft of brewing.

- First line: `text-sm text-content-heading leading-relaxed`
- Second line: same styling, natural paragraph flow

### Team Section

Section label: `text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2` — "Team"

| Icon | Name | Role |
|---|---|---|
| Monogram "P" | Phi | Design, UX, and product direction |
| Monogram "T" | Thurgood Nguyen | Design, UX, and product direction |
| Monogram "A" | Claude · Anthropic | AI implementation partner |

- Monogram circles: `w-8 h-8 rounded-lg bg-surface-raised border border-line-subtle flex items-center justify-center text-xs font-bold text-content-tertiary`
- Name: `text-sm text-content-heading`
- Role: `text-xs text-content-muted`

### Powered By Section

Divider above. Section label: "Powered By"

| Icon | Name | Role |
|---|---|---|
| Monogram "S" | Scryfall | Card data, images, and search API |
| Monogram "▲" | Next.js + Vercel | React framework and hosting |
| Monogram "T" | Tailwind CSS | Utility-first styling |

Same monogram circle styling as Team section. These can be upgraded to real SVG logos in a future release.

### Legal Section

Divider above. Section label: "Legal"

Three paragraphs of small legal text:

1. **WotC Fan Content disclaimer (required):**
   "TheBrewLab is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC."

2. **Scryfall attribution (required):**
   "Card data and images provided by Scryfall. TheBrewLab is not produced by or endorsed by Scryfall."

3. **Trademark notice:**
   "Magic: The Gathering is a trademark of Wizards of the Coast LLC."

- Styling: `text-[10px] text-content-disabled leading-relaxed`
- Each paragraph separated by `mb-3`

---

## 7. Tab Content — Support

### Links

Two clickable rows:

**Buy Me a Coffee**
- Icon: coffee cup SVG (stroke: `#facc15`)
- Title: "Buy Me a Coffee"
- Subtitle: "Support development with a small tip"
- External link: `https://www.buymeacoffee.com/itsmephi`
- Right arrow chevron: `›`

**GitHub**
- Icon: GitHub mark SVG
- Title: "GitHub"
- Subtitle: "itsmephi/mtg-deck-builder"
- External link: `https://github.com/itsmephi/mtg-deck-builder`
- Right arrow chevron: `›`

### Link Row Styling

- Container: `px-3 py-3 rounded-lg border border-transparent hover:bg-surface-raised hover:border-line-subtle transition-colors cursor-pointer`
- Icon: `w-[18px] h-[18px] text-content-tertiary`
- Title: `text-sm text-content-heading`
- Subtitle: `text-xs text-content-muted`
- Arrow: `ml-auto text-content-disabled`

### Future Placeholder

```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│  Bug reports, feature         │
│  requests, and feedback       │
│  Coming soon                  │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

Same dashed placeholder block styling as Preferences tab.

---

## 8. Component Architecture

### New Files

- `src/components/workspace/SettingsView.tsx` — the full settings hub (header, tabs, body). Renders inside the workspace flex container.

### Modified Files

- `src/app/page.tsx` — add `showSettings` state, pass to Workspace and SettingsView. Conditional render: `showSettings ? <SettingsView /> : <Workspace />`.
- `src/components/layout/Sidebar.tsx` — remove `isSettingsOpen` state, settings accordion, changelog accordion. Footer becomes version badge only. Version badge click calls `onOpenSettings("whatsnew")`.
- `src/components/layout/SidebarRail.tsx` — gear icon click calls `onOpenSettings("preferences")` instead of `expandTo("search")`.
- `src/components/layout/Sidebar.tsx` — remove `sortBy`, `setSortBy`, `sortDir`, `setSortDir` imports from useDeckManager (sort controls no longer in settings).
- `src/hooks/useDeckManager.tsx` — add `showSettings` boolean and `setShowSettings` to context (or keep in page.tsx and pass as props — implementation choice for Claude Code).

### State

| Key | Type | Persisted | Notes |
|---|---|---|---|
| `showSettings` | `boolean` | No | Ephemeral — always starts closed on page load |
| `settingsTab` | `"preferences" \| "whatsnew" \| "about" \| "support"` | No | Ephemeral — defaults based on entry point |
| `mtg-theme` | `string` | `localStorage` | NEW — `"zed-dark"` or absent for Warm Stone |
| `mtg-show-thumbnail` | `boolean` | `localStorage` | Existing — unchanged |

### Removed State

| Key | Notes |
|---|---|
| `isSettingsOpen` | Was in Sidebar.tsx — replaced by `showSettings` |
| `isChangelogOpen` | Was in Sidebar.tsx — changelog now lives in What's New tab |

---

## 9. Interaction Details

### Keyboard

- `Escape` closes settings hub (returns to deck view) when `showSettings === true`

### Mobile Behavior

- Settings hub renders in the content area below the stacked sidebar (same as workspace)
- Gear icon in the tab bar: positioned after Search and Decks tabs, right-aligned
- Tab bar scrolls horizontally if tabs overflow on narrow screens
- No collapse rail on mobile — gear icon is always in the tab bar

### Collapsed Rail Behavior

- Gear icon at bottom of rail opens settings hub directly — does NOT expand the sidebar first
- Sidebar stays collapsed while settings hub is visible in the workspace area

### Theme Switching

- Selecting a theme swatch sets `document.documentElement.dataset.theme` for Zed Dark or deletes the attribute for Warm Stone
- Persists to `localStorage` key `mtg-theme`
- On app load: read `mtg-theme` from localStorage and apply before first render (in layout.tsx or a script tag to avoid flash)

---

## 10. What Gets Removed

| Element | Current location | Removed? |
|---|---|---|
| Settings accordion (gear icon toggle) | Sidebar footer | Yes — replaced by settings hub |
| Changelog accordion (version badge toggle) | Sidebar footer | Yes — replaced by What's New tab |
| Coffee icon | Sidebar expanded footer | Yes — moved to Support tab (stays in collapsed rail) |
| Sort By dropdown | Settings accordion | Yes — toolbar only |
| Sort Direction toggle | Settings accordion | Yes — toolbar only |
| `isSettingsOpen` state | Sidebar.tsx | Yes |
| `isChangelogOpen` state | Sidebar.tsx | Yes |

---

## 11. QA Checklist

### Entry Points
- [ ] Expanded sidebar: version badge opens hub → What's New tab
- [ ] Collapsed rail: gear icon opens hub → Preferences tab
- [ ] Mobile: gear icon in tab bar opens hub → Preferences tab
- [ ] Version badge clicked while hub is open → jumps to What's New tab

### Navigation
- [ ] Back chevron closes hub, returns to deck view
- [ ] Escape key closes hub
- [ ] All four tabs render correct content
- [ ] Tab state resets based on entry point (not persisted)

### Preferences Tab
- [ ] Card Preview toggle works, persists to localStorage
- [ ] Theme swatches render with correct gradients
- [ ] Selecting Zed Dark applies `data-theme="zed-dark"` to `<html>`
- [ ] Selecting Warm Stone removes `data-theme` attribute
- [ ] Theme persists across page refresh
- [ ] No flash of wrong theme on load
- [ ] Future placeholder block renders with dashed border

### What's New Tab
- [ ] Shows current version with blue pill badge
- [ ] Shows up to 4 previous versions with muted headers
- [ ] Content matches `CHANGELOG` object in `version.ts`
- [ ] Scrolls correctly if content overflows

### About Tab
- [ ] Intro paragraph displays correctly
- [ ] Team section shows three monogram rows (P, T, A)
- [ ] Powered By section shows three monogram rows (S, ▲, T)
- [ ] Legal section shows all three disclaimer paragraphs
- [ ] WotC disclaimer text matches Fan Content Policy requirements exactly

### Support Tab
- [ ] Buy Me a Coffee link opens correct external URL
- [ ] GitHub link opens correct external URL
- [ ] Both links open in new tab (`target="_blank"`)
- [ ] Future placeholder block renders

### Footer
- [ ] Expanded sidebar footer shows only version badge
- [ ] No coffee icon in expanded footer
- [ ] No gear icon in expanded footer
- [ ] Collapsed rail still shows coffee and gear icons

### Removed Elements
- [ ] No settings accordion in sidebar
- [ ] No changelog accordion in sidebar
- [ ] No sort controls anywhere in settings
- [ ] Sort controls still work in WorkspaceToolbar (unchanged)

### Cross-cutting
- [ ] `npm run build` passes
- [ ] No regressions on deck view functionality
- [ ] Sidebar collapse/expand still works correctly
- [ ] Theme tokens applied correctly in settings hub (uses design token system)
- [ ] Mobile layout: settings hub renders correctly below stacked sidebar
