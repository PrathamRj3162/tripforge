import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { createApiMiddleware } from '../scripts/dev-api.mjs'

async function withServer(files, fn) {
  const apiDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dev-api-'))
  for (const [name, source] of Object.entries(files)) fs.writeFileSync(path.join(apiDir, name), source)
  const middleware = createApiMiddleware({ apiDir })
  const server = http.createServer((req, res) => middleware(req, res, () => { res.statusCode = 200; res.end('fell through') }))
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  try {
    await fn(`http://127.0.0.1:${server.address().port}`)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    fs.rmSync(apiDir, { recursive: true, force: true })
  }
}

const echo = `export default { async fetch(request) {
  const text = await request.text()
  return Response.json({ method: request.method, url: new URL(request.url).pathname + new URL(request.url).search, auth: request.headers.get('authorization'), body: text ? JSON.parse(text) : null }, { status: 201, headers: { 'X-Test': 'yes' } })
} }`

test('non-API paths fall through to the next middleware (Vite)', async () => {
  await withServer({ 'echo.js': echo }, async (base) => {
    assert.equal(await (await fetch(`${base}/create-trip`)).text(), 'fell through')
  })
})

test('a request reaches default.fetch as a standard Request and the Response comes back intact', async () => {
  await withServer({ 'echo.js': echo }, async (base) => {
    const res = await fetch(`${base}/api/echo?x=1`, {
      method: 'POST', headers: { Authorization: 'Bearer t', 'Content-Type': 'application/json' }, body: JSON.stringify({ hello: 'world' }),
    })
    assert.equal(res.status, 201)
    assert.equal(res.headers.get('x-test'), 'yes')
    assert.deepEqual(await res.json(), { method: 'POST', url: '/api/echo?x=1', auth: 'Bearer t', body: { hello: 'world' } })
    const get = await (await fetch(`${base}/api/echo`)).json()
    assert.equal(get.method, 'GET')
    assert.equal(get.body, null)
  })
})

test('unknown endpoints and path tricks are 404', async () => {
  await withServer({ 'echo.js': echo }, async (base) => {
    for (const p of ['/api/missing', '/api/..%2Fsecret', '/api/echo/extra', '/api/']) {
      const res = await fetch(`${base}${p}`)
      assert.equal(res.status, 404, p)
      assert.equal((await res.json()).error.code, 'not_found')
    }
  })
})

test('a crashing handler gives a JSON 500 and does not take the server down', async () => {
  const origError = console.error
  console.error = () => {}
  try {
    await withServer({ 'boom.js': 'export default { fetch() { throw new Error("boom") } }', 'echo.js': echo }, async (base) => {
      const res = await fetch(`${base}/api/boom`)
      assert.equal(res.status, 500)
      assert.equal((await res.json()).error.code, 'internal_error')
      assert.equal((await fetch(`${base}/api/echo`)).status, 201)
    })
  } finally {
    console.error = origError
  }
})

test('named method exports (export function POST) also work', async () => {
  await withServer({ 'named.js': 'export function POST() { return new Response("posted") }' }, async (base) => {
    assert.equal(await (await fetch(`${base}/api/named`, { method: 'POST' })).text(), 'posted')
    assert.equal((await fetch(`${base}/api/named`)).status, 405)
  })
})
