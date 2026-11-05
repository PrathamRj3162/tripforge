#!/usr/bin/env node
// Preflight check. It NEVER prints a secret value, only names and yes/no.
//   npm run doctor                  checks your .env.local (no network)
//   npm run doctor -- --live        also tries each service with your keys
//   npm run doctor -- --models      lists the Gemini models your key can use
import { loadServiceAccount } from '../server/config.js'
import { loadEnv } from './lib/env.mjs'

const args = new Set(process.argv.slice(2))
const env = loadEnv()
const results = []
const add = (status, name, detail = '') => results.push({ status, name, detail })
const has = (key) => Boolean(env[key])
const fetchJson = (url, init = {}) => fetch(url, { ...init, signal: AbortSignal.timeout(15_000) })

// ---------- static checks ----------
const major = Number(process.versions.node.split('.')[0])
add(major >= 20 ? 'ok' : 'fail', 'Node.js 20 or newer', `you have ${process.versions.node}`)

for (const key of ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID']) {
  add(has(key) ? 'ok' : 'fail', key, has(key) ? 'set' : 'missing (Firebase console > Project settings > Your apps)')
}
add(has('GEMINI_API_KEY') ? 'ok' : 'fail', 'GEMINI_API_KEY', has('GEMINI_API_KEY') ? 'set' : 'missing (aistudio.google.com > Get API key)')
add(has('GOOGLE_PLACES_API_KEY') ? 'ok' : 'fail', 'GOOGLE_PLACES_API_KEY', has('GOOGLE_PLACES_API_KEY') ? 'set' : 'missing (Cloud console > enable Places API (New) > create key)')

let account = null
try {
  account = loadServiceAccount(env)
  add('ok', 'Firebase service account', `project_id ${account.project_id}`)
  if (env.VITE_FIREBASE_PROJECT_ID && env.VITE_FIREBASE_PROJECT_ID !== account.project_id) {
    add('fail', 'Same Firebase project everywhere', `service account is for "${account.project_id}" but VITE_FIREBASE_PROJECT_ID is "${env.VITE_FIREBASE_PROJECT_ID}"`)
  }
} catch (err) {
  add('fail', 'Firebase service account', 'missing or unreadable. Run: npm run encode:sa -- path/to/key.json')
}

const leaked = Object.keys(env).filter((k) => k.startsWith('VITE_') && /(SECRET|PRIVATE|SERVICE|GEMINI|PLACES|TOKEN)/i.test(k))
add(leaked.length === 0 ? 'ok' : 'fail', 'No secret has a VITE_ prefix', leaked.length ? `these would be shipped to the browser: ${leaked.join(', ')}` : 'good')

// ---------- live checks ----------
async function live() {
  const model = env.GEMINI_MODEL || 'gemini-3.8-flash'

  if (has('GEMINI_API_KEY')) {
    try {
      const res = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}`, {
        headers: { 'x-goog-api-key': env.GEMINI_API_KEY },
      })
      if (res.ok) add('ok', `Gemini model ${model}`, 'available to your key')
      else if (res.status === 404) add('fail', `Gemini model ${model}`, 'not found. Run: npm run doctor -- --models, then set GEMINI_MODEL')
      else add('fail', 'Gemini API key', `HTTP ${res.status}: key invalid, restricted, or the API is not enabled`)
    } catch (err) {
      add('fail', 'Gemini API reachable', String(err.message).slice(0, 120))
    }
  }

  if (has('GOOGLE_PLACES_API_KEY')) {
    try {
      const types = env.PLACES_AUTOCOMPLETE_TYPES === undefined ? ['(cities)'] : env.PLACES_AUTOCOMPLETE_TYPES.split(',').map((s) => s.trim()).filter(Boolean)
      const body = { input: 'Paris', ...(types.length ? { includedPrimaryTypes: types } : {}) }
      const res = await fetchJson('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY }, body: JSON.stringify(body),
      })
      if (res.ok) add('ok', 'Places API (New) autocomplete', `${(await res.json()).suggestions?.length ?? 0} suggestions for "Paris"`)
      else add('fail', 'Places API (New) autocomplete', `HTTP ${res.status}: enable "Places API (New)", turn on billing, and check the key's API restriction`)
    } catch (err) {
      add('fail', 'Places API reachable', String(err.message).slice(0, 120))
    }
  }

  if (account) {
    try {
      const { initializeApp, getApps, cert } = await import('firebase-admin/app')
      const { getFirestore } = await import('firebase-admin/firestore')
      const app = getApps()[0] ?? initializeApp({ credential: cert(account) })
      await getFirestore(app).collection('usage').limit(1).get()
      add('ok', 'Firebase Admin + Firestore', `connected to ${account.project_id}`)
    } catch (err) {
      const msg = String(err?.message ?? err)
      if (err?.code === 5 || /NOT_FOUND/.test(msg)) add('fail', 'Firestore database', 'not created yet (Firebase console > Build > Firestore Database > Create database)')
      else if (/PERMISSION_DENIED/.test(msg)) add('fail', 'Firestore permission', 'the service account cannot reach Firestore (is the Cloud Firestore API enabled?)')
      else add('fail', 'Firebase Admin + Firestore', msg.slice(0, 140))
    }
  }
}

async function models() {
  if (!has('GEMINI_API_KEY')) return add('fail', 'GEMINI_API_KEY', 'missing')
  const res = await fetchJson('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': env.GEMINI_API_KEY } })
  if (!res.ok) return add('fail', 'List Gemini models', `HTTP ${res.status}`)
  const names = ((await res.json()).models ?? [])
    .filter((m) => (m.supportedGenerationMethods ?? []).includes('generateContent'))
    .map((m) => m.name.replace(/^models\//, ''))
    .filter((n) => n.startsWith('gemini'))
    .sort()
  add('ok', 'Models you can use with generateContent', names.join(', ') || 'none found')
}

if (args.has('--live')) await live()
if (args.has('--models')) await models()

const icon = { ok: '✔', fail: '✖', warn: '!' }
for (const r of results) console.log(`${icon[r.status]} ${r.name}${r.detail ? `: ${r.detail}` : ''}`)
const failed = results.filter((r) => r.status === 'fail').length
console.log(failed ? `\n${failed} problem(s). Fix them, then run this again.` : '\nAll good.')
if (!args.has('--live') && !args.has('--models')) console.log('Tip: add --live to test the keys against the real services.')
process.exit(failed ? 1 : 0)
