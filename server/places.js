import { HttpError } from './errors.js'

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete'
const SEARCH_TEXT_URL = 'https://places.googleapis.com/v1/places:searchText'
const PHOTO_NAME = /^places\/[\w-]+\/photos\/[\w-]+$/

function upstreamError(what, status) {
  return new HttpError(502, 'places_unavailable', 'Place search is temporarily unavailable.', {
    cause: new Error(`Places ${what} answered with HTTP ${status}`),
  })
}

const httpsOnly = (url) => {
  if (typeof url !== 'string') return null
  const absolute = url.startsWith('//') ? `https:${url}` : url
  return absolute.startsWith('https://') ? absolute : null
}

// Thin wrapper over Places API (New). The API key stays on the server; the browser only sees results.
export function createPlacesClient({ apiKey, types = ['(cities)'], fetchImpl = fetch, timeoutMs = 8000 }) {
  const headers = (extra = {}) => ({ 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, ...extra })

  return {
    async autocomplete(input) {
      const body = { input }
      if (types.length > 0) body.includedPrimaryTypes = types
      const res = await fetchImpl(AUTOCOMPLETE_URL, {
        method: 'POST', headers: headers(), body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs),
      })
      if (!res.ok) throw upstreamError('autocomplete', res.status)
      const data = await res.json()
      return (data.suggestions ?? [])
        .map((s) => s.placePrediction)
        .filter(Boolean)
        .map((p) => ({
          id: String(p.placeId ?? ''),
          label: String(p.text?.text ?? ''),
          main: String(p.structuredFormat?.mainText?.text ?? p.text?.text ?? ''),
          secondary: String(p.structuredFormat?.secondaryText?.text ?? ''),
        }))
        .filter((s) => s.label)
        .slice(0, 6)
    },

    // Finds a place by text and returns a temporary image URL plus the author credit Google requires.
    async findPhoto(query) {
      const search = await fetchImpl(SEARCH_TEXT_URL, {
        method: 'POST',
        headers: headers({ 'X-Goog-FieldMask': 'places.id,places.displayName,places.photos' }),
        body: JSON.stringify({ textQuery: query }),
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (!search.ok) throw upstreamError('text search', search.status)
      const photos = (await search.json()).places?.[0]?.photos ?? []
      const photo = photos[3] ?? photos[0] // the 4th photo looks best; fall back to the first
      if (!photo?.name || !PHOTO_NAME.test(photo.name)) return { url: null, attribution: null }

      const media = await fetchImpl(`https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=800&skipHttpRedirect=true`, {
        headers: { 'X-Goog-Api-Key': apiKey }, signal: AbortSignal.timeout(timeoutMs),
      })
      if (!media.ok) throw upstreamError('photo', media.status)
      const url = httpsOnly((await media.json()).photoUri)
      return { url, attribution: url ? photo.authorAttributions?.[0]?.displayName ?? null : null }
    },
  }
}
