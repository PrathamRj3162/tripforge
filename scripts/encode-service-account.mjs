#!/usr/bin/env node
// Turns the downloaded Firebase service-account JSON into one safe line for .env.local / Vercel.
//   npm run encode:sa -- path/to/serviceAccount.json
import fs from 'node:fs'

const file = process.argv[2]
if (!file) {
  console.error('Usage: npm run encode:sa -- path/to/serviceAccount.json')
  process.exit(1)
}

const raw = fs.readFileSync(file, 'utf8')
let account
try {
  account = JSON.parse(raw)
} catch {
  console.error('That file is not valid JSON.')
  process.exit(1)
}
if (!account.project_id || !account.client_email || !account.private_key) {
  console.error('That does not look like a service account key (project_id, client_email or private_key is missing).')
  process.exit(1)
}

console.error(`Service account for project "${account.project_id}". Paste the next line into .env.local and, later, into Vercel.`)
console.error('Then keep the JSON file out of git (or delete it). Anyone with it can act as your server.\n')
console.log(`FIREBASE_SERVICE_ACCOUNT_BASE64=${Buffer.from(raw).toString('base64')}`)
