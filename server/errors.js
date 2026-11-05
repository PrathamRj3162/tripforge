// The one error type used to tell the client something on purpose.
// Anything else that gets thrown is treated as a bug and answered with a generic 500.
export class HttpError extends Error {
  constructor(status, code, message, { headers, details, cause } = {}) {
    super(message, cause ? { cause } : undefined)
    this.name = 'HttpError'
    this.status = status
    this.code = code
    this.headers = headers ?? {}
    this.details = details
  }
}
