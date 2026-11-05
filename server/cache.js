import { createHash } from 'node:crypto'

// Bump this when the prompt or the trip schema changes, so old cached plans are ignored.
export const CACHE_VERSION = 1

// The same destination, days, budget and travelers always map to the same key (case and spacing ignored).
export function cacheKey({ destination, days, budget, travelers }) {
  const name = String(destination).normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim()
  return createHash('sha256').update(JSON.stringify([CACHE_VERSION, name, days, budget, travelers])).digest('hex')
}

const toDate = (value) => (value && typeof value.toDate === 'function' ? value.toDate() : new Date(value))

export async function readCache({ db, key, now = new Date() }) {
  const snap = await db.collection('tripCache').doc(key).get()
  if (!snap.exists) return null
  const data = snap.data()
  if (!data?.plan || !data.expiresAt || toDate(data.expiresAt) <= now) return null
  return data.plan
}

export async function writeCache({ db, key, plan, model, ttlMs, now = new Date() }) {
  await db.collection('tripCache').doc(key).set({
    plan: JSON.parse(JSON.stringify(plan)), // Firestore rejects `undefined` values
    model,
    version: CACHE_VERSION,
    createdAt: now,
    expiresAt: new Date(now.getTime() + ttlMs),
  })
}
