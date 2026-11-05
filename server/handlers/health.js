import { json, withApi } from '../http.js'

// GET /api/health   (public). On Vercel it only says "ok". Locally it also says which keys are set
// (true/false only, never the values), which is handy for the first smoke test.
export function createHealthHandler({ env = process.env, log } = {}) {
  return withApi({ route: 'health', methods: ['GET'] }, async () => {
    const body = { ok: true }
    if (!env.VERCEL) {
      body.configured = {
        firebaseAdmin: Boolean(env.FIREBASE_SERVICE_ACCOUNT_BASE64 || env.FIREBASE_SERVICE_ACCOUNT_JSON),
        gemini: Boolean(env.GEMINI_API_KEY),
        places: Boolean(env.GOOGLE_PLACES_API_KEY),
      }
    }
    return json(body)
  }, { log })
}
