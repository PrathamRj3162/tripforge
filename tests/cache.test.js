import test from 'node:test'
import assert from 'node:assert/strict'
import { CACHE_VERSION, cacheKey, readCache, writeCache } from '../server/cache.js'
import { createFakeDb } from './helpers/fakeDb.js'
import { makeTrip } from './helpers/trip.js'

const input = { destination: 'Paris, France', days: 3, budget: 'moderate', travelers: 'couple' }
const NOW = new Date('2026-11-05T10:00:00Z')

test('the key ignores case and extra spaces but not the details that change the plan', () => {
  const key = cacheKey(input)
  assert.match(key, /^[0-9a-f]{64}$/)
  assert.equal(cacheKey({ ...input, destination: '  PARIS,   france ' }), key)
  assert.notEqual(cacheKey({ ...input, days: 4 }), key)
  assert.notEqual(cacheKey({ ...input, budget: 'luxury' }), key)
  assert.notEqual(cacheKey({ ...input, travelers: 'solo' }), key)
  assert.notEqual(cacheKey({ ...input, destination: 'Lyon, France' }), key)
  assert.equal(typeof CACHE_VERSION, 'number')
})

test('write then read returns the plan until it expires', async () => {
  const db = createFakeDb()
  const key = cacheKey(input)
  assert.equal(await readCache({ db, key, now: NOW }), null)
  await writeCache({ db, key, plan: makeTrip(3), model: 'm1', ttlMs: 60_000, now: NOW })
  const hit = await readCache({ db, key, now: new Date(NOW.getTime() + 30_000) })
  assert.equal(hit.hotels.length, 3)
  assert.equal(await readCache({ db, key, now: new Date(NOW.getTime() + 61_000) }), null)
})

test('Firestore timestamp objects are understood', async () => {
  const db = createFakeDb()
  const key = 'k'
  await db.collection('tripCache').doc(key).set({ plan: makeTrip(1), expiresAt: { toDate: () => new Date(NOW.getTime() + 1000) } })
  assert.ok(await readCache({ db, key, now: NOW }))
})

test('undefined values are stripped before writing', async () => {
  const db = createFakeDb()
  const plan = { ...makeTrip(1), maybe: undefined }
  await writeCache({ db, key: 'k', plan, model: 'm', ttlMs: 1000, now: NOW })
  assert.equal('maybe' in db.store.get('tripCache/k').plan, false)
})

test('a document without a plan or expiry is treated as a miss', async () => {
  const db = createFakeDb()
  await db.collection('tripCache').doc('a').set({ expiresAt: new Date(NOW.getTime() + 1000) })
  await db.collection('tripCache').doc('b').set({ plan: makeTrip(1) })
  assert.equal(await readCache({ db, key: 'a', now: NOW }), null)
  assert.equal(await readCache({ db, key: 'b', now: NOW }), null)
})
