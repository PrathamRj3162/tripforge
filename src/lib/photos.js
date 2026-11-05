import { fetchPlacePhoto } from './api'

const lookups = new Map()

// One lookup per place per page load, even when several cards ask at the same moment.
// A failed lookup is forgotten so a later render can try again; the card shows the placeholder meanwhile.
export function loadPhoto(query) {
  if (!lookups.has(query)) {
    lookups.set(query, fetchPlacePhoto(query).catch(() => {
      lookups.delete(query)
      return { url: null, attribution: null }
    }))
  }
  return lookups.get(query)
}
