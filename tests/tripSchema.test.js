import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeTrip, parseTrip, parseTripText, toGeminiSchema } from '../server/tripSchema.js'
import { makeTrip } from './helpers/trip.js'

test('a well-formed plan passes', () => {
  const result = parseTrip(makeTrip(2), { days: 2 })
  assert.equal(result.ok, true)
  assert.equal(result.data.itinerary.length, 2)
  assert.equal(result.data.hotels[0].hotelName, 'Hotel 1')
})

test('normalizeTrip trims text, coerces ratings, cuts long lists and renumbers days', () => {
  const messy = makeTrip(3)
  messy.hotels = Array.from({ length: 9 }, (_, i) => ({ ...messy.hotels[0], hotelName: `  Hotel   ${i}  `, rating: '4,5/5' }))
  messy.itinerary[0].day = 'Day 1'
  messy.itinerary[1].plan = [...messy.itinerary[1].plan, ...messy.itinerary[1].plan, ...messy.itinerary[1].plan]
  const out = normalizeTrip(messy, { days: 2 })
  assert.equal(out.hotels.length, 6)
  assert.equal(out.hotels[0].hotelName, 'Hotel 0')
  assert.equal(out.hotels[0].rating, 4.5)
  assert.equal(out.itinerary.length, 2)
  assert.deepEqual(out.itinerary.map((d) => d.day), [1, 2])
  assert.equal(out.itinerary[1].plan.length, 6)
})

test('ratings are clamped to 0..5', () => {
  const trip = makeTrip(1)
  trip.hotels[0].rating = 99
  trip.hotels[1].rating = -3
  const result = parseTrip(trip, { days: 1 })
  assert.equal(result.ok, true)
  assert.equal(result.data.hotels[0].rating, 5)
  assert.equal(result.data.hotels[1].rating, 0)
})

test('missing or empty required fields fail and name the path', () => {
  const trip = makeTrip(2)
  delete trip.hotels[1].hotelAddress
  trip.itinerary[0].plan[0].placeName = '   '
  const result = parseTrip(trip, { days: 2 })
  assert.equal(result.ok, false)
  assert.ok(result.issues.some((i) => i.startsWith('hotels.1.hotelAddress')), result.issues.join('|'))
  assert.ok(result.issues.some((i) => i.startsWith('itinerary.0.plan.0.placeName')), result.issues.join('|'))
})

test('a rating that is not a number fails (we never invent data)', () => {
  const trip = makeTrip(1)
  trip.hotels[0].rating = 'great'
  assert.equal(parseTrip(trip, { days: 1 }).ok, false)
})

test('the wrong number of days fails', () => {
  const result = parseTrip(makeTrip(2), { days: 3 })
  assert.equal(result.ok, false)
  assert.match(result.issues[0], /exactly 3 day/)
})

test('unknown keys (for example injected image URLs) are dropped', () => {
  const trip = makeTrip(1)
  trip.hotels[0].hotelImageUrl = 'javascript:alert(1)'
  trip.extra = 'x'
  const result = parseTrip(trip, { days: 1 })
  assert.equal(result.ok, true)
  assert.equal('hotelImageUrl' in result.data.hotels[0], false)
  assert.equal('extra' in result.data, false)
})

test('non-object input fails cleanly', () => {
  for (const bad of [null, undefined, 'text', 42, []]) assert.equal(parseTrip(bad, { days: 1 }).ok, false)
})

test('parseTripText accepts code fences and rejects non-JSON', () => {
  const json = JSON.stringify(makeTrip(1))
  assert.equal(parseTripText('```json\n' + json + '\n```', { days: 1 }).ok, true)
  assert.equal(parseTripText(json, { days: 1 }).ok, true)
  const bad = parseTripText('Sure! Here is your trip', { days: 1 })
  assert.equal(bad.ok, false)
  assert.match(bad.issues[0], /not valid JSON/)
})

test('toGeminiSchema keeps the shape but drops keywords Gemini rejects', () => {
  const schema = toGeminiSchema()
  assert.equal(schema.type, 'object')
  assert.deepEqual(schema.required.sort(), ['hotels', 'itinerary', 'summary'])
  const text = JSON.stringify(schema)
  for (const keyword of ['$schema', 'minimum', 'maximum', 'minLength', 'maxLength', 'minItems', 'maxItems', 'additionalProperties', 'pattern', 'format']) {
    assert.equal(text.includes(`"${keyword}"`), false, `${keyword} should be removed`)
  }
  assert.equal(schema.properties.itinerary.items.properties.day.type, 'integer')
  assert.ok(schema.properties.hotels.items.properties.price.description)
})
