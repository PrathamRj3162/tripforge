import { cacheKey } from './cache.js'
import { HttpError } from './errors.js'
import { getErrorStatus } from './gemini.js'
import { buildPrompt, buildRepairPrompt, SYSTEM_INSTRUCTION } from './prompt.js'
import { parseTrip, parseTripText } from './tripSchema.js'

// Statuses that mean "this model cannot help right now": try the next model.
const TRY_NEXT_MODEL = new Set([404, 429, 500, 502, 503, 504])

function mapModelError(err) {
  if (err instanceof HttpError) return err
  const status = getErrorStatus(err)
  if (status === 401 || status === 403) {
    return new HttpError(502, 'ai_auth_failed', 'The AI service rejected the server credentials.', { cause: err })
  }
  if (status === 429) {
    return new HttpError(503, 'ai_busy', 'The AI service is at capacity right now. Please try again in a few minutes.', {
      headers: { 'Retry-After': '60' }, cause: err,
    })
  }
  if (status === 404) {
    return new HttpError(502, 'ai_model_unavailable', 'The configured AI model is not available.', { cause: err })
  }
  if (status === 504) {
    return new HttpError(504, 'ai_timeout', 'The AI took too long to answer. Please try again.', { cause: err })
  }
  return new HttpError(502, 'ai_failed', 'The AI service failed. Please try again.', { cause: err })
}

function quotaError(quota) {
  const headers = { 'Retry-After': String(quota.retryAfterSec) }
  const details = { retryAfterSec: quota.retryAfterSec }
  if (quota.scope === 'global') {
    return new HttpError(429, 'ai_capacity_reached', 'The app has reached its daily AI limit. Please try again tomorrow (UTC). Popular trips may still work because they are cached.', { headers, details })
  }
  return new HttpError(429, 'daily_limit_reached', `You have used your ${quota.limit} AI trip plans for today. Please try again tomorrow (UTC).`, { headers, details })
}

// Tries each model in turn. A reply that fails validation gets ONE repair retry in total
// (it costs a request, so it is limited). Stops when the time budget is used up.
async function generateWithFallback({ input, config, callModel, geminiSchema, now }) {
  const models = [config.geminiModel, ...config.geminiFallbackModels]
  const basePrompt = buildPrompt(input)
  const deadline = now().getTime() + config.totalBudgetMs
  let repairUsed = false
  let lastError = null

  for (const model of models) {
    let prompt = basePrompt
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const remaining = deadline - now().getTime()
      if (remaining < 5_000) throw lastError ? mapModelError(lastError) : new HttpError(504, 'ai_timeout', 'The AI took too long to answer. Please try again.')
      try {
        const text = await callModel({
          model,
          system: SYSTEM_INSTRUCTION,
          prompt,
          schema: geminiSchema,
          thinkingLevel: config.geminiThinkingLevel,
          timeoutMs: Math.min(config.modelTimeoutMs, remaining),
        })
        const parsed = parseTripText(text, { days: input.days })
        if (parsed.ok) return { plan: parsed.data, model }
        lastError = new HttpError(502, 'bad_model_output', 'The AI returned a plan that did not pass validation. Please try again.', {
          cause: new Error(parsed.issues.join('; ')),
        })
        if (repairUsed) break
        repairUsed = true
        prompt = buildRepairPrompt(basePrompt, parsed.issues)
      } catch (err) {
        if (!TRY_NEXT_MODEL.has(getErrorStatus(err))) throw mapModelError(err)
        lastError = err
        break
      }
    }
  }
  throw mapModelError(lastError)
}

// Orchestrates one request: cache -> daily quota -> Gemini (validated) -> cache + save.
// Every dependency is injected, so the whole flow is unit-tested without Google or Firebase.
export function createTripService({
  config, geminiSchema, callModel, readCache, writeCache, consumeQuota, refundQuota, saveTrip, now = () => new Date(),
}) {
  return {
    async generate({ uid, input }) {
      const key = cacheKey(input)

      if (!input.fresh) {
        const cached = await readCache(key)
        if (cached && parseTrip(cached, { days: input.days }).ok) {
          const tripId = await saveTrip({ uid, input, plan: cached, model: 'cache', cached: true })
          return { tripId, cached: true, model: 'cache', remainingToday: null }
        }
      }

      const quota = await consumeQuota({ uid })
      if (!quota.ok) throw quotaError(quota)

      let result
      try {
        result = await generateWithFallback({ input, config, callModel, geminiSchema, now })
      } catch (err) {
        await refundQuota({ uid, day: quota.day }).catch(() => {}) // the user got nothing, so give it back
        throw err
      }

      await Promise.resolve(writeCache(key, result.plan, result.model)).catch(() => {}) // a cache miss is not fatal
      const tripId = await saveTrip({ uid, input, plan: result.plan, model: result.model, cached: false })
      return { tripId, cached: false, model: result.model, remainingToday: quota.remaining }
    },
  }
}
