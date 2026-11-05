import { HttpError } from './errors.js'

const csv = (value) => String(value ?? '').split(',').map((s) => s.trim()).filter(Boolean)

function int(value, fallback, min = 1) {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n >= min ? n : fallback
}

// In local development the error names the missing variable. In production it stays vague.
export function configError(what, env = process.env) {
  const detail = env.VERCEL ? 'The server is not configured.' : `Server configuration problem: ${what}.`
  return new HttpError(500, 'server_misconfigured', detail)
}

export function requireEnv(name, env = process.env) {
  const value = env[name]
  if (!value) throw configError(`${name} is missing`, env)
  return value
}

export function getConfig(env = process.env) {
  const primary = env.GEMINI_MODEL || 'gemini-3.8-flash'
  const fallbacks = env.GEMINI_FALLBACK_MODELS === undefined ? ['gemini-3.5-flash-lite'] : csv(env.GEMINI_FALLBACK_MODELS)
  return {
    geminiModel: primary,
    geminiFallbackModels: fallbacks.filter((m) => m !== primary),
    geminiThinkingLevel: (env.GEMINI_THINKING_LEVEL || 'low').toLowerCase(),
    placesTypes: env.PLACES_AUTOCOMPLETE_TYPES === undefined ? ['(cities)'] : csv(env.PLACES_AUTOCOMPLETE_TYPES),
    dailyTripLimit: int(env.DAILY_TRIP_LIMIT, 8),
    globalDailyTripLimit: int(env.GLOBAL_DAILY_TRIP_LIMIT, 40),
    cacheTtlMs: int(env.CACHE_TTL_HOURS, 168) * 60 * 60 * 1000,
    modelTimeoutMs: 45_000, // one Gemini call
    totalBudgetMs: 80_000, // all attempts together; the function limit is 90 s (vercel.json)
  }
}

// The service account can arrive as base64 (recommended, no quoting problems) or as raw JSON.
export function loadServiceAccount(env = process.env) {
  const b64 = env.FIREBASE_SERVICE_ACCOUNT_BASE64
  const raw = b64 ? Buffer.from(b64, 'base64').toString('utf8') : env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) throw configError('FIREBASE_SERVICE_ACCOUNT_BASE64 is missing', env)
  let account
  try {
    account = JSON.parse(raw)
  } catch {
    throw configError('FIREBASE_SERVICE_ACCOUNT_BASE64 is not valid base64 JSON', env)
  }
  if (!account?.project_id || !account?.client_email || !account?.private_key) {
    throw configError('the service account JSON is missing project_id, client_email or private_key', env)
  }
  return { ...account, private_key: String(account.private_key).replace(/\\n/g, '\n') }
}
