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
- [ ] **bug** | Owned counter should support inline typing like qty counter
- [ ] **bug** | Tooltips should appear after a longer hover delay; remove tooltips from intuitive icons (+ and −)
- [ ] **bug** | Sort ascending/descending toggle has no tooltip
- [ ] **bug** | Sort dropdown has no tooltip on hover
- [ ] **feature** | Dark/light theme toggle or match system theme
- [ ] **feature** | TCGPlayer and Card Kingdom buy buttons on row 2, right-justified; possibly move value and to-buy stats there too
- [ ] **feature** | Clicking a card price opens that card on TCGPlayer
- [ ] **feature** | Mark a card as Commander; enforce Commander rules
- [ ] **feature** | Show card price on set in CardModal (similar to grid view / swap art previews)
- [ ] **feature** | Additional card info in CardModal — rarity, foil/non-foil, set code (e.g. BLB)
- [ ] **feature** | Default new deck name is "Untitled" in gray (unsaved state); turns white and saves when user enters a name
- [ ] **feature** | Major search sidebar redesign — functionality and UI overhaul
- [ ] **v2.0** | Mobile version — cleaner, tighter, more intuitive for vertical small screens
- [ ] **v2.0** | UI/UX overhaul
- [ ] **enhancement** | Visual separator/padding between sort groups (color or mana value) when not in group-by-type mode
- [ ] **enhancement** | Revisit "owned" behavior — consider inverting so owned = full brightness, unowned = grayed out
- [ ] **review** | Version badge — revisit behavior of clicking badge to open popup; explore better solutions
- [ ] **workflow** | Release workflow update — Claude Code merges to main and pushes after APPROVED; only manual step for Phi is syncing the Claude project
- [ ] **workflow** | Steam Deck dev environment — document in CLAUDE.md: second env alongside Windows (Zed on Steam Deck, Linux/Arch), always git pull before starting a session and git push after, Node installed via nvm (not pacman) to survive SteamOS updates, Claude Code authenticated separately
- [ ] **workflow** | Claude Code allowed tools config — whitelist Bash(git *) and Bash(npm *) to reduce confirmation prompts; add note to CLAUDE.md Key Technical Notes that this is intentional
- [ ] **workflow** | If Claude Code has already pushed, new items go in the Capture Log — no exceptions
- [ ] **workflow** | Capture Log as universal fallback — always the safe landing spot regardless of mode in any other chat; Claude Code never reads it directly
