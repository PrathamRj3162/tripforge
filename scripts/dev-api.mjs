// Dev-only bridge: lets `npm run dev` serve the files in /api exactly like Vercel does.
// It turns a Node request into a standard Web Request, calls `export default { fetch }`,
// and writes the Web Response back. (No Vercel CLI, no login.)
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const NAME = /^[a-z0-9][a-z0-9-]*$/

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks)
}

export function toWebRequest(req, body) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v))
    else if (value !== undefined) headers.set(key, value)
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD' && body.length > 0
  return new Request(url, { method: req.method, headers, body: hasBody ? body : undefined })
}

export async function sendWebResponse(res, response) {
  res.statusCode = response.status
  response.headers.forEach((value, key) => res.setHeader(key, value))
  res.end(Buffer.from(await response.arrayBuffer()))
}

const jsonResponse = (status, code, message) => Response.json({ error: { code, message } }, { status })

export function createApiMiddleware({ apiDir }) {
  return async function apiMiddleware(req, res, next) {
    const { pathname } = new URL(req.url, 'http://localhost')
    if (!pathname.startsWith('/api/')) return next()

    const name = pathname.slice('/api/'.length).replace(/\/+$/, '')
    const file = path.join(apiDir, `${name}.js`)
    if (!NAME.test(name) || !fs.existsSync(file)) {
      return sendWebResponse(res, jsonResponse(404, 'not_found', 'No such endpoint.'))
    }

    try {
      // The ?t= part makes Node reload the file after you edit it.
      const mod = await import(`${pathToFileURL(file).href}?t=${fs.statSync(file).mtimeMs}`)
      const handler = mod.default?.fetch ?? mod[req.method]
      if (typeof handler !== 'function') {
        return sendWebResponse(res, jsonResponse(405, 'method_not_allowed', 'This endpoint has no handler for that method.'))
      }
      const body = await readBody(req)
      return await sendWebResponse(res, await handler(toWebRequest(req, body)))
    } catch (err) {
      console.error('[dev-api]', err)
      return sendWebResponse(res, jsonResponse(500, 'internal_error', 'The dev API crashed. See the terminal.'))
    }
  }
}
