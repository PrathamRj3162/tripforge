import { z } from 'zod/v4'
import { MAX_DAYS } from '../shared/limits.js'

// The contract for what the AI must return. The same schema is used twice:
//   1. converted to JSON Schema and sent to Gemini, so the model is steered towards this shape;
//   2. used to validate the reply, because the model can still return wrong data.
// Nothing that fails validation is ever stored or shown.

const text = (max, description) => {
  const s = z.string().min(1).max(max)
  return description ? s.describe(description) : s
}
const rating = z.number().min(0).max(5).describe('Rating from 0 to 5 with one decimal')

const HotelSchema = z.strictObject({
  hotelName: text(120),
  hotelAddress: text(200),
  price: text(80, 'Estimated price per night with a currency symbol, for example "$80-120"'),
  rating,
  description: text(400),
})

const PlaceSchema = z.strictObject({
  placeName: text(120, 'A real, well-known place'),
  placeDetails: text(400),
  ticketPricing: text(80, 'Entry cost with a currency symbol, or "Free"'),
  rating,
  bestTime: text(80, 'Best time of day or season to visit'),
  travelTime: text(80, 'Typical travel time from the previous stop'),
})

const DaySchema = z.strictObject({
  day: z.number().int().min(1).max(MAX_DAYS),
  theme: text(120),
  plan: z.array(PlaceSchema).min(1).max(6),
})

export const TripSchema = z.strictObject({
  summary: text(600, 'Two or three sentences about the trip'),
  hotels: z.array(HotelSchema).min(1).max(6),
  itinerary: z.array(DaySchema).min(1).max(MAX_DAYS),
})

// ---- Tolerant reader: tidy what the model sent, then validate strictly ----

const str = (value, max) =>
  (value === null || value === undefined ? '' : String(value)).replace(/\s+/g, ' ').trim().slice(0, max)

function num(value) {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '').replace(',', '.'))
  return Number.isFinite(n) ? Math.min(5, Math.max(0, Math.round(n * 10) / 10)) : Number.NaN
}

const list = (value) => (Array.isArray(value) ? value : [])

// Keeps only known keys, trims text, clamps ratings, cuts lists to their maximum size and forces
// day numbers to 1..N. Missing or wrong-typed required fields are NOT invented: they fail validation.
export function normalizeTrip(raw, { days }) {
  const r = raw && typeof raw === 'object' ? raw : {}
  return {
    summary: str(r.summary, 600),
    hotels: list(r.hotels).slice(0, 6).map((h) => ({
      hotelName: str(h?.hotelName, 120),
      hotelAddress: str(h?.hotelAddress, 200),
      price: str(h?.price, 80),
      rating: num(h?.rating),
      description: str(h?.description, 400),
    })),
    itinerary: list(r.itinerary).slice(0, days).map((d, i) => ({
      day: i + 1,
      theme: str(d?.theme, 120),
      plan: list(d?.plan).slice(0, 6).map((p) => ({
        placeName: str(p?.placeName, 120),
        placeDetails: str(p?.placeDetails, 400),
        ticketPricing: str(p?.ticketPricing, 80),
        rating: num(p?.rating),
        bestTime: str(p?.bestTime, 80),
        travelTime: str(p?.travelTime, 80),
      })),
    })),
  }
}

export function parseTrip(raw, { days }) {
  const result = TripSchema.safeParse(normalizeTrip(raw, { days }))
  if (!result.success) {
    return { ok: false, issues: result.error.issues.slice(0, 8).map((i) => `${i.path.join('.') || 'root'}: ${i.message}`) }
  }
  if (result.data.itinerary.length !== days) {
    return { ok: false, issues: [`itinerary: must contain exactly ${days} day(s), got ${result.data.itinerary.length}`] }
  }
  return { ok: true, data: result.data }
}

// Parses the model's text. Code fences are tolerated even though we ask for plain JSON.
export function parseTripText(text, { days }) {
  const cleaned = String(text ?? '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  let raw
  try {
    raw = JSON.parse(cleaned)
  } catch {
    return { ok: false, issues: ['the reply was not valid JSON'] }
  }
  return parseTrip(raw, { days })
}

// ---- JSON Schema for Gemini ----
// Gemini supports only a subset of JSON Schema and rejects schemas that are too "complex"
// (it names min/max bounds and big maxItems). So the model gets the light version: types, required
// fields and descriptions. Lengths, ranges and counts are enforced by parseTrip() above.
const DROP = new Set([
  '$schema', 'additionalProperties', 'default', 'format', 'pattern',
  'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum',
  'minLength', 'maxLength', 'minItems', 'maxItems',
])

function strip(node) {
  if (Array.isArray(node)) return node.map(strip)
  if (!node || typeof node !== 'object') return node
  const out = {}
  for (const [key, value] of Object.entries(node)) {
    if (DROP.has(key)) continue
    if (key === 'properties' && value && typeof value === 'object') {
      out.properties = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, strip(v)]))
    } else {
      out[key] = strip(value)
    }
  }
  return out
}

export function toGeminiSchema(schema = TripSchema) {
  return strip(z.toJSONSchema(schema))
}
