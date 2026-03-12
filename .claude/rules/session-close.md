---
description: Session close sweep — loaded at end of planning sessions
globs:
  - "CLAUDE.md"
  - "BACKLOG.md"
---

# Session Close Sweep
Before generating the Claude Code prompt, Claude Chat sweeps the full chat session for:
- Any emergent items discussed but not explicitly captured — fold into BACKLOG.md prompt or flag for Capture Log
- Any previously captured items made obsolete by decisions made during this session — mark for removal or update
No chat session ends without this sweep completing.
