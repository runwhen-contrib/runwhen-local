/**
 * Represents a CVSS score validation error.
 *
 * @public
 */
export declare class ScoreValidationError {
    private _message;
    /**
     * Initialises a CVSS score validation error.
     *
     * @param message the message to associate with the error
     */
    constructor(message: string);
    /**
     * Gets the message associated with the error.
     */
    get message(): string;
}
