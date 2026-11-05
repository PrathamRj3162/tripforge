// The only file that talks to Gemini. The SDK is imported lazily, so endpoints that do not need it
// stay light and tests run without it.

const MESSAGE_HINTS = [
  [/RESOURCE_EXHAUSTED|quota/i, 429],
  [/UNAVAILABLE|overloaded|high demand/i, 503],
  [/DEADLINE_EXCEEDED/i, 504],
  [/NOT_FOUND|is not found/i, 404],
]

// Works out an HTTP-like status from whatever the SDK or fetch threw.
export function getErrorStatus(err) {
  if (!err) return undefined
  if (err.name === 'TimeoutError' || err.name === 'AbortError') return 504
  for (const candidate of [err.status, err.code, err.statusCode, err.response?.status]) {
    const n = Number(candidate)
    if (Number.isInteger(n) && n >= 100 && n <= 599) return n
  }
  const message = String(err.message ?? '')
  const inBody = /"code"\s*:\s*(\d{3})/.exec(message)
  if (inBody) return Number(inBody[1])
  for (const [pattern, status] of MESSAGE_HINTS) if (pattern.test(message)) return status
  return undefined
}

function textOf(response) {
  const text = response?.text
  if (!text) throw Object.assign(new Error('Gemini returned an empty reply'), { status: 502 })
  return text
}

export function createGeminiCaller({ apiKey, loadSdk = () => import('@google/genai') }) {
  let client
  return async function callGemini({ model, system, prompt, schema, thinkingLevel, timeoutMs, maxOutputTokens = 16384 }) {
    if (!client) {
      const { GoogleGenAI } = await loadSdk()
      client = new GoogleGenAI({ apiKey })
    }
    const config = {
      systemInstruction: system,
      responseMimeType: 'application/json',
      responseJsonSchema: schema,
      maxOutputTokens,
      abortSignal: AbortSignal.timeout(timeoutMs),
    }
    const useThinking = Boolean(thinkingLevel) && thinkingLevel !== 'off'
    if (useThinking) config.thinkingConfig = { thinkingLevel: String(thinkingLevel).toUpperCase() }
    try {
      return textOf(await client.models.generateContent({ model, contents: prompt, config }))
    } catch (err) {
      // A model that rejects the thinking setting gets one retry without it.
      if (useThinking && getErrorStatus(err) === 400 && /thinking/i.test(String(err.message))) {
        const { thinkingConfig, ...withoutThinking } = config
        return textOf(await client.models.generateContent({ model, contents: prompt, config: withoutThinking }))
      }
      throw err
    }
  }
}
