---
description: Read-only security review of this project against its own threat model
---

Read-only. Change nothing. Never print secret values.

1. Secrets in the browser: run `grep -rEn "GEMINI|PLACES_API|SERVICE_ACCOUNT|generativelanguage|places\.googleapis" src/` and expect no matches. Then run `npm run build` and `npm run audit:bundle`.
2. Login first: open every file in `server/handlers/` except `health.js`. Confirm each calls `requireUser` before doing anything else.
3. Firestore rules: read `firestore.rules`. In plain English, say who can read, create, update and delete `users/{uid}/trips/*`, `usage/*` and `tripCache/*`. Confirm there is no `if true`.
4. Validation: confirm `server/input.js` validates the request and `server/tripSchema.js` validates the AI reply before `server/tripService.js` saves anything.
5. Abuse limits: list the limits in `server/config.js` (daily per user, daily global, cache time) and the burst limits in `server/handlers/`.
6. Git hygiene: run `git ls-files | grep -Ei "\.env|serviceaccount|adminsdk"` and expect only `.env.example`. If this is not a git repository, say so.

Report a table: check | pass/fail | one-line evidence. Then name the 3 biggest remaining risks in plain English.
