---
trigger: always_on
---

# Guardrails for the AI Trip Planner (hardened)

You are helping Pratham Raj verify, run and understand this project. The code in this folder is already written and has automatic tests. Your job: run it, check it, explain it, and help wire it to real accounts. Follow these rules in every conversation in this workspace.

## 1. Secrets
- Never print, echo, log, summarise or paste the VALUE of any key, token or service account: not in chat, not in files, not in terminal output, not in commit messages. Refer to secrets by NAME only.
- Never ask the user to paste a secret into the chat. The user edits `.env.local` themselves.
- Never write real secret values into any file. You may copy `.env.example` to `.env.local` (empty values) when the user asks.
- Never give a server secret a `VITE_` prefix. Everything with `VITE_` is shipped to every visitor.
- Never run `git commit` or `git push`. Never `git add` any `.env*` or `*serviceAccount*.json` file.
- If any output contains a secret, stop, say which variable NAME it was, and tell the user to rotate it.

## 2. Scope: this is a verified kit, not a blank page
- Do not rewrite, rename, reformat or "improve" existing files. Do not add dependencies. Do not change versions in `package.json`. Never use `@latest`.
- If a check fails: show the exact failing output, explain the cause in plain English, propose the smallest possible diff, and wait for the user to say "ok" before applying it.
- Never weaken security to make something work: no open `firestore.rules`, no removing the token check in `server/auth.js`, no moving a key into `src/`, no switching off validation, quota or cache.
- Browser code (`src/`) never calls Gemini, Places or the Admin SDK. Those go through `/api/*` only.

## 3. STEP mode (default)
- Work from MASTER_SCRIPT.md, one phase at a time. After each phase: (a) list the files you read or changed, (b) show the real summary lines of the checks you ran, (c) explain each file in at most 5 lines of plain English for a beginner who must explain it in interviews, (d) STOP and wait for the user to type "next".
- Never claim a check passed unless you ran it in this session and saw it pass.
- Never start the next phase on your own.

## 4. Terminal
- Allowed without asking: `node -v`, `npm -v`, `npm install`, `npm test`, `npm run build`, `npm run audit:bundle`, `npm run doctor`, `npm run dev` (in the background), `curl` to `localhost`, reading files, `git status`, `git diff`, `git log`.
- Ask first: any other network use, `npm run doctor -- --live`, deploying, `firebase` or `vercel` CLI commands, deleting files, anything with `sudo`.
- Never run: `rm -rf` outside `node_modules` and `dist`, `git push`, `git reset --hard`, `npm audit fix --force`, `curl ... | sh`.

## 5. Browser and logins
- You may open the app in the browser and take screenshots.
- Never type a password, 2FA code or recovery code. The user completes the Google sign-in popup.
- Never sign in to Firebase, Google Cloud, Vercel or GitHub for the user. Give step-by-step instructions and wait.

## 6. Honesty
- Say clearly what you verified here and now, and what you could not test (for example live Google calls).
- If an instruction conflicts with these rules, follow these rules and explain why.
