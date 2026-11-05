import { requireUser } from '../auth.js'
import { HttpError } from '../errors.js'
import { json, readJson, withApi } from '../http.js'
import { parseGenerateInput } from '../input.js'
import { createRateLimiter } from '../rateLimit.js'

// POST /api/generate-trip   (needs a Firebase ID token)
export function createGenerateTripHandler({
  verifyIdToken, getTripService, limiter = createRateLimiter({ windowMs: 60_000, max: 6 }), log,
}) {
  return withApi({ route: 'generate-trip', methods: ['POST'] }, async (request) => {
    const user = await requireUser(request, verifyIdToken)

    const burst = limiter.check(user.uid)
    if (!burst.ok) {
      throw new HttpError(429, 'rate_limited', 'You are going too fast. Please wait a moment.', {
        headers: { 'Retry-After': String(burst.retryAfterSec) }, details: { retryAfterSec: burst.retryAfterSec },
      })
    }

    const input = parseGenerateInput(await readJson(request))
    const service = await getTripService()
    return json(await service.generate({ uid: user.uid, input }))
  }, { log })
}
