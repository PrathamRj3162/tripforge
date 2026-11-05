import { loadServiceAccount } from './config.js'
import { HttpError } from './errors.js'

// Firebase Admin SDK, started on first use. It can verify ID tokens and it bypasses Firestore rules,
// which is why it only ever runs on the server.
let cached

export async function getAdmin(env = process.env) {
  if (cached) return cached
  try {
    const [{ initializeApp, getApps, cert }, { getAuth }, { getFirestore }] = await Promise.all([
      import('firebase-admin/app'),
      import('firebase-admin/auth'),
      import('firebase-admin/firestore'),
    ])
    const app = getApps()[0] ?? initializeApp({ credential: cert(loadServiceAccount(env)) })
    cached = { auth: getAuth(app), db: getFirestore(app) }
    return cached
  } catch (err) {
    // A start-up problem is OUR fault (500, logged), never "your token is bad" (401).
    if (err instanceof HttpError) throw err
    throw new HttpError(500, 'server_unavailable', 'The server could not connect to Firebase.', { cause: err })
  }
}
