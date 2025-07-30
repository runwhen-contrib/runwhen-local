/**
 * Represents a CVSS score validation error.
 *
 * @public
 */
export class ScoreValidationError {

    private _message: string;

    /**
     * Initialises a CVSS score validation error.
     *
     * @param message the message to associate with the error
     */
    public constructor (message: string) {
        this._message = message;
    }

    /**
     * Gets the message associated with the error.
     */
    get message (): string  {
        return this._message;
    }
}