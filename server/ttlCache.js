// Tiny in-memory cache with an expiry time and a size cap (per serverless instance).
export function createTtlCache({ ttlMs, max = 500, now = () => Date.now() }) {
  const entries = new Map()
  return {
    get(key) {
      const hit = entries.get(key)
      if (!hit) return undefined
      if (hit.expiresAt <= now()) {
        entries.delete(key)
        return undefined
      }
      return hit.value
    },
    set(key, value) {
      if (entries.size >= max) entries.delete(entries.keys().next().value) // drop the oldest
      entries.set(key, { value, expiresAt: now() + ttlMs })
    },
  }
}
