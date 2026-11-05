import test from 'node:test'
import assert from 'node:assert/strict'
import { consumeQuota, refundQuota, utcDay } from '../server/quota.js'
import { createFakeDb } from './helpers/fakeDb.js'

const T0 = new Date('2026-11-05T10:00:00Z')
const base = { userLimit: 3, globalLimit: 100 }

test('a user can use their daily limit, then is blocked', async () => {
  const db = createFakeDb()
  for (const remaining of [2, 1, 0]) {
    const q = await consumeQuota({ db, uid: 'u1', now: T0, ...base })
    assert.equal(q.ok, true)
    assert.equal(q.remaining, remaining)
  }
  const blocked = await consumeQuota({ db, uid: 'u1', now: T0, ...base })
  assert.equal(blocked.ok, false)
  assert.equal(blocked.scope, 'user')
  assert.equal(blocked.limit, 3)
})

test('users are counted separately', async () => {
  const db = createFakeDb()
  for (let i = 0; i < 3; i += 1) await consumeQuota({ db, uid: 'u1', now: T0, ...base })
  const other = await consumeQuota({ db, uid: 'u2', now: T0, ...base })
  assert.equal(other.ok, true)
  assert.equal(other.remaining, 2)
})

test('the global limit protects the whole app', async () => {
  const db = createFakeDb()
  const opts = { now: T0, userLimit: 10, globalLimit: 2 }
  assert.equal((await consumeQuota({ db, uid: 'a', ...opts })).ok, true)
  assert.equal((await consumeQuota({ db, uid: 'b', ...opts })).ok, true)
  const blocked = await consumeQuota({ db, uid: 'c', ...opts })
  assert.equal(blocked.ok, false)
  assert.equal(blocked.scope, 'global')
})

test('a blocked request does not change any counter', async () => {
  const db = createFakeDb()
  const opts = { now: T0, userLimit: 1, globalLimit: 5 }
  await consumeQuota({ db, uid: 'u1', ...opts })
  await consumeQuota({ db, uid: 'u1', ...opts })
  assert.equal(db.store.get(`usage/2026-11-05_u1`).count, 1)
  assert.equal(db.store.get(`usage/2026-11-05_global`).count, 1)
})

test('the counter resets on the next UTC day', async () => {
  const db = createFakeDb()
  for (let i = 0; i < 3; i += 1) await consumeQuota({ db, uid: 'u1', now: T0, ...base })
  const nextDay = new Date('2026-11-06T00:00:01Z')
  const q = await consumeQuota({ db, uid: 'u1', now: nextDay, ...base })
  assert.equal(q.ok, true)
  assert.equal(q.remaining, 2)
  assert.equal(utcDay(nextDay), '2026-11-06')
})

test('retryAfterSec points at the next UTC midnight', async () => {
  const db = createFakeDb()
  const late = new Date('2026-11-05T23:59:00Z')
  await consumeQuota({ db, uid: 'u1', now: late, userLimit: 1, globalLimit: 5 })
  const blocked = await consumeQuota({ db, uid: 'u1', now: late, userLimit: 1, globalLimit: 5 })
  assert.equal(blocked.retryAfterSec, 60)
})

test('counters carry an expiry so a Firestore TTL policy can clean them up', async () => {
  const db = createFakeDb()
  await consumeQuota({ db, uid: 'u1', now: T0, ...base })
  const doc = db.store.get('usage/2026-11-05_u1')
  assert.ok(doc.expiresAt > T0)
  assert.equal(doc.uid, 'u1')
})

test('refund gives one unit back and never goes below zero', async () => {
  const db = createFakeDb()
  const q = await consumeQuota({ db, uid: 'u1', now: T0, ...base })
  await refundQuota({ db, uid: 'u1', day: q.day })
  assert.equal(db.store.get('usage/2026-11-05_u1').count, 0)
  assert.equal(db.store.get('usage/2026-11-05_global').count, 0)
  await refundQuota({ db, uid: 'u1', day: q.day })
  assert.equal(db.store.get('usage/2026-11-05_u1').count, 0)
  await refundQuota({ db, uid: 'nobody', day: '2020-01-01' }) // missing docs are ignored
})
