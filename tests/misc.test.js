import test from 'node:test'
import assert from 'node:assert/strict'
import { HttpError } from '../server/errors.js'
import { configError, getConfig, loadServiceAccount, requireEnv } from '../server/config.js'
import { createRateLimiter } from '../server/rateLimit.js'
import { createTtlCache } from '../server/ttlCache.js'
import { requireUser } from '../server/auth.js'
import { getAdmin } from '../server/firebaseAdmin.js'

const req = (authorization) => new Request('http://x/api', { headers: authorization ? { authorization } : {} })

test('getConfig has safe defaults', () => {
  const c = getConfig({})
  assert.equal(c.geminiModel, 'gemini-3.8-flash')
  assert.deepEqual(c.geminiFallbackModels, ['gemini-3.5-flash-lite'])
  assert.equal(c.geminiThinkingLevel, 'low')
  assert.deepEqual(c.placesTypes, ['(cities)'])
  assert.equal(c.dailyTripLimit, 8)
  assert.equal(c.globalDailyTripLimit, 40)
  assert.equal(c.cacheTtlMs, 168 * 3600 * 1000)
})

test('getConfig reads overrides, ignores nonsense and never lists the main model as its own fallback', () => {
  const c = getConfig({
    GEMINI_MODEL: 'a', GEMINI_FALLBACK_MODELS: 'a, b ,c', GEMINI_THINKING_LEVEL: 'HIGH',
    PLACES_AUTOCOMPLETE_TYPES: 'locality,country', DAILY_TRIP_LIMIT: '3', GLOBAL_DAILY_TRIP_LIMIT: 'abc', CACHE_TTL_HOURS: '0',
  })
  assert.equal(c.geminiModel, 'a')
  assert.deepEqual(c.geminiFallbackModels, ['b', 'c'])
  assert.equal(c.geminiThinkingLevel, 'high')
  assert.deepEqual(c.placesTypes, ['locality', 'country'])
  assert.equal(c.dailyTripLimit, 3)
  assert.equal(c.globalDailyTripLimit, 40)
  assert.equal(c.cacheTtlMs, 168 * 3600 * 1000)
})

test('empty values mean what .env.example says they mean', () => {
  const c = getConfig({ GEMINI_MODEL: '', GEMINI_FALLBACK_MODELS: '', PLACES_AUTOCOMPLETE_TYPES: '' })
  assert.equal(c.geminiModel, 'gemini-3.8-flash')
  assert.deepEqual(c.geminiFallbackModels, [])
  assert.deepEqual(c.placesTypes, [])
})

test('configError names the problem locally but stays vague on Vercel', () => {
  assert.match(configError('X is missing', {}).message, /X is missing/)
  assert.equal(configError('X is missing', { VERCEL: '1' }).message, 'The server is not configured.')
  assert.throws(() => requireEnv('NOPE', {}), HttpError)
  assert.equal(requireEnv('YES', { YES: 'v' }), 'v')
})

const account = { type: 'service_account', project_id: 'demo', client_email: 'a@demo.iam.gserviceaccount.com', private_key: '-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----\\n' }

test('loadServiceAccount accepts base64 or raw JSON and repairs escaped newlines', () => {
  const b64 = Buffer.from(JSON.stringify(account)).toString('base64')
  const a = loadServiceAccount({ FIREBASE_SERVICE_ACCOUNT_BASE64: b64 })
  assert.equal(a.project_id, 'demo')
  assert.ok(a.private_key.includes('\nABC\n'))
  const b = loadServiceAccount({ FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify(account) })
  assert.equal(b.client_email, account.client_email)
})

test('loadServiceAccount rejects missing, malformed and incomplete values', () => {
  assert.throws(() => loadServiceAccount({}), (e) => e.code === 'server_misconfigured')
  assert.throws(() => loadServiceAccount({ FIREBASE_SERVICE_ACCOUNT_BASE64: Buffer.from('not json').toString('base64') }), HttpError)
  assert.throws(() => loadServiceAccount({ FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({ project_id: 'x' }) }), HttpError)
})

test('the rate limiter counts per key per window', () => {
  let t = 1000
  const limiter = createRateLimiter({ windowMs: 1000, max: 2, now: () => t })
  assert.equal(limiter.check('a').ok, true)
  assert.equal(limiter.check('a').ok, true)
  const third = limiter.check('a')
  assert.equal(third.ok, false)
  assert.equal(third.retryAfterSec, 1)
  assert.equal(limiter.check('b').ok, true)
  t += 1001
  assert.equal(limiter.check('a').ok, true)
})

test('the rate limiter cannot grow without bound', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1, maxKeys: 3 })
  for (let i = 0; i < 50; i += 1) limiter.check(`k${i}`)
  assert.equal(limiter.check('fresh').ok, true)
})

test('the ttl cache expires entries and caps its size', () => {
  let t = 0
  const cache = createTtlCache({ ttlMs: 100, max: 2, now: () => t })
  cache.set('a', 1)
  cache.set('b', 2)
  cache.set('c', 3)
  assert.equal(cache.get('a'), undefined)
  assert.equal(cache.get('b'), 2)
  t = 101
  assert.equal(cache.get('b'), undefined)
  assert.equal(cache.get('c'), undefined)
})

test('requireUser accepts only a well-formed Bearer token that verifies', async () => {
  const verify = async (token) => (token === 'ok' ? { uid: 'u9', email: 'e@x.y' } : Promise.reject(new Error('bad')))
  assert.deepEqual(await requireUser(req('Bearer ok'), verify), { uid: 'u9', email: 'e@x.y' })
  assert.deepEqual(await requireUser(req('bearer ok'), verify), { uid: 'u9', email: 'e@x.y' })
  for (const header of [undefined, '', 'Bearer', 'Basic ok', 'Bearer ok extra', 'Token ok']) {
    await assert.rejects(requireUser(req(header), verify), (e) => e.status === 401)
  }
  await assert.rejects(requireUser(req('Bearer nope'), verify), (e) => e.code === 'invalid_token')
  await assert.rejects(requireUser(req('Bearer ok'), async () => ({})), (e) => e.code === 'invalid_token')
})

test('starting the Admin SDK without credentials is a 500 (our fault), never a 401', async () => {
  await assert.rejects(getAdmin({}), (e) => e instanceof HttpError && e.status === 500)
})
