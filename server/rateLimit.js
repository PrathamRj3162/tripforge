// Small fixed-window limiter kept in memory.
// Best effort only: each serverless instance has its own counters and they reset on a cold start.
// It protects against bursts. The daily Gemini limit lives in Firestore (quota.js) and is exact.
export function createRateLimiter({ windowMs, max, now = () => Date.now(), maxKeys = 5000 }) {
  const windows = new Map()
  return {
    check(key) {
      const t = now()
      let w = windows.get(key)
      if (!w || t >= w.resetAt) {
        if (windows.size >= maxKeys) {
          for (const [k, v] of windows) if (t >= v.resetAt) windows.delete(k)
          if (windows.size >= maxKeys) windows.clear()
        }
        w = { count: 0, resetAt: t + windowMs }
        windows.set(key, w)
      }
      w.count += 1
      const ok = w.count <= max
      return { ok, remaining: Math.max(0, max - w.count), retryAfterSec: Math.max(1, Math.ceil((w.resetAt - t) / 1000)) }
    },
  }
}
