---
description: Capture bugs, features, enhancements, or ideas directly into BACKLOG.md
allowed-tools: Bash(git *), Read, Write, Edit
---

Capture new item(s) into BACKLOG.md's Pipeline section.

Parse the input from $ARGUMENTS:
- If an item starts with a label keyword followed by a colon (e.g. "bug:", "feature:", "enhancement:", "chore:", "v2.0:"), use that label
- If no label is provided, infer the most appropriate one from the description
- Valid labels: bug · feature · enhancement · chore · workflow · v2.0
- Multiple items can be separated by semicolons or newlines — add each as a separate line

Steps:
1. Read BACKLOG.md
2. Find the `## Pipeline` section
3. Append new line(s) at the end of the Pipeline section (before the next `---` or `##` heading):
   `- [ ] **label** | description`
4. Save the file
5. Commit: `git add BACKLOG.md && git commit -m "capture: short summary of item(s)"`
6. Report what was added

Examples:
- `/capture bug: hover tint lost when sorting by color`
- `/capture the sideboard total should include main deck pricing`
- `/capture bug: hover tint lost; enhancement: sideboard pricing should include main deck; v2.0: drag to reorder cards`
