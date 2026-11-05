import { createPlacesAutocompleteHandler } from '../server/handlers/placesAutocomplete.js'
import { realDeps } from '../server/runtime.js'

export default { fetch: createPlacesAutocompleteHandler(realDeps) }
