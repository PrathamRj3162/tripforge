import { requireUser } from '../auth.js'
import { HttpError } from '../errors.js'
import { json, withApi } from '../http.js'
import { parseSearchText } from '../input.js'
import { createRateLimiter } from '../rateLimit.js'
import { createTtlCache } from '../ttlCache.js'

// GET /api/place-photo?q=Hotel%20Name,%20City   (needs a Firebase ID token)
// Returns { url, attribution }. `url` is a temporary Google image link that does not contain our API key.
export function createPlacePhotoHandler({
  verifyIdToken, getPlaces, limiter = createRateLimiter({ windowMs: 60_000, max: 120 }),
  cache = createTtlCache({ ttlMs: 6 * 60 * 60 * 1000, max: 500 }), log,
}) {
  return withApi({ route: 'place-photo', methods: ['GET'] }, async (request) => {
    const user = await requireUser(request, verifyIdToken)

    const burst = limiter.check(user.uid)
    if (!burst.ok) {
      throw new HttpError(429, 'rate_limited', 'Too many photo requests. Please wait a moment.', {
        headers: { 'Retry-After': String(burst.retryAfterSec) }, details: { retryAfterSec: burst.retryAfterSec },
      })
    }

    const query = parseSearchText(new URL(request.url).searchParams.get('q'), { min: 2, max: 160 })
    let photo = cache.get(query)
    if (!photo) {
      photo = await getPlaces().findPhoto(query)
      cache.set(query, photo)
    }
    return json(photo, { headers: { 'Cache-Control': 'private, max-age=86400' } })
  }, { log })
}
