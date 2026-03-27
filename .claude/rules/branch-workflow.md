# Branch Workflow

## Never Work on Main
All changes happen on a branch. Before any file edits, check current branch:
- If on `main` and starting a milestone → checkout or create `dev`
- If on `main` and starting a hotfix → create `hotfix-{short-description}`

Don't wait for instruction. Don't suggest "main is fine for small fixes."

## WIP Commits
Manual, on-demand. User will say "WIP commit and push" when pausing mid-release. Not automatic between prompts.

## Branch Cleanup
After `/commit-release` merges to main, delete the working branch (local and remote).
