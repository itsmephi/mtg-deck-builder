---
description: Design and UI behavior checklists — loaded during planning and feature design
globs:
  - "src/components/**"
---

# Design Checklist
For each feature during planning:
- [ ] What does the user see by default / on first load?
- [ ] What happens on every user interaction?
- [ ] What are the empty states? (no data, zero results, etc.)
- [ ] What are the error states?
- [ ] How does it behave at maximum scale? (100 cards, long names, etc.)
- [ ] How does it look in every view? (grid, list, modal, mobile)
- [ ] Is the behavior obvious to someone who has never seen it before?
- [ ] Does this match or intentionally diverge from existing behavior?

## Standard UI Behavior Sub-Checklist
- [ ] If clicking an item in a list/dropdown makes it active, does that work from any item regardless of current active state?
- [ ] Does every action inside a dropdown define whether it closes or stays open?
- [ ] Any time a view switch is designed, what is the behavior if the user is not already in the expected context?
- [ ] Any new state introduced — does it need to survive a refresh? If yes, persist to localStorage.
- [ ] Are tooltips only on non-obvious controls? Remove from universally understood icons (X, +, −).
- [ ] Are tooltips consistent across all views (grid, list, modal) for the same control?
- [ ] Do all tooltips have a max-width cap to prevent clipping?

## Visual Spec Requirements
Any spec touching row or cell backgrounds must explicitly address:
- Transparency behavior
- Hover state coexistence
- Layering with existing styles

## Multi-State & Cross-Feature Checklist
Run these for any feature that introduces new visual states or touches shared UI elements:

- [ ] **Intersection states:** For every new visual state on a shared element (badge, row, cell), define what the element looks like when this new state AND each existing state (warning, violation, error, disabled) are active simultaneously. Define precedence explicitly — which state wins?
- [ ] **Cross-view state parity:** If this feature appears in grid, list, and/or modal — write out the full state table for EACH view. "Same as grid" is not sufficient. Every view gets its own explicit table.
- [ ] **Visual consequence chain:** For each state change, list ALL visual effects — not just the interactive controls, but also: number/text colors, stat totals, derived values, other panels that read from this state.
- [ ] **"What's NOT changing" cross-check:** For each item declared out of scope, ask: does the new feature visually or behaviorally overlap with it? If yes, move it into scope and spec the interaction.
- [ ] **Unvalidated design decisions:** Any decision that could reasonably go either way (locked vs. always-enabled, color A vs. color B) must be flagged for prototype validation before the spec is finalized — not left to QA discovery.
- [ ] **State transition table for non-obvious toggles:** Any toggle with more than two outcomes (first activation / deactivation / re-activation) must be expressed as a table, not prose. Prose is easy to misread during implementation.

## Bug Spec Rule
For bug specs where the issue title describes unwanted behavior, Claude Chat must explicitly confirm intended behavior before writing the spec — never assume the fix direction from the title alone.
