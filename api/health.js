import { createHealthHandler } from '../server/handlers/health.js'

export default { fetch: createHealthHandler() }
