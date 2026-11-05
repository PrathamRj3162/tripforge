import test from 'node:test'
import assert from 'node:assert/strict'
import { createGeminiCaller, getErrorStatus } from '../server/gemini.js'

test('getErrorStatus understands the shapes the SDK and fetch produce', () => {
  assert.equal(getErrorStatus(Object.assign(new Error('x'), { status: 429 })), 429)
  assert.equal(getErrorStatus(Object.assign(new Error('x'), { code: 503 })), 503)
  assert.equal(getErrorStatus(Object.assign(new Error('x'), { code: 'ECONNRESET' })), undefined)
  assert.equal(getErrorStatus({ name: 'TimeoutError', message: 'timed out' }), 504)
  assert.equal(getErrorStatus({ name: 'AbortError' }), 504)
  assert.equal(getErrorStatus(new Error('{"error":{"code":404,"message":"models/x is not found","status":"NOT_FOUND"}}')), 404)
  assert.equal(getErrorStatus(new Error('RESOURCE_EXHAUSTED: quota exceeded')), 429)
  assert.equal(getErrorStatus(new Error('The model is overloaded. Please try again later.')), 503)
  assert.equal(getErrorStatus(new Error('something odd')), undefined)
  assert.equal(getErrorStatus(null), undefined)
})

function fakeSdk(responder) {
  const requests = []
  class GoogleGenAI {
    constructor(options) { this.options = options; GoogleGenAI.instances.push(this) }
    models = { generateContent: async (req) => { requests.push(req); return responder(req, requests.length) } }
  }
  GoogleGenAI.instances = []
  return { loadSdk: async () => ({ GoogleGenAI }), requests, GoogleGenAI }
}

const call = (caller, over = {}) => caller({ model: 'm1', system: 'SYS', prompt: 'P', schema: { type: 'object' }, thinkingLevel: 'low', timeoutMs: 1000, ...over })

test('the request asks for JSON that matches the schema and passes the key to the SDK only', async () => {
  const sdk = fakeSdk(() => ({ text: '{"ok":true}' }))
  const caller = createGeminiCaller({ apiKey: 'SECRET', loadSdk: sdk.loadSdk })
  assert.equal(await call(caller), '{"ok":true}')
  const req = sdk.requests[0]
  assert.equal(req.model, 'm1')
  assert.equal(req.contents, 'P')
  assert.equal(req.config.systemInstruction, 'SYS')
  assert.equal(req.config.responseMimeType, 'application/json')
  assert.deepEqual(req.config.responseJsonSchema, { type: 'object' })
  assert.deepEqual(req.config.thinkingConfig, { thinkingLevel: 'LOW' })
  assert.equal(req.config.maxOutputTokens, 16384)
  assert.ok(req.config.abortSignal instanceof AbortSignal)
  assert.equal(sdk.GoogleGenAI.instances[0].options.apiKey, 'SECRET')
  assert.equal(JSON.stringify(req).includes('SECRET'), false)
})

test('the client is created once and reused', async () => {
  const sdk = fakeSdk(() => ({ text: '{}' }))
  const caller = createGeminiCaller({ apiKey: 'k', loadSdk: sdk.loadSdk })
  await call(caller)
  await call(caller)
  assert.equal(sdk.GoogleGenAI.instances.length, 1)
})

test('thinking level "off" omits the setting', async () => {
  const sdk = fakeSdk(() => ({ text: '{}' }))
  await call(createGeminiCaller({ apiKey: 'k', loadSdk: sdk.loadSdk }), { thinkingLevel: 'off' })
  assert.equal('thinkingConfig' in sdk.requests[0].config, false)
})

test('a model that rejects the thinking setting is retried once without it', async () => {
  const sdk = fakeSdk((req, n) => {
    if (n === 1) throw Object.assign(new Error('Thinking level LOW is not supported for this model'), { status: 400 })
    return { text: '{"ok":1}' }
  })
  assert.equal(await call(createGeminiCaller({ apiKey: 'k', loadSdk: sdk.loadSdk })), '{"ok":1}')
  assert.equal(sdk.requests.length, 2)
  assert.equal('thinkingConfig' in sdk.requests[1].config, false)
})

test('other 400 errors are not retried', async () => {
  const sdk = fakeSdk(() => { throw Object.assign(new Error('schema has too many states'), { status: 400 }) })
  await assert.rejects(call(createGeminiCaller({ apiKey: 'k', loadSdk: sdk.loadSdk })), /too many states/)
  assert.equal(sdk.requests.length, 1)
})

test('an empty reply is an error', async () => {
  const sdk = fakeSdk(() => ({ text: '' }))
  await assert.rejects(call(createGeminiCaller({ apiKey: 'k', loadSdk: sdk.loadSdk })), /empty reply/)
})
