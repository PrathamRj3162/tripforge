import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { builtinModules } from 'node:module'
import { fileURLToPath } from 'node:url'
import { BUDGET_IDS, TRAVELER_IDS } from '../shared/limits.js'
import { BUDGET_OPTIONS, TRAVELER_OPTIONS } from '../src/constants/options.js'

// Guards against the kind of drift that only shows up after deploying.
const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json'))

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else yield full
  }
}
const sourceFiles = (dirs, pattern = /\.(js|jsx|mjs)$/) =>
  dirs.flatMap((d) => (fs.existsSync(path.join(root, d)) ? [...walk(path.join(root, d))] : [])).filter((f) => pattern.test(f))

test('every package imported by the code is declared in package.json', () => {
  const declared = new Set([...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)])
  const builtins = new Set(builtinModules)
  const files = [...sourceFiles(['src', 'server', 'api', 'scripts', 'shared']), path.join(root, 'vite.config.js'), path.join(root, 'tailwind.config.js'), path.join(root, 'postcss.config.js')]
  const missing = new Set()
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8')
    for (const m of text.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g)) {
      const spec = m[1]
      if (spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('@/') || spec.startsWith('node:')) continue
      const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]
      if (builtins.has(name) || declared.has(name)) continue
      missing.add(`${name} (imported in ${path.relative(root, file)})`)
    }
  }
  assert.deepEqual([...missing], [])
})

test('every environment variable the code reads is documented in .env.example', () => {
  const example = read('.env.example')
  const documented = new Set([...example.matchAll(/^\s*#?\s*([A-Z][A-Z0-9_]+)=/gm)].map((m) => m[1]))
  const ignore = new Set(['VERCEL', 'NODE_ENV', 'FIREBASE_SERVICE_ACCOUNT_JSON']) // set by the platform, or an undocumented alias
  const used = new Set()
  for (const file of sourceFiles(['server', 'scripts', 'src', 'api'])) {
    const text = fs.readFileSync(file, 'utf8')
    for (const m of text.matchAll(/\b(?:env|process\.env|import\.meta\.env)\.([A-Z][A-Z0-9_]+)/g)) used.add(m[1])
    for (const m of text.matchAll(/requireEnv\(\s*['"]([A-Z][A-Z0-9_]+)['"]/g)) used.add(m[1])
  }
  const undocumented = [...used].filter((name) => !ignore.has(name) && !documented.has(name))
  assert.deepEqual(undocumented, [])
})

test('no server-only secret is referenced from the browser code or given a VITE_ prefix', () => {
  for (const file of sourceFiles(['src'])) {
    const text = fs.readFileSync(file, 'utf8')
    assert.doesNotMatch(text, /GEMINI_API_KEY|GOOGLE_PLACES_API_KEY|FIREBASE_SERVICE_ACCOUNT|generativelanguage\.googleapis|places\.googleapis/, path.relative(root, file))
    assert.doesNotMatch(text, /localStorage/, `${path.relative(root, file)} must not use localStorage for identity`)
  }
  const exampleNames = [...read('.env.example').matchAll(/^\s*([A-Z][A-Z0-9_]+)=/gm)].map((m) => m[1])
  assert.deepEqual(exampleNames.filter((n) => n.startsWith('VITE_') && /(SECRET|PRIVATE|SERVICE|GEMINI|PLACES|TOKEN)/.test(n)), [])
})

test('the option ids in the UI match what the server accepts', () => {
  assert.deepEqual(BUDGET_OPTIONS.map((o) => o.id), BUDGET_IDS)
  assert.deepEqual(TRAVELER_OPTIONS.map((o) => o.id), TRAVELER_IDS)
})

test('every file in api/ is a Vercel function that exports { fetch }', async () => {
  const files = fs.readdirSync(path.join(root, 'api')).filter((f) => f.endsWith('.js'))
  assert.ok(files.includes('generate-trip.js'))
  for (const file of files) {
    const mod = await import(path.join(root, 'api', file))
    assert.equal(typeof mod.default?.fetch, 'function', `api/${file}`)
  }
})

test('the Firestore rules are not open and tie trips to the signed-in user', () => {
  const rules = read('firestore.rules')
  assert.doesNotMatch(rules, /if\s+true/)
  assert.match(rules, /match \/users\/\{uid\}\/trips\/\{tripId\}/)
  assert.match(rules, /request\.auth\.uid == uid/)
  assert.match(rules, /allow create, update: if false/)
  assert.match(rules, /match \/usage\/\{docId\}\s*\{ allow read, write: if false; \}/)
  assert.match(rules, /match \/tripCache\/\{docId\}\s*\{ allow read, write: if false; \}/)
  assert.match(rules, /match \/\{document=\*\*\} \{\s*allow read, write: if false;/)
})

test('secrets and local env files are git-ignored', () => {
  const ignore = read('.gitignore')
  for (const pattern of ['.env', '.env.*', '!.env.example', '*.local', 'node_modules', 'dist']) assert.ok(ignore.split('\n').includes(pattern), pattern)
  assert.match(ignore, /serviceAccount/)
  assert.match(ignore, /firebase-adminsdk/)
})

test('vercel.json keeps /api out of the SPA rewrite and bounds the AI function', () => {
  const config = JSON.parse(read('vercel.json'))
  assert.equal(config.rewrites[0].source, '/((?!api/).*)')
  assert.equal(config.rewrites[0].destination, '/index.html')
  assert.ok(config.functions['api/generate-trip.js'].maxDuration >= 60)
  const headers = Object.fromEntries(config.headers[0].headers.map((h) => [h.key, h.value]))
  assert.equal(headers['X-Content-Type-Options'], 'nosniff')
  assert.equal(headers['X-Frame-Options'], 'DENY')
})

test('the pinned frameworks are the ones this project was built for', () => {
  assert.equal(pkg.type, 'module')
  assert.match(pkg.dependencies.react, /^18\./)
  assert.match(pkg.devDependencies.tailwindcss, /^3\./)
  assert.match(pkg.dependencies['react-router-dom'], /^6\./)
  for (const script of ['dev', 'build', 'test', 'check', 'doctor', 'audit:bundle', 'encode:sa']) assert.ok(pkg.scripts[script], script)
})

test('Antigravity rule and workflow files stay under its 12,000 character limit', () => {
  for (const file of sourceFiles(['.agents'], /\.md$/)) {
    assert.ok(fs.readFileSync(file, 'utf8').length < 12_000, path.relative(root, file))
  }
})
