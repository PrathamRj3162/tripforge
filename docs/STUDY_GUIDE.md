# Study guide (private notes, not for the README)

Goal: be able to explain every file and defend every decision. Read it once, then try to answer each question out loud without looking.

## The 60-second pitch

"TripForge is a production-grade AI travel planner. Unlike naive implementations that leak API keys to client bundles, trust unverified localStorage data, and leave database rules wide open, I engineered TripForge so all third-party API keys live strictly on a secure serverless backend. Users authenticate via Firebase Auth with cryptographically verified JWT tokens on every request, Firestore security rules guarantee strict tenant data isolation, and all LLM JSON outputs are runtime-validated against Zod schemas before persistence. It features transactional quota protection, distributed caching, 100+ unit/integration tests in CI, and automated bundle security audits."

## Request flow: generating a trip

1. `src/create-trip/index.jsx` sends the form to `src/lib/api.js`, which attaches `Authorization: Bearer <Firebase ID token>`.
2. `api/generate-trip.js` hands the request to `server/handlers/generateTrip.js` (wrapped by `withApi` in `server/http.js`: method check, JSON errors, request id).
3. `server/auth.js` `requireUser` verifies the token. No header means 401 before any key is touched.
4. A burst limiter (in memory) stops hammering. `server/input.js` validates the body.
5. `server/tripService.js`: cache (`server/cache.js`) -> quota (`server/quota.js`) -> Gemini (`server/gemini.js`) -> validate (`server/tripSchema.js`) -> cache + save (`server/trips.js`).
6. The browser gets `{ tripId }`, navigates to `/view-trip/:tripId` and reads `users/{uid}/trips/{tripId}` straight from Firestore. The rules allow that only for the owner.

## File map

| File | One line |
|---|---|
| `api/*.js` | Vercel entry points. Each exports `{ fetch }` and wires real dependencies into a handler |
| `server/errors.js` | `HttpError`: the only error that is shown to the client on purpose |
| `server/http.js` | `withApi` wrapper, `readJson` (type and size checks), uniform error JSON, request ids |
| `server/config.js` | Reads env vars with defaults; loads the service account (base64 or JSON) |
| `server/auth.js` | `requireUser`: Bearer token -> verified uid |
| `server/rateLimit.js` | In-memory fixed-window burst limiter |
| `server/ttlCache.js` | Tiny in-memory cache with expiry (used for photo lookups) |
| `server/input.js` | Zod validation of the request; place-name sanitiser |
| `server/prompt.js` | System instruction and prompt builders (destination quoted as data) |
| `server/tripSchema.js` | The trip schema, tolerant normaliser, strict validator, Gemini JSON Schema converter |
| `server/gemini.js` | Calls Gemini (SDK loaded lazily), thinking-level fallback, error status helper |
| `server/quota.js` | Daily per-user and global counters in a Firestore transaction; refund |
| `server/cache.js` | Cache key (sha256 of normalised request) and Firestore read/write with expiry |
| `server/trips.js` | Saves a trip under `users/{uid}/trips` |
| `server/tripService.js` | The orchestration: cache, quota, model fallback, repair retry, refund, save |
| `server/places.js` | Places API (New): autocomplete and photo lookup, key only in a header |
| `server/firebaseAdmin.js` | Starts the Admin SDK on first use |
| `server/runtime.js` | Wires real services into handlers; nothing starts until needed |
| `server/handlers/*.js` | One endpoint each: generate trip, autocomplete, photo, health |
| `shared/limits.js` | Days range and option ids shared by browser and server |
| `src/lib/firebase.js` | Firebase web config (public) and auth/db handles |
| `src/lib/api.js` | `fetch` wrapper that adds the ID token and turns errors into `ApiError` |
| `src/lib/photos.js` | De-duplicates photo lookups per page load |
| `src/context/AuthContext.jsx` | `useAuth()`: user, sign in, sign out |
| `src/components/custom/RequireAuth.jsx` | Friendly gate in front of private pages |
| `src/components/custom/PlacesAutocomplete.jsx` | Debounced, abortable, keyboard-friendly search box |
| `src/components/custom/PlacePhoto.jsx` | Photo with placeholder and author credit |
| `src/create-trip`, `src/view-trip`, `src/my-trips` | The three pages |
| `firestore.rules` | Owner-only read/delete, no browser writes, server-only collections, default deny |
| `vercel.json` | SPA rewrite that skips `/api`, function time limit, security headers |
| `scripts/dev-api.mjs` | Lets `npm run dev` serve `/api` like Vercel does |
| `scripts/doctor.mjs` | Preflight that never prints secrets |
| `scripts/audit-bundle.mjs` | Fails if a secret is inside `dist/` |
| `tests/*` | Unit tests with fakes for Firestore, Gemini and Places |

## Questions you should be able to answer

**1. Why a serverless proxy instead of calling Gemini from the browser?**
Anything in the browser bundle is public, so a paid API key there can be copied and used by anyone. The proxy keeps keys in server environment variables, and it is also the one place where login, validation, quota and caching are enforced.

**2. Why not store user authentication/profile state in localStorage? What is wrong with that?**
It is only untrusted client data. A user can edit localStorage in DevTools and spoof any identity. With Firebase Auth the browser holds a cryptographically signed ID token (a JWT). The server verifies the signature with Google's public keys, so the uid inside cannot be forged, and the server extracts that uid directly from the token, never trusting user IDs from the request body.

**3. How do the Firestore rules protect users, and why can't the browser write trips?**
`allow read, delete: if request.auth.uid == uid` on `users/{uid}/trips/{tripId}`, and everything else is denied. Creating and updating are denied for the browser on purpose: the Admin SDK bypasses rules, so only the server writes, and only validated data reaches the database.

**4. The model returns broken or wrong JSON. What happens?**
The reply is parsed, normalised (trim, clamp ratings, cut lists, renumber days) and validated with Zod. On failure there is one repair retry that lists the problems, then the next model. If all fail the user gets a clear 502 and the quota unit is refunded. Nothing invalid is stored.

**5. You send Gemini a JSON schema. Why validate again?**
Constrained output improves the shape but is not a guarantee of valid content, and the schema sent to Gemini is deliberately light (Gemini rejects complex schemas, and it ignores several keywords). Lengths, ranges and day counts are enforced by my validator. Also, the output is untrusted input to my system.

**6. How do you handle prompt injection?**
The destination is user-controlled, so it is reduced to plain place-name characters, limited in length, and quoted as data in the prompt. The system instruction tells the model to ignore instructions in it. The model has no tools and no secrets in its context, so the worst case is a strange itinerary. The output is validated, contains no AI-supplied URLs, and React escapes the text.

**7. Explain the cache.**
Key = sha256 of (version, normalised destination, days, budget, travelers). Stored in Firestore so every serverless instance shares it. Entries expire after the TTL. Bumping `CACHE_VERSION` invalidates everything when the prompt or schema changes. A hit costs no AI quota. Trade-off: same inputs give the same plan, so there is a "brand-new plan" option.

**8. Explain the rate limiting.**
Two layers. The expensive resource, Gemini, has an exact daily quota in Firestore (per user and global). The cheap endpoints (autocomplete, photos) use an in-memory burst limiter, which is best effort because each serverless instance has its own memory. Redis would make it exact.

**9. Why a transaction for the quota?**
Read-check-write is a race: two parallel requests could both read "7 used" and both pass. A transaction retries on contention, so the count stays correct.

**10. Why does the server need a service account? What is the risk?**
To write to Firestore with rules bypassed and to verify tokens. It is a high-value secret: only in Vercel environment variables (sensitive), never in git, rotated if exposed. A more advanced setup would use keyless workload identity.

**11. Why not use a Firebase feature to call Gemini from the client?**
Firebase offers client-side Gemini access protected by App Check. I chose my own proxy to control validation, quota, caching and the model choice, and to practice a server design. App Check would still be a good addition.

**12. How do you test code that depends on Google services?**
Dependency injection. Handlers and the trip service receive their dependencies as arguments, so tests pass fakes for Firestore, Gemini and Places. No network, no account, deterministic. CI runs the same tests.

**13. What does `npm run audit:bundle` prove?**
It searches `dist/` for the real values of the server secrets and for tell-tale strings (private key header, direct Gemini or Places URLs). It catches mistakes like putting a `VITE_` prefix on a secret.

**14. What happens at midnight UTC?**
Counters are keyed by the UTC date, so a new day starts a new document. Old ones carry `expiresAt` for a Firestore TTL policy.

**15. What is the weakest part of this project?**
Be honest: the burst limiter is per instance; no App Check; the rules and the UI have no automated tests; photo lookups cost money per card; AI content can be wrong. I know what I would do next for each.

## Break it on purpose (10 minutes each, learn by watching)

1. Run `curl -i -X POST http://localhost:5173/api/generate-trip`. Expect 401. Find the line in `server/auth.js` that decides it.
2. Set `DAILY_TRIP_LIMIT=1`, restart, create two different trips. The second is refused with a 429 message. Find where the counter lives in Firestore (`usage`).
3. Create the same trip twice. The second is instant and does not reduce your remaining plans. Find the document in `tripCache`.
4. Set `GEMINI_MODEL=does-not-exist`. The fallback model answers. Read the terminal and see which model was used (the response has a `model` field).
5. In the browser console run `localStorage.setItem('user', '{"email":"x@y.z"}')` and reload. Nothing changes, because the app relies strictly on verified auth tokens, not unverified client storage.
6. In the Rules Playground, try to read another user's trip. See it denied.
