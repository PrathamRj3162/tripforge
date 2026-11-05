import fs from 'node:fs'
import path from 'node:path'

// Minimal .env parser (so the scripts need no extra package).
export function parseEnv(text) {
  const out = {}
  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line)
    if (!match) continue
    let value = match[2].trim()
    const quote = value[0]
    if ((quote === '"' || quote === "'") && value.length >= 2 && value.endsWith(quote)) value = value.slice(1, -1)
    else value = value.replace(/\s+#.*$/, '')
    out[match[1]] = value
  }
  return out
}

// Same precedence as Vite: .env, then .env.local. Real environment variables win over both.
export function loadEnv(cwd = process.cwd(), files = ['.env', '.env.local']) {
  const merged = {}
  for (const name of files) {
    const file = path.join(cwd, name)
    if (fs.existsSync(file)) Object.assign(merged, parseEnv(fs.readFileSync(file, 'utf8')))
  }
  const real = Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== undefined && v !== ''))
  return { ...merged, ...real }
}
