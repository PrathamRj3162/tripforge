# MASTER SCRIPT: AI Trip Planner (hardened kit v2)

This folder is a finished, tested project. The Antigravity agent does not write it from scratch: it verifies it, wires it to your accounts, runs it and teaches it to you, one phase at a time (STEP mode). You stay in control of every key and every login.

## 0. Start here

1. Unzip into an **empty folder** so that `package.json` sits next to this file. In Antigravity: File > Open Folder.
2. Agent panel settings:
   - Mode: **Planning**.
   - Model: the strongest Gemini model in the picker. You mentioned Gemini 3.8: choose it with the highest reasoning level if it is listed. The prompt does not depend on the model.
   - Terminal commands and plan/artifact reviews: set them to **ask before running** (the setting names differ between versions).
   - Check that the rule `guardrails` shows **Always On** (Customizations > Rules). It lives in `.agents/rules/guardrails.md`.
3. Paste this kickoff prompt:

```
You are my build partner for the "AI Trip Planner (hardened)" project in this folder. The code is already written and has automatic tests. You will verify it, help me wire it to my own accounts, run it, and teach me how it works.

1. Read .agents/rules/guardrails.md, then MASTER_SCRIPT.md (all of it), then README.md (sections "Architecture" and "Security model").
2. Work in STEP mode: do exactly ONE phase from MASTER_SCRIPT.md section 3, then stop. For each phase: list the files you read or changed; run that phase's checks and paste the real summary lines of the output; explain every file in the phase in plain English (max 5 lines each; assume I am a beginner who must explain this project in interviews); then ask me to type "next".
3. Never ask me to paste a key into the chat, never print a secret value, never commit, never deploy without asking. I will edit .env.local myself.
4. If a check fails, show the exact error, explain the cause, propose the smallest fix as a diff, and wait for my "ok". Do not refactor or add dependencies.
5. Start now with Phase 0. Do not start Phase 1 until I say "next".
```

Two shortcuts exist as slash commands: `/verify` (tests, build, bundle audit) and `/security-audit` (read-only review).

## 1. What changed from the v1 kit

| | v1 kit (the 2024 video) | v2 (this kit) |
|---|---|---|
| Gemini and Places keys | In the browser bundle | Server environment only; browser calls `/api/*` |
| Login | Google profile saved in localStorage | Firebase Auth; every API call carries a verified ID token |
| Firestore | Open to everyone | Owner-only read/delete, server-only writes, default deny |
| AI output | `JSON.parse` and trust | Normalised, schema-validated, repaired, fallback model, refund on failure |
| Cost control | None | Daily per-user and global quota, shared cache, burst limits |
| Destination search | `AUTOCOMPLETE_MODE` A or B | One mode: server proxy over Places API (New) |
| How the code arrives | Embedded in the script and copied by the agent | Real files, unit tests, CI, bundle audit |
| Footer | Original author | Pratham Raj, with the tutorial credited in the README |

Gemini notes (checked against Google's docs on 5 Nov 2026): `gemini-3.8-flash` is the default and is generally available. Its thinking cannot be switched off, so `GEMINI_THINKING_LEVEL=low` keeps it quick. Google does not publish fixed free-tier numbers (AI Studio shows yours), so the app has its own daily limits. If a model name stops working, `npm run doctor -- --models` lists what your key can use.

## 2. Rules of the game

The full rules are in `.agents/rules/guardrails.md` (Always On). In short: no secret values in chat or files, no commits or pushes, no refactoring, no weakening security, one phase at a time, never claim a check passed without running it.

On Windows PowerShell use `curl.exe` (not `curl`) and `copy` (not `cp`).

## 3. Phases

### Phase 0: Orientation (read only)
- **Do:** `node -v`, `npm -v`; list the project tree two levels deep; read the guardrails, this script and the README sections named in the prompt.
- **Pass when:** Node is 20 or newer, and you can point to where each of these lives: token check, Firestore rules, Gemini schema validation, quota, cache.
- **Explain:** the 8 steps of "Generate a trip" (README > Architecture) in your own words.

### Phase 1: Install and run the automatic checks
- **Do:** `npm install`, then `npm test`, then `npm run build`, then `npm run audit:bundle`.
- **Pass when:** tests print `# fail 0`; the build prints a line with `built in`; the audit prints `PASS`.
- **Explain:** each file in `server/` in one line; what each test file covers.
- **Note:** this is the first real `npm install` of the kit. If it fails, show the full error; do not change versions.

### Phase 2: Run the app with no keys (smoke test)
- **Do:** start `npm run dev` in the background (read the port from its output; normally 5173). Then:
  - `curl -i http://localhost:5173/api/health` expects `200` and `{"ok":true,"configured":{"firebaseAdmin":false,"gemini":false,"places":false}}`
  - `curl -i -X POST http://localhost:5173/api/generate-trip` expects `401` with `"code":"unauthenticated"`
  - `curl -i "http://localhost:5173/api/places-autocomplete?input=par"` expects `401`
  - `curl -i http://localhost:5173/api/nope` expects `404`
  - Open `/`: the landing page shows. Open `/create-trip`: a "Firebase is not configured yet" screen lists the four `VITE_FIREBASE_*` names.
- **Pass when:** all of the above match.
- **Explain:** why a 401 arrives before any key is needed (`requireUser` runs first, and the Admin SDK starts only when a token must be checked).

### Phase 3: Accounts and keys (you do it, the agent coaches)
- **Do:** the agent walks you through checklists A, B and C in section 4, one at a time, and waits for your "done". It never asks for a value. You copy `.env.example` to `.env.local` and fill it in yourself. Then the agent runs `npm run doctor`, and (after asking you) `npm run doctor -- --live`.
- **Pass when:** both print `All good.`
- **Explain:** which variables are public and which are secret, and why Firebase's web config is not a secret.

### Phase 4: Firestore rules
- **Do:** the agent reads `firestore.rules` and explains each block. You publish the rules (checklist D) and run the five Rules Playground simulations.
- **Pass when:** your results match the Allowed/Denied table in checklist D.
- **Explain:** why browser writes are denied, and why `usage` and `tripCache` are locked.

### Phase 5: End to end in the browser
- **Do:** restart `npm run dev`. You sign in with Google (the agent never types credentials). Then:
  1. Create a 2-day trip for a city. The trip page shows hotels and two days. Photos appear, or placeholders if Places is not set up.
  2. My Trips shows the card.
  3. Create the same trip again. It is instant, and the toast does not mention remaining plans (cache hit). My Trips now has two cards.
  4. Delete one. It disappears.
  5. Sign out, open `/my-trips`: it asks you to sign in.
  6. In DevTools > Network, requests go to `/api/...` with an `Authorization` header, and none go to Gemini or Places.
  7. Agent: `curl -i -X POST -H "Authorization: Bearer fake" http://localhost:5173/api/generate-trip` expects `401` with `"code":"invalid_token"`; then `npm run build` and `npm run audit:bundle` expect `PASS` with your real `.env.local` present.
- **Pass when:** all seven behave as described.
- **Explain:** what is now in Firestore (`users/{uid}/trips`, `usage`, `tripCache`). Look at them in the console.

### Phase 6: Break it on purpose
- **Do** (restore every setting afterwards): follow "Break it on purpose" in `docs/STUDY_GUIDE.md`: `DAILY_TRIP_LIMIT=1`; same trip twice; `GEMINI_MODEL=does-not-exist`; edit browser storage; read another user's trip in the Rules Playground.
- **Pass when:** you saw each expected result.
- **Explain:** what each experiment proved.

### Phase 7: Deploy to Vercel (you do it, the agent coaches)
- **Do:** checklist E. Then the two `curl` smoke tests from the README against your live URL, and one full trip in the browser.
- **Pass when:** health is 200, generate is 401 without login, and a signed-in trip works.
- **Explain:** why the Firebase authorized-domain step is needed, and why server variables are marked sensitive.

### Phase 8: Make it yours
- **Do:** fill the `TODO` lines in `README.md` (live link, screenshots in `docs/`); confirm the footer says Pratham Raj; run `/security-audit`; then quiz me with 8 questions from `docs/STUDY_GUIDE.md`, one at a time. Grade each answer and point out gaps.
- **Pass when:** you can answer without looking.

## 4. Checklists you do by hand

### A. Firebase
1. [console.firebase.google.com](https://console.firebase.google.com) > Add project (Analytics not needed).
2. Build > Authentication > Get started > Sign-in method > **Google** > Enable > choose a support email > Save.
3. Build > Firestore Database > Create database > a region near you > production mode.
4. Project settings > General > Your apps > Web `</>` > Register app. Put `apiKey`, `authDomain`, `projectId`, `appId` into the four `VITE_FIREBASE_*` lines of `.env.local`.
5. Project settings > Service accounts > Generate new private key. Run `npm run encode:sa -- path/to/key.json`, paste the printed line into `.env.local`, then move the JSON file out of this folder (or delete it).

### B. Gemini
[aistudio.google.com/apikey](https://aistudio.google.com/apikey) > Create API key > `GEMINI_API_KEY`. Look at your limits in AI Studio, and keep `GLOBAL_DAILY_TRIP_LIMIT` below them.

### C. Places
In a Google Cloud project with billing enabled: APIs & Services > Library > **Places API (New)** > Enable > Credentials > Create API key > restrict it to *Places API (New)* only > `GOOGLE_PLACES_API_KEY`. Set a daily quota cap for the API and a budget alert.

### D. Publish the rules and test them
Firestore Database > Rules: paste `firestore.rules` > Publish. Then Rules Playground:

| Simulation | Expected |
|---|---|
| `get` `/users/ALICE/trips/x`, authenticated as `ALICE` | Allowed |
| same path, authenticated as `BOB` | Denied |
| same path, not authenticated | Denied |
| `create` `/users/ALICE/trips/new`, authenticated as `ALICE` | Denied |
| `get` `/usage/anything` or `/tripCache/anything`, authenticated | Denied |

### E. Vercel
1. Push to GitHub (check `git status` first: no `.env*`, no service account file).
2. Vercel > Add New > Project > import the repo. Framework: Vite.
3. Settings > Environment Variables: add every variable from the README table. Mark `GEMINI_API_KEY`, `GOOGLE_PLACES_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_BASE64` as sensitive.
4. Deploy. Then Firebase > Authentication > Settings > Authorized domains > add your `*.vercel.app` domain.
5. Optional: the two `gcloud ... ttls` commands in the README.

## 5. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `EBADENGINE` warning | Node older than 20 | Install Node 22 LTS |
| `npm test` fails on "every package imported is declared" | An import was added without adding the package | Add the package to `package.json` (ask first) |
| `/api/...` returns the HTML page | Not running `npm run dev` (for example `vite preview`) | Stop it and run `npm run dev` |
| Popup says `auth/unauthorized-domain` | Domain not authorized | Firebase > Authentication > Settings > Authorized domains |
| `auth/operation-not-allowed` | Google sign-in not enabled | Enable the Google provider |
| `auth/api-key-not-valid` | Wrong `VITE_FIREBASE_API_KEY`, or dev server not restarted | Fix `.env.local`, restart `npm run dev` |
| `401 invalid_token` right after signing in | Service account is from a different project | `npm run doctor` flags it; use the same project everywhere |
| `500 server_misconfigured` | A server variable is missing (locally the message names it) | Fill it in `.env.local`, restart |
| Firestore `NOT_FOUND` | Database not created | Create it (checklist A3) |
| `permission-denied` on My Trips | Rules not published, or wrong project | Checklist D |
| `502 ai_model_unavailable` | `GEMINI_MODEL` not available to your key | `npm run doctor -- --models`, then set `GEMINI_MODEL` |
| `503 ai_busy` | Free-tier limit or overload | Wait; lower the limits; check AI Studio |
| `502 bad_model_output` | Reply failed validation twice | Try again; read the server log for the cause |
| `429 daily_limit_reached` | Working as designed | Raise `DAILY_TRIP_LIMIT` or wait for the next UTC day |
| Autocomplete shows nothing | Places API (New) not enabled, billing off, key restricted, or the type filter excludes the place | `npm run doctor -- --live`; try `PLACES_AUTOCOMPLETE_TYPES=` (empty) |
| Only placeholders, no photos | Places problem or no photos for that place | Check the server log for `places_unavailable` |
| Vercel 404 when refreshing `/my-trips` | The SPA rewrite is missing | Keep `vercel.json` unchanged |

## 6. Files in this kit

See the tree in `README.md` (Project structure) and the file-by-file table in `docs/STUDY_GUIDE.md`.
