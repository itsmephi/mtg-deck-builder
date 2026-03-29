# Design Guide — TheBrewLab
<!-- Claude Chat reference for feature design sessions. Attach alongside CLAUDE.md. -->
<!-- Last updated: v1.18.1 -->

This document governs how features are designed before implementation. Apply it in every Claude Chat design session.

---

## Roles

- **Claude Chat** — designs features, fills in the spec template, runs the checklist, flags unvalidated decisions
- **Claude Code** — reads the finished spec and implements; finds its own touch points via Grep (do not include file paths or touch points in specs)
- **Phi** — approves specs before implementation begins

Claude Chat never writes code. Claude Code never makes design decisions.

---

## Spec Content Rules

Specs must be **design-dense and pattern-reference-lean.**

**Include:**
- What the user sees and does (behavior, states, transitions)
- New data shapes or types (only if genuinely new)
- Non-obvious edge cases
- Explicit decisions on anything that could go either way (and why)

**Omit:**
- Existing patterns Claude Code can read from the repo
- File structure, component hierarchy, or file paths — Claude Code finds these
- React/framework basics
- Restatements of how the current feature works (unless it's changing)

A good spec describes *decisions*. A bloated spec describes *how to code them*.

---

## Spec Template

Every feature spec must use this structure. Do not skip sections — mark them "N/A — [reason]" if genuinely not applicable.

```markdown
# vX.X.X — [Feature Name]

## Overview
One paragraph: what problem this solves and what changes.

## Data Model
New fields, types, or migrations only. Omit if nothing changes.

## Behavior
What the user sees and does. Be exhaustive — cover every interaction.

## State Tables
One table per view that this feature touches (grid / list / modal / sidebar).
"Same as grid" is not acceptable — write the full table for each view.

| State | Appearance | On hover | On click |
|-------|-----------|----------|----------|

## Intersection States
For every new visual state on a shared element, define what happens when
this new state AND each existing state are active simultaneously:
- + format violation / copy limit warning
- + disabled / locked state
- + any other active state on the same element

State precedence: which wins and why.

## Visual Consequence Chain
For each state change, list ALL visual effects:
- Interactive controls (buttons, steppers, toggles)
- Number / text colors
- Stat totals or derived values in other panels
- Any other UI that reads from this state

## Edge Cases
Non-obvious cases that need explicit handling.

## Unvalidated Decisions
Any decision that could reasonably go either way. Flag these explicitly.
These must be resolved via prototype or Phi sign-off before spec is finalized —
not left to QA discovery.

## Out of Scope
List what is not changing. Then cross-check each item:
does the new feature visually or behaviorally overlap with it?
If yes, move it into scope above.
```

---

## Design Checklist

Run through this in full before marking a spec ready for implementation.

### Core
- [ ] What does the user see by default / on first load?
- [ ] What happens on every user interaction?
- [ ] What are the empty states? (no data, zero results, etc.)
- [ ] What are the error states?
- [ ] How does it behave at maximum scale? (100 cards, long names, etc.)
- [ ] How does it look in every view? (grid, list, modal, mobile)
- [ ] Is the behavior obvious to someone who has never seen it before?
- [ ] Does this match or intentionally diverge from existing behavior?

### Standard UI Behavior
- [ ] If clicking an item in a list/dropdown makes it active, does that work from any item regardless of current active state?
- [ ] Does every action inside a dropdown define whether it closes or stays open?
- [ ] Any time a view switch is designed, what is the behavior if the user is not already in the expected context?
- [ ] Any new state introduced — does it need to survive a refresh? If yes, it must be persisted.
- [ ] Are tooltips only on non-obvious controls?
- [ ] Are tooltips consistent across all views for the same control?
- [ ] Do all tooltips have a max-width cap?

### Multi-State & Cross-Feature
- [ ] **Intersection states:** For every new visual state on a shared element, what does it look like when this new state AND each existing state (warning, violation, error, disabled) are active simultaneously? Which wins?
- [ ] **Cross-view state parity:** Full state table written for EACH view (grid, list, modal). No "same as grid" shortcuts.
- [ ] **Visual consequence chain:** For each state change, all visual effects listed — controls, colors, totals, derived values.
- [ ] **"Out of scope" cross-check:** For each item declared out of scope, confirmed it has no visual or behavioral overlap with the new feature.
- [ ] **Unvalidated decisions flagged:** Any decision that could go either way is marked and resolved before sign-off, not left to QA.
- [ ] **State transition tables for non-obvious toggles:** Any toggle with more than two outcomes (e.g. first-activation / deactivation / re-activation) is expressed as a table, not prose.

### Visual Spec
- [ ] Any spec touching row or cell backgrounds explicitly addresses: transparency behavior, hover state coexistence, layering with existing styles.
- [ ] Concrete values given for positioning and sizing — no "may need adjustment" deferred to implementation.

---

## Prototype Governance

### When to build a prototype

Build one when the spec has unvalidated design decisions, complex animations, or new interaction patterns that need visual proof before implementation. Do not build one for straightforward behavior changes — a well-written spec is sufficient.

### Format

HTML + CSS only. No React, no Tailwind, no framework code. Prototypes are for validating visual targets and interaction feel — Claude Code implements in React/Tailwind independently and does not copy prototype code.

### Annotation convention

Every value Claude Code will need must be marked with an `IMPL:` comment. This allows Claude Code to Grep for all key values in a single call instead of reading the full file.

```css
/* IMPL: badge-bottom: calc(40% - 14px) — badge center sits on overlay top edge */
/* IMPL: overlay-height: 40% — used for badge position calc */
/* IMPL: animation: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) — badge slide-up */
/* IMPL: badge-not-owned-bg: rgba(30, 28, 24, 0.95) */
/* IMPL: badge-fully-owned-bg: rgba(74, 222, 128, 0.85) */
```

Label every annotated value clearly — what it controls and why it was chosen.

### Prototype-to-spec handoff rule

Every `IMPL:` value validated in the prototype must be explicitly carried into the spec with a concrete value. No "may need adjustment" notes in the spec — if the prototype settled it, the spec states it. Claude Code reads the spec as its source of truth, not the prototype.

### What prototypes are not

- Not a spec replacement — the spec still covers all behavior, states, and edge cases
- Not production code — Claude Code does not copy or adapt prototype markup
- Not a substitute for the design checklist — run the checklist against the spec, not the prototype

---

## Final Sign-Off Gate

Before submitting a spec for implementation, Claude Chat must run this:

> "I will now run the multi-state and cross-feature checklist against the spec and confirm each item is covered or explicitly marked out of scope."

This pass-through is required. Do not submit the spec until it is complete.
