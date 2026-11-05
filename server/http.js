import { randomUUID } from 'node:crypto'
import { HttpError } from './errors.js'

export function json(data, init = {}) {
  return Response.json(data, init)
}

// Reads a small JSON body. Size and content type are checked before parsing.
export async function readJson(request, { maxChars = 8192 } = {}) {
  const type = (request.headers.get('content-type') || '').toLowerCase()
  if (!type.includes('application/json')) {
    throw new HttpError(415, 'unsupported_media_type', 'Send JSON with Content-Type: application/json.')
  }
  const text = await request.text()
  if (text.length > maxChars) {
    throw new HttpError(413, 'payload_too_large', 'The request body is too large.')
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new HttpError(400, 'invalid_json', 'The request body is not valid JSON.')
  }
}

function finalize(response, requestId) {
  const headers = new Headers(response.headers)
  headers.set('X-Request-Id', requestId)
  headers.set('X-Content-Type-Options', 'nosniff')
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

function errorResponse(err, requestId, route, log) {
  if (err instanceof HttpError) {
    if (err.status >= 500) {
      log.error(JSON.stringify({
        level: 'error', route, requestId, code: err.code, message: err.message,
        cause: err.cause ? String(err.cause.message ?? err.cause).slice(0, 300) : undefined,
      }))
    }
    const body = { error: { code: err.code, message: err.message, requestId, ...(err.details ?? {}) } }
    return Response.json(body, { status: err.status, headers: err.headers })
  }
  // Unknown error = a bug. Log it for us, tell the client nothing useful.
  log.error(JSON.stringify({
    level: 'error', route, requestId, name: err?.name, message: String(err?.message ?? err).slice(0, 300),
  }))
  const body = { error: { code: 'internal_error', message: 'Something went wrong on our side.', requestId } }
  return Response.json(body, { status: 500 })
}

// Wraps a handler: method check, uniform JSON errors, request id, safe default headers.
export function withApi({ route, methods }, handler, { log = console } = {}) {
  return async function apiHandler(request) {
    const requestId = randomUUID()
    try {
      if (!methods.includes(request.method)) {
        throw new HttpError(405, 'method_not_allowed', `Use ${methods.join(' or ')} for this endpoint.`, {
          headers: { Allow: methods.join(', ') },
        })
      }
      const response = await handler(request, { requestId })
      return finalize(response, requestId)
    } catch (err) {
      return finalize(errorResponse(err, requestId, route, log), requestId)
    }
  }
}
