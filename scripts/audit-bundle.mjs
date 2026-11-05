#!/usr/bin/env node
// Proves the secrets did not end up in the browser bundle.  Run after `npm run build`.
// It looks inside dist/ for (1) the real values of your server-only secrets, and (2) tell-tale strings.
// It prints file names and what was found, never the secret itself.
import fs from 'node:fs'
import path from 'node:path'
import { loadEnv } from './lib/env.mjs'

const dist = path.resolve('dist')
if (!fs.existsSync(dist)) {
  console.error('dist/ not found. Run `npm run build` first.')
  process.exit(1)
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else yield full
  }
}

const files = [...walk(dist)].filter((f) => /\.(js|mjs|css|html|map|json|txt|svg)$/i.test(f))
const contents = files.map((file) => [path.relative(process.cwd(), file), fs.readFileSync(file, 'utf8')])
const env = loadEnv()
const findings = []

// 1. The actual values of server-only secrets must not appear anywhere in dist/.
const SECRETS = ['GEMINI_API_KEY', 'GOOGLE_PLACES_API_KEY', 'FIREBASE_SERVICE_ACCOUNT_BASE64', 'FIREBASE_SERVICE_ACCOUNT_JSON']
let checkedValues = 0
for (const name of SECRETS) {
  const value = env[name]
  if (!value || value.length < 12) continue
  checkedValues += 1
  for (const [file, text] of contents) if (text.includes(value)) findings.push(`${file}: contains the value of ${name}`)
}

// 2. The browser must never talk to Gemini or Places directly, and must never hold a private key.
const PATTERNS = [
  [/-----BEGIN (RSA |EC )?PRIVATE KEY-----/, 'a private key'],
  [/generativelanguage\.googleapis\.com/, 'a direct Gemini call'],
  [/places\.googleapis\.com/, 'a direct Places call'],
  [/GEMINI_API_KEY|GOOGLE_PLACES_API_KEY|FIREBASE_SERVICE_ACCOUNT/, 'the name of a server-only variable'],
]
for (const [file, text] of contents) {
  for (const [pattern, what] of PATTERNS) if (pattern.test(text)) findings.push(`${file}: contains ${what}`)
}

console.log(`Scanned ${files.length} files in dist/ (${checkedValues} real secret value(s) from your env were searched for).`)
if (findings.length) {
  console.error('\nFAIL: secrets or direct calls found in the browser bundle:')
  for (const f of findings) console.error(` - ${f}`)
  process.exit(1)
}
console.log('PASS: no server-only secret and no direct Gemini/Places call in the browser bundle.')
