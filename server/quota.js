// Daily AI quota stored in Firestore, so it is exact across every serverless instance.
// Two counters per UTC day: one for the user and one for the whole app (protects the free Gemini tier).

const DAY_MS = 24 * 60 * 60 * 1000

export const utcDay = (now) => now.toISOString().slice(0, 10)

function secondsUntilNextUtcDay(now) {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000))
}

function refs(db, uid, day) {
  return { user: db.collection('usage').doc(`${day}_${uid}`), global: db.collection('usage').doc(`${day}_global`) }
}

// Atomically checks both counters and adds one to each. Returns { ok, remaining, day } or { ok:false, scope }.
export async function consumeQuota({ db, uid, now = new Date(), userLimit, globalLimit }) {
  const day = utcDay(now)
  const { user, global } = refs(db, uid, day)
  const expiresAt = new Date(now.getTime() + 3 * DAY_MS) // lets a Firestore TTL policy clean up old counters
  return db.runTransaction(async (tx) => {
    const userSnap = await tx.get(user)
    const globalSnap = await tx.get(global)
    const userCount = userSnap.exists ? userSnap.data().count ?? 0 : 0
    const globalCount = globalSnap.exists ? globalSnap.data().count ?? 0 : 0
    const retryAfterSec = secondsUntilNextUtcDay(now)
    if (userCount >= userLimit) return { ok: false, scope: 'user', limit: userLimit, retryAfterSec }
    if (globalCount >= globalLimit) return { ok: false, scope: 'global', limit: globalLimit, retryAfterSec }
    tx.set(user, { uid, day, count: userCount + 1, expiresAt })
    tx.set(global, { day, count: globalCount + 1, expiresAt })
    return { ok: true, remaining: userLimit - (userCount + 1), day }
  })
}

// Gives one unit back (used when the AI failed and the user got nothing).
export async function refundQuota({ db, uid, day }) {
  const { user, global } = refs(db, uid, day)
  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(user)
    const globalSnap = await tx.get(global)
    if (userSnap.exists && (userSnap.data().count ?? 0) > 0) tx.update(user, { count: userSnap.data().count - 1 })
    if (globalSnap.exists && (globalSnap.data().count ?? 0) > 0) tx.update(global, { count: globalSnap.data().count - 1 })
  })
}
