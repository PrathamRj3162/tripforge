import test from 'node:test'
import assert from 'node:assert/strict'
import { HttpError } from '../server/errors.js'
import { createPlacesClient } from '../server/places.js'

const reply = (data, status = 200) => ({ ok: status < 400, status, json: async () => data })
const PHOTO = 'places/ChIJabc123/photos/AUacSh_xyz-9'

function client(handlers, options = {}) {
  const requests = []
  const fetchImpl = async (url, init) => {
    requests.push({ url, init })
    return handlers.shift()(url, init)
  }
  return { api: createPlacesClient({ apiKey: 'KEY', fetchImpl, ...options }), requests }
}

test('autocomplete sends the key in a header, limits to cities by default and maps results', async () => {
  const { api, requests } = client([() => reply({
    suggestions: [
      { placePrediction: { placeId: 'p1', text: { text: 'Paris, France' }, structuredFormat: { mainText: { text: 'Paris' }, secondaryText: { text: 'France' } } } },
      { queryPrediction: { text: { text: 'paris hotels' } } },
      { placePrediction: { placeId: 'p2', text: { text: 'Paris, TX, USA' } } },
    ],
  })])
  const out = await api.autocomplete('Par')
  assert.deepEqual(out[0], { id: 'p1', label: 'Paris, France', main: 'Paris', secondary: 'France' })
  assert.deepEqual(out[1], { id: 'p2', label: 'Paris, TX, USA', main: 'Paris, TX, USA', secondary: '' })
  assert.equal(out.length, 2)
  const { url, init } = requests[0]
  assert.equal(url, 'https://places.googleapis.com/v1/places:autocomplete')
  assert.equal(init.method, 'POST')
  assert.equal(init.headers['X-Goog-Api-Key'], 'KEY')
  assert.equal(url.includes('KEY'), false)
  assert.deepEqual(JSON.parse(init.body), { input: 'Par', includedPrimaryTypes: ['(cities)'] })
})

test('autocomplete without a type filter sends only the input', async () => {
  const { api, requests } = client([() => reply({})], { types: [] })
  assert.deepEqual(await api.autocomplete('Par'), [])
  assert.deepEqual(JSON.parse(requests[0].init.body), { input: 'Par' })
})

test('an upstream error becomes a 502 without exposing the status to the client', async () => {
  const { api } = client([() => reply({}, 403)])
  await assert.rejects(api.autocomplete('Par'), (err) => {
    assert.ok(err instanceof HttpError)
    assert.equal(err.status, 502)
    assert.equal(err.code, 'places_unavailable')
    assert.equal(err.message.includes('403'), false)
    assert.match(err.cause.message, /403/)
    return true
  })
})

test('findPhoto prefers the 4th photo, falls back to the first, and returns the credit', async () => {
  const many = Array.from({ length: 5 }, (_, i) => ({ name: `places/ChIJabc123/photos/P${i}`, authorAttributions: [{ displayName: `Author ${i}` }] }))
  const { api, requests } = client([
    () => reply({ places: [{ photos: many }] }),
    () => reply({ photoUri: '//lh3.googleusercontent.com/abc=s800' }),
  ])
  const photo = await api.findPhoto('Louvre, Paris')
  assert.deepEqual(photo, { url: 'https://lh3.googleusercontent.com/abc=s800', attribution: 'Author 3' })
  assert.equal(requests[0].init.headers['X-Goog-FieldMask'], 'places.id,places.displayName,places.photos')
  assert.deepEqual(JSON.parse(requests[0].init.body), { textQuery: 'Louvre, Paris' })
  assert.equal(requests[1].url, 'https://places.googleapis.com/v1/places/ChIJabc123/photos/P3/media?maxWidthPx=800&skipHttpRedirect=true')
  assert.equal(requests[1].url.includes('KEY'), false)
  assert.equal(requests[1].init.headers['X-Goog-Api-Key'], 'KEY')

  const { api: api2 } = client([
    () => reply({ places: [{ photos: [{ name: PHOTO }] }] }),
    () => reply({ photoUri: 'https://lh3.googleusercontent.com/one' }),
  ])
  assert.deepEqual(await api2.findPhoto('x'), { url: 'https://lh3.googleusercontent.com/one', attribution: null })
})

test('no photos, or a suspicious photo name, means no image and no second request', async () => {
  const none = client([() => reply({ places: [] })])
  assert.deepEqual(await none.api.findPhoto('x'), { url: null, attribution: null })
  assert.equal(none.requests.length, 1)
  const weird = client([() => reply({ places: [{ photos: [{ name: 'places/x/photos/y/../../admin' }] }] })])
  assert.deepEqual(await weird.api.findPhoto('x'), { url: null, attribution: null })
  assert.equal(weird.requests.length, 1)
})

test('only https image links are returned', async () => {
  const { api } = client([
    () => reply({ places: [{ photos: [{ name: PHOTO }] }] }),
    () => reply({ photoUri: 'javascript:alert(1)' }),
  ])
  assert.deepEqual(await api.findPhoto('x'), { url: null, attribution: null })
})

test('photo errors become 502', async () => {
  const a = client([() => reply({}, 429)])
  await assert.rejects(a.api.findPhoto('x'), (err) => err.code === 'places_unavailable')
  const b = client([() => reply({ places: [{ photos: [{ name: PHOTO }] }] }), () => reply({}, 500)])
  await assert.rejects(b.api.findPhoto('x'), (err) => err.code === 'places_unavailable')
})
