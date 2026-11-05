import { auth } from './firebase'

export class ApiError extends Error {
  constructor(status, code, message, details = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

// Every call to our own server carries the user's Firebase ID token.
// The server checks it; the browser never holds a Gemini or Places key.
async function apiFetch(path, { method = 'GET', body, signal } = {}) {
  const user = auth?.currentUser
  if (!user) throw new ApiError(401, 'unauthenticated', 'Please sign in first.')
  const token = await user.getIdToken()

  let response
  try {
    response = await fetch(path, {
      method,
      signal,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError(0, 'network_error', 'Could not reach the server. Check your connection.')
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // the body was not JSON
  }
  if (!response.ok) {
    const e = data?.error
    throw new ApiError(response.status, e?.code ?? 'http_error', e?.message ?? `Request failed (${response.status}).`, e ?? {})
  }
  return data
}

export const generateTrip = (input) => apiFetch('/api/generate-trip', { method: 'POST', body: input })
export const searchPlaces = (input, signal) => apiFetch(`/api/places-autocomplete?input=${encodeURIComponent(input)}`, { signal })
export const fetchPlacePhoto = (query) => apiFetch(`/api/place-photo?q=${encodeURIComponent(query)}`)
