import test from 'node:test'
import assert from 'node:assert/strict'
import { HttpError } from '../server/errors.js'
import { createTripService } from '../server/tripService.js'
import { makeTrip, validInput } from './helpers/trip.js'

const apiError = (status, message = 'upstream') => Object.assign(new Error(message), { status })

function setup({ responses = [], cachedPlan = null, quota, config = {}, saveFails = false, now } = {}) {
  const calls = []
  const saved = []
  const cacheWrites = []
  const refunds = []
  const state = { quotaCalls: 0, cacheReads: 0 }
  const queue = [...responses]
  const service = createTripService({
    config: {
      geminiModel: 'm1', geminiFallbackModels: ['m2'], geminiThinkingLevel: 'low',
      modelTimeoutMs: 45_000, totalBudgetMs: 80_000, ...config,
    },
    geminiSchema: { type: 'object' },
    callModel: async (args) => {
      calls.push(args)
      const next = queue.shift()
      if (next instanceof Error) throw next
      return typeof next === 'string' ? next : JSON.stringify(next)
    },
    readCache: async () => { state.cacheReads += 1; return cachedPlan },
    writeCache: async (key, plan, model) => { cacheWrites.push({ key, model }) },
    consumeQuota: async () => { state.quotaCalls += 1; return quota ?? { ok: true, remaining: 7, day: '2026-11-05' } },
    refundQuota: async (args) => { refunds.push(args) },
    saveTrip: async (args) => {
      if (saveFails) throw new Error('firestore down')
      saved.push(args)
      return 'trip123'
    },
    ...(now ? { now } : {}),
  })
  return { service, calls, saved, cacheWrites, refunds, state }
}

const run = (ctx, over) => ctx.service.generate({ uid: 'u1', input: validInput(over) })

test('cache hit: no quota used, no model call, trip still saved for the user', async () => {
  const ctx = setup({ cachedPlan: makeTrip(2) })
  const result = await run(ctx)
  assert.deepEqual(result, { tripId: 'trip123', cached: true, model: 'cache', remainingToday: null })
  assert.equal(ctx.state.quotaCalls, 0)
  assert.equal(ctx.calls.length, 0)
  assert.equal(ctx.saved[0].cached, true)
  assert.equal(ctx.saved[0].uid, 'u1')
})

test('a cached plan that no longer validates is ignored', async () => {
  const ctx = setup({ cachedPlan: { nonsense: true }, responses: [makeTrip(2)] })
  const result = await run(ctx)
  assert.equal(result.cached, false)
  assert.equal(ctx.calls.length, 1)
})

test('cache miss: quota used, plan validated, cached and saved', async () => {
  const ctx = setup({ responses: [makeTrip(2)] })
  const result = await run(ctx)
  assert.deepEqual(result, { tripId: 'trip123', cached: false, model: 'm1', remainingToday: 7 })
  assert.equal(ctx.state.quotaCalls, 1)
  assert.equal(ctx.cacheWrites.length, 1)
  assert.equal(ctx.saved[0].plan.itinerary.length, 2)
  assert.equal(ctx.calls[0].model, 'm1')
  assert.equal(ctx.calls[0].thinkingLevel, 'low')
  assert.ok(ctx.calls[0].timeoutMs <= 45_000)
  assert.deepEqual(ctx.calls[0].schema, { type: 'object' })
})

test('fresh=true skips the cache', async () => {
  const ctx = setup({ cachedPlan: makeTrip(2), responses: [makeTrip(2)] })
  const result = await run(ctx, { fresh: true })
  assert.equal(result.cached, false)
  assert.equal(ctx.state.cacheReads, 0)
})

test('an invalid reply gets one repair retry that names the problems', async () => {
  const broken = makeTrip(2)
  broken.hotels[0].rating = 'great'
  const ctx = setup({ responses: [broken, makeTrip(2)] })
  const result = await run(ctx)
  assert.equal(result.model, 'm1')
  assert.equal(ctx.calls.length, 2)
  assert.match(ctx.calls[1].prompt, /previous reply was rejected/)
  assert.match(ctx.calls[1].prompt, /hotels\.0\.rating/)
})

test('text that is not JSON is repaired the same way', async () => {
  const ctx = setup({ responses: ['I cannot help with that', makeTrip(2)] })
  assert.equal((await run(ctx)).cached, false)
  assert.equal(ctx.calls.length, 2)
})

test('two bad replies move on to the fallback model, which succeeds', async () => {
  const ctx = setup({ responses: ['nope', 'nope again', makeTrip(2)] })
  const result = await run(ctx)
  assert.equal(result.model, 'm2')
  assert.deepEqual(ctx.calls.map((c) => c.model), ['m1', 'm1', 'm2'])
})

test('a rate-limited or missing model falls back without a repair retry', async () => {
  for (const status of [429, 503, 404]) {
    const ctx = setup({ responses: [apiError(status), makeTrip(2)] })
    const result = await run(ctx)
    assert.equal(result.model, 'm2', `status ${status}`)
    assert.equal(ctx.calls.length, 2)
    assert.equal(ctx.refunds.length, 0)
  }
})

test('every model busy: 503 ai_busy, and the quota is refunded', async () => {
  const ctx = setup({ responses: [apiError(429), apiError(429)] })
  await assert.rejects(run(ctx), (err) => {
    assert.ok(err instanceof HttpError)
    assert.equal(err.status, 503)
    assert.equal(err.code, 'ai_busy')
    assert.equal(err.headers['Retry-After'], '60')
    return true
  })
  assert.deepEqual(ctx.refunds, [{ uid: 'u1', day: '2026-11-05' }])
  assert.equal(ctx.saved.length, 0)
})

test('a request the AI rejects (400) is not retried on another model', async () => {
  const ctx = setup({ responses: [apiError(400, 'INVALID_ARGUMENT'), makeTrip(2)] })
  await assert.rejects(run(ctx), (err) => err.code === 'ai_failed')
  assert.equal(ctx.calls.length, 1)
  assert.equal(ctx.refunds.length, 1)
})

test('bad server credentials are reported as ai_auth_failed', async () => {
  const ctx = setup({ responses: [apiError(403, 'API key not valid')] })
  await assert.rejects(run(ctx), (err) => err.code === 'ai_auth_failed' && err.status === 502)
})

test('replies that never validate end as bad_model_output with a refund', async () => {
  const ctx = setup({ responses: ['x', 'y', 'z'] })
  await assert.rejects(run(ctx), (err) => err.code === 'bad_model_output' && err.status === 502)
  assert.equal(ctx.refunds.length, 1)
  assert.equal(ctx.calls.length, 3)
})

test('daily limit reached: 429 with Retry-After, and no model call', async () => {
  const ctx = setup({ quota: { ok: false, scope: 'user', limit: 8, retryAfterSec: 3600 } })
  await assert.rejects(run(ctx), (err) => {
    assert.equal(err.status, 429)
    assert.equal(err.code, 'daily_limit_reached')
    assert.equal(err.headers['Retry-After'], '3600')
    assert.match(err.message, /8 AI trip plans/)
    return true
  })
  assert.equal(ctx.calls.length, 0)
  assert.equal(ctx.refunds.length, 0)
})

test('app-wide limit reached has its own code', async () => {
  const ctx = setup({ quota: { ok: false, scope: 'global', limit: 40, retryAfterSec: 10 } })
  await assert.rejects(run(ctx), (err) => err.code === 'ai_capacity_reached')
})

test('if saving fails after the AI answered, the error surfaces and the AI call is not refunded', async () => {
  const ctx = setup({ responses: [makeTrip(2)], saveFails: true })
  await assert.rejects(run(ctx), /firestore down/)
  assert.equal(ctx.refunds.length, 0)
})

test('a failing cache write does not fail the request', async () => {
  const ctx = setup({ responses: [makeTrip(2)] })
  const service = createTripService({
    config: { geminiModel: 'm1', geminiFallbackModels: [], geminiThinkingLevel: 'low', modelTimeoutMs: 1000, totalBudgetMs: 80_000 },
    geminiSchema: {},
    callModel: async () => JSON.stringify(makeTrip(2)),
    readCache: async () => null,
    writeCache: async () => { throw new Error('cache down') },
    consumeQuota: async () => ({ ok: true, remaining: 1, day: 'd' }),
    refundQuota: async () => {},
    saveTrip: async () => 'ok-id',
  })
  const result = await service.generate({ uid: 'u1', input: validInput() })
  assert.equal(result.tripId, 'ok-id')
  assert.ok(ctx)
})

test('when the time budget is nearly gone, no further model is tried', async () => {
  // clock readings: deadline set at 0 -> first attempt at 1 s -> next attempt at 9 s (only 1 s left of 10 s)
  const times = [0, 1_000, 9_000]
  const ctx = setup({
    responses: [apiError(503), makeTrip(2)],
    config: { totalBudgetMs: 10_000 },
    now: () => new Date(times.shift() ?? 9_000),
  })
  await assert.rejects(run(ctx), (err) => err.code === 'ai_failed')
  assert.equal(ctx.calls.length, 1) // the fallback model was never called
  assert.equal(ctx.refunds.length, 1)
})

test('with no time at all and nothing tried yet, the answer is ai_timeout', async () => {
  const times = [0, 9_000]
  const ctx = setup({
    responses: [makeTrip(2)],
    config: { totalBudgetMs: 10_000 },
    now: () => new Date(times.shift() ?? 9_000),
  })
  await assert.rejects(run(ctx), (err) => err.code === 'ai_timeout' && err.status === 504)
  assert.equal(ctx.calls.length, 0)
  assert.equal(ctx.refunds.length, 1)
})
