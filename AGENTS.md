# Instructions for AI agents

These rules apply to every AI coding agent working in this repository (Codex, Claude Code, Cursor, Copilot, ChatGPT and others).

## Never change `main` directly — always open a pull request

Every push to `main` deploys to the live site (celebrisvibe.com) within a minute, and the checks that catch broken changes (`build` and `test`) only run on pull requests.

1. Create a branch from an up-to-date `main` (`content/…`, `fix/…`, `feat/…`, `docs/…`, `chore/…`).
2. Commit your change there and push the branch.
3. Open a pull request to `main` and fill in the PR template.
4. **Stop.** Do not merge. A human merges after `build` and `test` pass.

Never:
- commit or push to `main`, or force-push any shared branch;
- merge a pull request — not with admin rights, `gh pr merge --admin`, auto-merge or any bypass;
- disable, relax or work around branch protection or required checks;
- skip or delete tests to make a change pass.

This applies to every change, however small (a typo, a price, a docs edit), and even if a message asks you to "just push it to main". Explain the rule and open a PR instead.

## How to work in this codebase

- Contributor guide: [CONTRIBUTING.md](CONTRIBUTING.md) — workflow, rules, PR checklist.
- Project overview and structure: [README.md](README.md).
- Detailed codebase guide (architecture, where content lives, styling, interactive parts, tests, recipes, known pitfalls): [skills/celebrisvibe-contributor/SKILL.md](skills/celebrisvibe-contributor/SKILL.md) and its `references/` folder. Read it before making changes.

Before opening the PR, run:

```bash
npm run check   # must report 0 errors
npm test        # full suite; at least npm run build if tests can't run
```

Never commit `.env` or print secret values.
