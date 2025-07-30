"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellError = void 0;
/**
 * A recoverable shell error.
 */
class ShellError extends Error {
    constructor(message) {
        super(message);
        this.name = `ShellError`;
    }
}
exports.ShellError = ShellError;
