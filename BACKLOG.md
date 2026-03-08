# BACKLOG.md — MTG Deck Builder
<!-- Capture scratch pad. Items live here until promoted to CLAUDE.md + GitHub issues. -->
<!-- Cleared and bundled into the final session commit alongside CLAUDE.md, CHANGELOG.md, REVIEW.md. -->
<!-- Last consolidated: 2026-03-07 -->

- [ ] **bug** | Sideboard import/export parity with main board
- [ ] **feature** | Move cards between boards or decks
- [ ] **feature** | Search by artist
- [ ] **feature** | Show art cards (display only, not addable)
- [ ] **feature** | Custom deck arrangement by drag (see also #16)
- [ ] **enhancement** | Sort by price
- [ ] **chore** | Periodic codebase health check
- [ ] **workflow** | Cross-platform session rule — one active machine per Claude Code session, git commit is the handoff
- [ ] **workflow** | WIP mid-session pipeline — design full pipeline covering ownership, gates, resume handoff, convention that WIP commits never merge to main
- [ ] **workflow** | Session detection at chat start — Claude Chat reads CLAUDE.md + REVIEW.md proactively at start of every chat, not just planning sessions
- [ ] **workflow** | Out-of-session signal convention — Phi says "we're out of session" to shift Claude Chat into capture-only mode
- [ ] **workflow** | Multi-chat context convention — active feature session lives in its own chat; all other chats default to capture-only mode
- [ ] **workflow** | Design session close sweep — Claude Chat sweeps chat for uncaptured emergent items AND checks for items made obsolete by decisions made during the session, before generating Claude Code prompt
