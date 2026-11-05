import { z } from 'zod/v4'
import { BUDGET_IDS, MAX_DAYS, MIN_DAYS, TRAVELER_IDS } from '../shared/limits.js'
import { HttpError } from './errors.js'

// The destination goes into the prompt, so it is reduced to letters, numbers, spaces and a few
// punctuation marks used in place names. Newlines, quotes, braces and other symbols are removed.
export function sanitizePlaceName(value) {
  if (typeof value !== 'string') return value
  return value
    .normalize('NFKC')
    .replace(/[^\p{L}\p{M}\p{N} .,'’()&/-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const GenerateInput = z.strictObject({
  destination: z.string().min(2).max(100),
  days: z.number().int().min(MIN_DAYS).max(MAX_DAYS),
  budget: z.enum(BUDGET_IDS),
  travelers: z.enum(TRAVELER_IDS),
  fresh: z.boolean().optional().default(false),
})

export function parseGenerateInput(body) {
  const candidate = body && typeof body === 'object' && !Array.isArray(body)
    ? { ...body, destination: sanitizePlaceName(body.destination) }
    : body
  const result = GenerateInput.safeParse(candidate)
  if (!result.success) {
    const issues = result.error.issues.slice(0, 6).map((i) => `${i.path.join('.') || 'body'}: ${i.message}`)
    throw new HttpError(400, 'invalid_input', 'Please check your trip details.', { details: { issues } })
  }
  return result.data
}

// Used by the Places proxy endpoints (same idea: short, plain text).
export function parseSearchText(value, { min = 2, max = 120 } = {}) {
  const text = sanitizePlaceName(typeof value === 'string' ? value : '')
  if (text.length < min || text.length > max) {
    throw new HttpError(400, 'invalid_input', `Text must be ${min} to ${max} characters.`)
  }
  return text
}
