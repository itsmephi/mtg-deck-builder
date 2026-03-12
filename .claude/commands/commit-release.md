---
description: Run the post-APPROVED commit, merge, and push sequence for a release
allowed-tools: Bash(git *)
disable-model-invocation: true
---

This command runs only after APPROVED has been given for the current release.

1. Confirm current branch is not `main` (should be on `vX.X.X` branch)
2. Stage and commit all session files:
   - `git add CLAUDE.md CHANGELOG.md REVIEW.md BACKLOG.md`
   - `git commit -m "update CLAUDE.md, CHANGELOG.md, REVIEW.md, and BACKLOG.md post $ARGUMENTS"`
3. Switch to main and merge:
   - `git checkout main`
   - `git merge $ARGUMENTS`
   - `git push`
4. Report success or any merge conflicts

Usage: `/commit-release vX.X.X`
