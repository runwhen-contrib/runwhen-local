import { CvssScore } from "./cvss-score";
import { ScoreValidationError } from "./score-validation-error";


/**
 * Represents a service offering CVSS vulnerability scoring.
 *
 * @remarks
 * Implementors must provide CVSS scoring services at some version compatible with the v2/v3 standards.
 *
 * @public
 */
export interface CvssScoringEngine {

    /**
     * Audits the readiness of this instance to compute a CVSS score.
     *
     * @returns a list of validation errors discovered that must be addressed before score generation
     */
    validate (): ScoreValidationError[];

    /**
     * Validates that this instance is ready to compute a CVSS score.
     *
     * @returns true if this instance is ready to compute a CVSS score, otherwise false
     */
    isValid (): boolean;

    /**
     * Computes the CVSS score set under the current configuration.
     *
     * @returns the computed CVSS score set
     */
    computeScore (): CvssScore;
}

/**
 * Rounds the floating point value up to its nearest multiple of 0.1 (i.e. to one decimal place).
 *
 * Behavior specified in: https://www.first.org/cvss/v3.1/specification-document#Appendix-A---Floating-Point-Rounding
 *
 * @param value the value to round
 * @returns the rounded value
 */
export function roundUp (value: number): number {
    let rounded = Math.round(value * 100000);
    return rounded % 10000 === 0 ? rounded / 100000.0 : (Math.floor(rounded / 10000) + 1) / 10.0;
}
