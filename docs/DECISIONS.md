# Decision Log — Project Brew

<!-- 
  Owned by: Claude.ai / Phi
  Updated after: any significant product or design decision
  Format: version, decision, rationale (one-liners preferred for routine entries; longer for foundational ones)
  Purpose: preserve the "why" that lives in Claude.ai conversations but evaporates between sessions
-->

## v1.20.0 — Foundation Reset

This version is not a feature release. It's a strategic reset following a project retrospective with Phi and Thurgood. The decisions below redefine what Project Brew is, who it's for, and how we'll build it going forward. Earlier decisions live in specs and git history and remain valid for the engine layer; the surface layer is being reconsidered against the new foundation.

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
