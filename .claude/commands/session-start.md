---
description: Run the session start checklist — verify backlog sync, review status, version consistency
allowed-tools: Bash(git *), Read, Glob
---

Run the session start checklist:

1. Read BACKLOG.md — find the latest consolidation timestamp at the bottom
2. Read REVIEW.md — confirm it shows APPROVED ✅ with no open carry-forwards
3. Read CLAUDE.md — get the current version number
4. Read CHANGELOG.md — get the latest version entry
5. Read src/config/version.ts — get APP_VERSION
6. Compare: CLAUDE.md version, CHANGELOG.md latest entry, and version.ts must all match
7. Run `git log --oneline -5` to check for any unclosed issue references

Report findings as a checklist:
- [ ] Backlog consolidation timestamp: [timestamp found]
- [ ] REVIEW.md status: [APPROVED / carry-forwards found]
- [ ] Version consistency: CLAUDE.md [X] / CHANGELOG.md [X] / version.ts [X]
- [ ] Recent commits: [any issues]

If any check fails, flag it clearly and stop. Do not proceed with any work until all checks pass.
