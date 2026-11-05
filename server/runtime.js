import { readCache, writeCache } from './cache.js'
import { getConfig, requireEnv } from './config.js'
import { getAdmin } from './firebaseAdmin.js'
import { createGeminiCaller } from './gemini.js'
import { createPlacesClient } from './places.js'
import { consumeQuota, refundQuota } from './quota.js'
import { saveTrip } from './trips.js'
import { createTripService } from './tripService.js'
import { toGeminiSchema } from './tripSchema.js'

// Wires the real services into the handlers. Nothing here starts until a request needs it,
// so a request without a login is answered (401) before any key is touched.

// getAdmin() failing is a server problem (500). Only a failing verifyIdToken() means "bad token" (401).
export async function verifyIdToken(token) {
  const { auth } = await getAdmin()
  return auth.verifyIdToken(token)
}

let tripService
export async function getTripService() {
  if (tripService) return tripService
  const config = getConfig()
  const apiKey = requireEnv('GEMINI_API_KEY')
  const { db } = await getAdmin()
  tripService = createTripService({
    config,
    geminiSchema: toGeminiSchema(),
    callModel: createGeminiCaller({ apiKey }),
    readCache: (key) => readCache({ db, key }),
    writeCache: (key, plan, model) => writeCache({ db, key, plan, model, ttlMs: config.cacheTtlMs }),
    consumeQuota: ({ uid }) => consumeQuota({ db, uid, userLimit: config.dailyTripLimit, globalLimit: config.globalDailyTripLimit }),
    refundQuota: ({ uid, day }) => refundQuota({ db, uid, day }),
    saveTrip: (args) => saveTrip({ db, ...args }),
  })
  return tripService
}

let places
export function getPlaces() {
  if (!places) places = createPlacesClient({ apiKey: requireEnv('GOOGLE_PLACES_API_KEY'), types: getConfig().placesTypes })
  return places
}

export const realDeps = { verifyIdToken, getTripService, getPlaces }
