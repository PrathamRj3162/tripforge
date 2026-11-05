import test from 'node:test'
import assert from 'node:assert/strict'
import { HttpError } from '../server/errors.js'
import { createGenerateTripHandler } from '../server/handlers/generateTrip.js'
import { createHealthHandler } from '../server/handlers/health.js'
import { createPlacePhotoHandler } from '../server/handlers/placePhoto.js'
import { createPlacesAutocompleteHandler } from '../server/handlers/placesAutocomplete.js'
import { createRateLimiter } from '../server/rateLimit.js'
import { silentLog, validInput } from './helpers/trip.js'

const verifyIdToken = async (token) => {
  if (token === 'good') return { uid: 'u1', email: 'a@b.c' }
  throw new Error('bad token')
}
const BASE = 'http://localhost'
const authed = { Authorization: 'Bearer good' }
const post = (body, headers = {}, raw) => new Request(`${BASE}/api/generate-trip`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: raw ?? JSON.stringify(body),
})

function generateHandler(over = {}) {
  const calls = { service: 0, generate: [] }
  const handler = createGenerateTripHandler({
    verifyIdToken,
    getTripService: async () => {
      calls.service += 1
      return { generate: async (args) => { calls.generate.push(args); return { tripId: 't1', cached: false, model: 'm', remainingToday: 5 } } }
    },
    log: silentLog,
    ...over,
  })
  return { handler, calls }
}

test('generate-trip: only POST is allowed', async () => {
  const { handler } = generateHandler()
  const res = await handler(new Request(`${BASE}/api/generate-trip`, { method: 'GET', headers: authed }))
  assert.equal(res.status, 405)
  assert.equal(res.headers.get('allow'), 'POST')
  assert.equal((await res.json()).error.code, 'method_not_allowed')
})

test('generate-trip: no login means 401 and no service or key is touched', async () => {
  const { handler, calls } = generateHandler()
  for (const headers of [{}, { Authorization: 'Basic abc' }, { Authorization: 'Bearer' }, { Authorization: 'Bearer a b' }]) {
    const res = await handler(post(validInput(), headers))
    assert.equal(res.status, 401, JSON.stringify(headers))
    assert.equal((await res.json()).error.code, 'unauthenticated')
  }
  assert.equal(calls.service, 0)
})

test('generate-trip: a bad or expired token is 401 invalid_token', async () => {
  const { handler, calls } = generateHandler()
  const res = await handler(post(validInput(), { Authorization: 'Bearer forged' }))
  assert.equal(res.status, 401)
  assert.equal((await res.json()).error.code, 'invalid_token')
  assert.equal(calls.service, 0)
})

test('generate-trip: a server misconfiguration while verifying is a 500, not a 401', async () => {
  const { handler } = generateHandler({ verifyIdToken: async () => { throw new HttpError(500, 'server_misconfigured', 'x') } })
  const res = await handler(post(validInput(), authed))
  assert.equal(res.status, 500)
})

test('generate-trip: body problems are 415 / 400 before any AI work', async () => {
  const { handler, calls } = generateHandler()
  const wrongType = await handler(new Request(`${BASE}/api/generate-trip`, { method: 'POST', headers: { ...authed, 'Content-Type': 'text/plain' }, body: 'hi' }))
  assert.equal(wrongType.status, 415)
  const badJson = await handler(post(null, authed, '{nope'))
  assert.equal(badJson.status, 400)
  assert.equal((await badJson.json()).error.code, 'invalid_json')
  const tooBig = await handler(post(null, authed, JSON.stringify({ destination: 'x'.repeat(9000) })))
  assert.equal(tooBig.status, 413)
  const invalid = await handler(post(validInput({ days: 99 }), authed))
  assert.equal(invalid.status, 400)
  const body = await invalid.json()
  assert.equal(body.error.code, 'invalid_input')
  assert.ok(body.error.issues.some((i) => i.startsWith('days')))
  assert.equal(calls.service, 0)
})

test('generate-trip: success passes the user id and cleaned input to the service', async () => {
  const { handler, calls } = generateHandler()
  const res = await handler(post(validInput({ destination: '  Paris,  France ' }), authed))
  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), { tripId: 't1', cached: false, model: 'm', remainingToday: 5 })
  assert.equal(calls.generate[0].uid, 'u1')
  assert.equal(calls.generate[0].input.destination, 'Paris, France')
  assert.equal(res.headers.get('cache-control'), 'no-store')
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
  assert.ok(res.headers.get('x-request-id'))
})

test('generate-trip: the user id comes from the verified token, never from the body', async () => {
  const { handler } = generateHandler({ getTripService: async () => ({ generate: async ({ uid }) => ({ tripId: uid }) }) })
  const res = await handler(post({ ...validInput(), uid: 'someone-else' }, authed))
  assert.equal(res.status, 400) // unknown field rejected
  const ok = await handler(post(validInput(), authed))
  assert.equal((await ok.json()).tripId, 'u1')
})

test('generate-trip: bursts are limited per user', async () => {
  const { handler } = generateHandler({ limiter: createRateLimiter({ windowMs: 60_000, max: 1 }) })
  assert.equal((await handler(post(validInput(), authed))).status, 200)
  const second = await handler(post(validInput(), authed))
  assert.equal(second.status, 429)
  assert.ok(Number(second.headers.get('retry-after')) >= 1)
  assert.equal((await second.json()).error.code, 'rate_limited')
})

test('generate-trip: unexpected errors never leak details', async () => {
  const { handler } = generateHandler({
    getTripService: async () => ({ generate: async () => { throw new Error('secret-detail AIzaSyFAKE') } }),
  })
  const res = await handler(post(validInput(), authed))
  assert.equal(res.status, 500)
  const text = await res.text()
  assert.equal(text.includes('secret-detail'), false)
  assert.equal(text.includes('AIza'), false)
  assert.equal(JSON.parse(text).error.code, 'internal_error')
  assert.ok(JSON.parse(text).error.requestId)
})

test('generate-trip: deliberate errors keep their status, code and headers', async () => {
  const { handler } = generateHandler({
    getTripService: async () => ({
      generate: async () => { throw new HttpError(429, 'daily_limit_reached', 'limit', { headers: { 'Retry-After': '99' }, details: { retryAfterSec: 99 } }) },
    }),
  })
  const res = await handler(post(validInput(), authed))
  assert.equal(res.status, 429)
  assert.equal(res.headers.get('retry-after'), '99')
  assert.equal((await res.json()).error.retryAfterSec, 99)
})

// ---------- places-autocomplete ----------

const places = (over = {}) => ({
  autocomplete: async (input) => [{ id: '1', label: `${input}, France`, main: input, secondary: 'France' }],
  findPhoto: async () => ({ url: 'https://lh3.googleusercontent.com/x', attribution: 'Ann' }),
  ...over,
})
const get = (path, headers = {}) => new Request(`${BASE}${path}`, { method: 'GET', headers })

test('places-autocomplete: needs login, validates input, returns suggestions', async () => {
  const handler = createPlacesAutocompleteHandler({ verifyIdToken, getPlaces: () => places(), log: silentLog })
  assert.equal((await handler(get('/api/places-autocomplete?input=Par'))).status, 401)
  assert.equal((await handler(get('/api/places-autocomplete?input=P', authed))).status, 400)
  assert.equal((await handler(get('/api/places-autocomplete', authed))).status, 400)
  const res = await handler(get('/api/places-autocomplete?input=Par', authed))
  assert.equal(res.status, 200)
  assert.equal(res.headers.get('cache-control'), 'private, max-age=300')
  assert.deepEqual((await res.json()).suggestions[0].label, 'Par, France')
  assert.equal((await handler(new Request(`${BASE}/api/places-autocomplete?input=Par`, { method: 'POST', headers: authed }))).status, 405)
})

test('places-autocomplete: a missing Places key is a server error that does not leak', async () => {
  const handler = createPlacesAutocompleteHandler({
    verifyIdToken, getPlaces: () => { throw new HttpError(500, 'server_misconfigured', 'The server is not configured.') }, log: silentLog,
  })
  const res = await handler(get('/api/places-autocomplete?input=Par', authed))
  assert.equal(res.status, 500)
  assert.equal((await res.json()).error.code, 'server_misconfigured')
})

test('places-autocomplete: bursts are limited', async () => {
  const handler = createPlacesAutocompleteHandler({
    verifyIdToken, getPlaces: () => places(), limiter: createRateLimiter({ windowMs: 60_000, max: 2 }), log: silentLog,
  })
  const statuses = []
  for (let i = 0; i < 3; i += 1) statuses.push((await handler(get('/api/places-autocomplete?input=Par', authed))).status)
  assert.deepEqual(statuses, [200, 200, 429])
})

// ---------- place-photo ----------

test('place-photo: needs login, caches repeat lookups, passes "no photo" through', async () => {
  let lookups = 0
  const handler = createPlacePhotoHandler({
    verifyIdToken,
    getPlaces: () => places({ findPhoto: async (q) => { lookups += 1; return q.startsWith('Nowhere') ? { url: null, attribution: null } : { url: 'https://lh3.googleusercontent.com/x', attribution: 'Ann' } } }),
    log: silentLog,
  })
  assert.equal((await handler(get('/api/place-photo?q=Louvre'))).status, 401)
  assert.equal((await handler(get('/api/place-photo?q=x', authed))).status, 400)
  const first = await handler(get('/api/place-photo?q=Louvre%2C%20Paris', authed))
  assert.equal(first.status, 200)
  assert.equal(first.headers.get('cache-control'), 'private, max-age=86400')
  assert.equal((await first.json()).attribution, 'Ann')
  await handler(get('/api/place-photo?q=Louvre%2C%20Paris', authed))
  assert.equal(lookups, 1)
  const none = await handler(get('/api/place-photo?q=Nowhere%20Land', authed))
  assert.deepEqual(await none.json(), { url: null, attribution: null })
})

test('place-photo: upstream failures are not cached', async () => {
  let lookups = 0
  const handler = createPlacePhotoHandler({
    verifyIdToken,
    getPlaces: () => places({ findPhoto: async () => { lookups += 1; throw new HttpError(502, 'places_unavailable', 'down') } }),
    log: silentLog,
  })
  assert.equal((await handler(get('/api/place-photo?q=Louvre', authed))).status, 502)
  assert.equal((await handler(get('/api/place-photo?q=Louvre', authed))).status, 502)
  assert.equal(lookups, 2)
})

// ---------- health ----------

test('health: public; shows which keys are set only outside Vercel', async () => {
  const local = createHealthHandler({ env: { GEMINI_API_KEY: 'x' }, log: silentLog })
  const body = await (await local(get('/api/health'))).json()
  assert.deepEqual(body, { ok: true, configured: { firebaseAdmin: false, gemini: true, places: false } })
  const prod = createHealthHandler({ env: { VERCEL: '1', GEMINI_API_KEY: 'x' }, log: silentLog })
  assert.deepEqual(await (await prod(get('/api/health'))).json(), { ok: true })
})
