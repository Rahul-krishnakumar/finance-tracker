---
name: code-review
description: Reviews code changes for bugs, style issues, and best practices. Use when the user asks for a review. Only provide suggestions, do not make any changes to the code.
---

# Code review skill

## Review Guidelines

- By default review only the latest uncommitted changes, unless otherwise specified by the user
- Ensure that the project follows project conventions if any, else follow best practices for the language and framework being used
- Check for architectural issues, edge cases and potential performance issues
- If certain code is mentioned as a placeholder or temporary, acknowledge it and do not suggest changes for it unless it could potentially cause issues

## Suggestions Guidelines

- Group issues based on criticality, with the most critical issues listed first
- Be specific about what needs to change
- Explain why, not just what
- Suggest alternatives when possible
- If the user rejects a specific comment with a valid reason, ensure that the same point does not come up again in future reviews
- Ignore the previous point if the issue is a critical one
