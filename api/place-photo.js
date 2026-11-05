import { createPlacePhotoHandler } from '../server/handlers/placePhoto.js'
import { realDeps } from '../server/runtime.js'

export default { fetch: createPlacePhotoHandler(realDeps) }
