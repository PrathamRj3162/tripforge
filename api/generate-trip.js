import { createGenerateTripHandler } from '../server/handlers/generateTrip.js'
import { realDeps } from '../server/runtime.js'

export default { fetch: createGenerateTripHandler(realDeps) }
