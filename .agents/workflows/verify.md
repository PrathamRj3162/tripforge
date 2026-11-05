---
description: Run every automatic check (tests, build, bundle audit) and report the real results
---

Run these in order. Paste the summary lines of each. Stop at the first failure and explain it.

1. `node -v` (must be 20 or newer)
2. `npm install` (skip if `node_modules` exists and `package.json` has not changed)
3. `npm test` and expect `# fail 0`
4. `npm run build` and expect a line containing `built in`
5. `npm run audit:bundle` and expect `PASS`
6. `git status --short` and confirm no `.env*` or service-account file is listed. If this folder is not a git repository, say so and skip this step.

End with a table: check | result | evidence. Do not run anything else.
