---
description: Branch workflow — auto-branch, WIP commits, cleanup
alwaysApply: true
---

# Branch Workflow

## Never Work on Main
All changes happen on a branch. Before any file edits, check current branch:
- If on `main` and starting a milestone → checkout or create `vX.X.X` (matching the release version)
- If on `main` and starting a hotfix → create `hotfix-{short-description}`

Don't wait for instruction. Don't suggest "main is fine for small fixes."

## WIP Commits
Manual, on-demand. User will say "WIP commit and push" when pausing mid-release. Not automatic between prompts.

## Branch Cleanup
After `/commit-release` merges to main, delete the working branch. A remote branch only exists if it was ever pushed (WIP commit or explicit push). Use:
```bash
git branch -d vX.X.X
git ls-remote --exit-code origin vX.X.X && git push origin --delete vX.X.X || true
```
The `ls-remote` check prevents an error when the branch was local-only.
