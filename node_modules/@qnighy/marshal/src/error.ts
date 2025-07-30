/**
 * An exception raised when `loadMarshal` encountered an invalid format.
 */
export class MarshalError extends Error {
  constructor(message = "") {
    super(`Marshal error: ${message}`);
  }
}
