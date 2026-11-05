import { HttpError } from './errors.js'

// Every protected endpoint starts here. `verifyIdToken` is injected so tests need no Firebase.
// A missing header is rejected BEFORE any Firebase code runs.
export async function requireUser(request, verifyIdToken) {
  const header = request.headers.get('authorization') || ''
  const match = /^Bearer\s+(\S+)$/i.exec(header)
  if (!match) throw new HttpError(401, 'unauthenticated', 'Please sign in to use this feature.')
  try {
    const decoded = await verifyIdToken(match[1])
    if (!decoded?.uid) throw new Error('token has no uid')
    return { uid: decoded.uid, email: decoded.email ?? null }
  } catch (err) {
    if (err instanceof HttpError) throw err // e.g. a server misconfiguration, not the user's fault
    throw new HttpError(401, 'invalid_token', 'Your session is invalid or has expired. Please sign in again.')
  }
}
