---
name: commit
description: Run checks, commit with AI message, and push
---

1. Run quality checks:
   ```bash
   npm run lint && npm run typecheck
   ```
   Fix ALL errors before continuing.

2. Review changes: `git status` and `git diff`

3. Generate commit message:
   - Start with verb (Add/Update/Fix/Remove/Refactor)
   - Be specific and concise
   - One line preferred

4. Commit and push:
   ```bash
   git add -A
   git commit -m "$(cat <<'EOF'
   [Your generated message here]

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   EOF
   )"
   git push
   ```
