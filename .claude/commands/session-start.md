---
description: Run the session start checklist — verify review status and version consistency
allowed-tools: Bash(git *), Read, Glob
---

Run the session start checklist:

1. Read REVIEW.md — confirm it shows APPROVED ✅ with no open carry-forwards
2. Read CLAUDE.md — get the current version number
3. Read CHANGELOG.md — get the latest version entry
4. Read src/config/version.ts — get APP_VERSION
5. Compare: CLAUDE.md version, CHANGELOG.md latest entry, and version.ts must all match
6. Run `git log --oneline -5` to check for any unclosed issue references

Report findings as a checklist:
- [ ] REVIEW.md status: [APPROVED / carry-forwards found]
- [ ] Version consistency: CLAUDE.md [X] / CHANGELOG.md [X] / version.ts [X]
- [ ] Recent commits: [any issues]

If any check fails, flag it clearly and stop. Do not proceed with any work until all checks pass.
