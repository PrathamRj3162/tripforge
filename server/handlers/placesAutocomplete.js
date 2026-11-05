import { requireUser } from '../auth.js'
import { HttpError } from '../errors.js'
import { json, withApi } from '../http.js'
import { parseSearchText } from '../input.js'
import { createRateLimiter } from '../rateLimit.js'

// GET /api/places-autocomplete?input=par   (needs a Firebase ID token)
export function createPlacesAutocompleteHandler({
  verifyIdToken, getPlaces, limiter = createRateLimiter({ windowMs: 60_000, max: 60 }), log,
}) {
  return withApi({ route: 'places-autocomplete', methods: ['GET'] }, async (request) => {
    const user = await requireUser(request, verifyIdToken)

    const burst = limiter.check(user.uid)
    if (!burst.ok) {
      throw new HttpError(429, 'rate_limited', 'Too many searches. Please wait a moment.', {
        headers: { 'Retry-After': String(burst.retryAfterSec) }, details: { retryAfterSec: burst.retryAfterSec },
      })
    }

    const input = parseSearchText(new URL(request.url).searchParams.get('input'), { min: 2, max: 80 })
    const suggestions = await getPlaces().autocomplete(input)
    return json({ suggestions }, { headers: { 'Cache-Control': 'private, max-age=300' } })
  }, { log })
}
