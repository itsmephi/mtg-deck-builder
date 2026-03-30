---
description: Run the post-APPROVED commit, merge, and push sequence for a release
allowed-tools: Bash(git *)
---

This command runs only after APPROVED has been given for the current release.

1. Confirm current branch is not `main` (should be on `vX.X.X` branch)
2. **Check for uncommitted source changes** — run `git status --short`. If any files outside of `CLAUDE.md`, `CHANGELOG.md`, `REVIEW.md`, `BACKLOG.md`, and `docs/ARCHITECTURE.md` are modified or untracked, STOP and output:
   > "Uncommitted source changes detected. Commit them first with a descriptive message (`git add src/ docs/vX.X.X-*-spec.md && git commit -m '...'`), then re-run /commit-release."
   Do not proceed until source files are committed.
3. Stage and commit all session files:
   - `git add CLAUDE.md CHANGELOG.md REVIEW.md BACKLOG.md docs/ARCHITECTURE.md`
   - `git commit -m "update CLAUDE.md, CHANGELOG.md, REVIEW.md, and BACKLOG.md post $ARGUMENTS"`
4. Switch to main and merge:
   - `git checkout main`
   - `git merge $ARGUMENTS`
   - `git push`
5. Delete the working branch (local and remote):
   - `git branch -d $ARGUMENTS`
   - `git push origin --delete $ARGUMENTS`
6. Report success or any merge conflicts

Usage: `/commit-release vX.X.X`
