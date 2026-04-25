# Decision Log — Project Brew

<!-- 
  Owned by: Claude.ai / Phi
  Updated after: any significant product or design decision
  Format: version, decision, rationale (one-liners preferred for routine entries; longer for foundational ones)
  Purpose: preserve the "why" that lives in Claude.ai conversations but evaporates between sessions
-->

## v1.21.0 — Search as Find-by-Name

### Search tab replaced with inline FindByNameBar
The sidebar Search tab, SearchWorkspace, and all discovery-shaped UI (NLP parser, category chips, FilterPanel, sidebar filters) were removed. A persistent find-by-name bar now lives at the top of the deck workspace. Type a card name → autocomplete → select → preview with art variants, oracle text, and product details → add to deck or sideboard. This directly implements the v1.20.0 decision to treat search as "find a card I already know I want" rather than a discovery surface.

### All discovery-shaped features cut, not deferred
CategoryChips, FilterPanel, nlpParser, and the full SearchWorkspace assembly were removed outright rather than parked. The code was large, complex, and built against the old "be a better EDHrec" model. Keeping it as dead code would be a maintenance liability. If discovery features return, they belong in Brew mode with a different shape.

### Preview overlays the deck workspace
Initial spec called for the preview to push the deck content down. After implementation, overlay (absolute positioning over the workspace) was clearly less disruptive — the deck stays in place while the user is in the preview flow. Deck content temporarily covered by a focused task is good UX; pushing content around is not.

### Artist search link is a v1.21.0 casualty
CardModal previously had a clickable artist name that triggered a search query in SearchWorkspace. That path is gone. The feature is noted in the backlog as a Phase 1 enhancement — the right solution is something like pre-filling the FindByNameBar with artist syntax, but it needs design before implementation.

### Capture path parked pending real-use signal
Drag-from-URL currently commits directly. The intent (drag → preview → confirm) requires a spec and is parked until v1.21.0 has been used enough to know what the UX pain points actually are. The destination UI (FindByNameBar preview) is now built; the entry path spec is the remaining work.

---

## v1.20.0 — Foundation Reset

This version is not a feature release. It's a strategic reset following a project retrospective with Phi and Thurgood. The decisions below redefine what Project Brew is, who it's for, and how we'll build it going forward. Earlier decisions live in specs and git history and remain valid for the engine layer; the surface layer is being reconsidered against the new foundation.

### Workflow streamlined for nights-and-weekends pace
The original workflow (gating `/plan` reviews on most changes, mandatory checklist runs before any spec, full template required regardless of feature size) was useful when Phi was learning what good Claude Code output looks like. Now that's known, the gates are friction. New shape:
 
- **Default is direct work.** Claude Code does the change and explains after. `/plan` becomes opt-in for tricky changes, not a default review gate.
- **Three tiers explicit.** Direct work (most things) → lightweight spec (one or two decisions) → full spec (data model, multi-screen, engine contracts). Tier up only when the change earns it. Ceremony has a cost.
- **Post-version checklist trims to three items.** Version sync, staleness scan, flag PRODUCT/DECISIONS changes. Everything else folded into the work itself.
### DESIGN-CONTEXT.md retired in favor of a skill
The document existed because CLAUDE.md was Claude Code's home and design context needed somewhere else to live. After the workflow streamline, the substantive parts (principles, patterns) were already in PRODUCT.md and DECISIONS.md — the document was mostly carrying gating ceremony that's now cut. The remaining useful pieces (design checklist, spec template, "what good looks like" framing) moved into a `project-brew-design` skill that loads only when designing features. Loads when relevant, invisible otherwise. No third document to keep in sync.

### The user is Thurgood
Project Brew is designed for Thurgood Nguyen specifically — a 13-year-old MTG player advancing rapidly in the hobby. Other users are welcome and their feedback is valuable, but design tradeoffs resolve in Thurgood's favor. We do not design for "kids broadly" or "casual players generally" — the resulting compromises would dull the product. Generosity in distribution; sharpness in design.

### Project Brew is not a discovery tool
Earlier versions trended toward "be a better EDHrec" — a direction driven by Phi's ambition, not Thurgood's needs. Thurgood is happy using EDHrec, MTG Goldfish, and TCGplayer for discovery. Project Brew's job is *everything after discovery*: capture, build, reconcile, purchase. We integrate with the discovery sites (drag from URL, paste decklists) rather than competing with them.

### Brewing is a feature, not a product pillar
Thurgood defined "brewing" as "find new cards and finding cards that work well with or similar to the cards already in the deck." This is *contextual suggestion based on the deck in progress* — solvable with Scryfall data — not "sift through millions of public decklists" — which we cannot solve as a two-person team. Brewing will be added as a mode that extends the deck, not as a replacement for external discovery.

### Art swap is core, not polish
The ability to swap art and have that swapped variant persist in the deck and flow through to purchase is one of the app's defining features and a key reason Thurgood uses it. The current CardModal implementation works but treats art swap as one of many things the modal does. Future redesign should center the art-swap-as-creative-act framing.

### The core loop is Capture → Build → Reconcile → Purchase
Discovery is explicitly outside this loop. Brewing extends the Build step but is not a fifth pillar.

### Public access, no business model
Public release means free, no paywall, no ads, optional accounts for cross-device sync. Buy Me a Coffee is the entire monetization plan. The motivation is generosity — helping other kids who are stuck in the chrome-tabs problem Thurgood started in. Not a business.

### Hybrid rebuild strategy
The engine (data layer, format rules, commander/partner logic, color identity, Scryfall integration, NLP parser) is genuinely hard-won and aligned with the goal — it stays. The surface (IA, sidebar, modal, search-as-discovery framing, mobile experience, settings sprawl) is misaligned with the new foundation — it gets rebuilt. The current app stays continuously deployable throughout the rebuild; nights-and-weekends pace, no urgency.

### Search becomes find-by-name, not discovery
Most current search UX (NLP parser, category chips, sidebar filters) was built for discovery. Thurgood mostly knows the card name when adding — he found it on EDHrec. Search will be simplified into a fast find-by-name affordance. Discovery-shaped features (chips, complex filters) become candidates for cutting.

### Mobile-responsive design is real engineering work
The current PWA was designed for desktop and shrunk to fit. iPad usage is currently clunky enough to be near-unusable. A real mobile-responsive design is a significant investment and will be planned as such, not bolted on.

### Internal name "thebrewlab" is retired
Going forward the project is "Project Brew" both internally and externally. The name remains a working title pending a public-launch trademark and domain check.

### Document ownership clarified
- Claude.ai owns the *why and what*: PRODUCT.md, DECISIONS.md, specs.
- Claude Code owns the *how*: CLAUDE.md, ARCHITECTURE.md, SCHEMA.md, DESIGN-CONTEXT.md, CHANGELOG.md.
- Specs are drafted here, committed in repo, immutable after implementation.
- BACKLOG.md is shared.

This replaces the previous ownership in CLAUDE.md where DESIGN-CONTEXT.md was Claude Code-owned but designed-against here. The new arrangement matches actual workflow.
