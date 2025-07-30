import { CvssVectorMocker } from "./cvss-vector-mocker";
import { Cvss3ScoringEngine } from "./cvss3-scoring-engine";
/**
 * A mocking service for generating random CVSS v2 vectors.
 *
 * @public
 */
export declare class Cvss3VectorMocker extends CvssVectorMocker {
    /**
     * Gets a random CVSS v3.x attack vector.
     *
     * @returns a random CVSS v3.x attack vector
     */
    private static getRandomAttackVector;
    /**
     * Gets a random CVSS v3.x attack complexity.
     *
     * @returns a random CVSS v3.x attack complexity
     */
    private static getRandomAttackComplexity;
    /**
     * Gets a random CVSS v3.x privileges required.
     *
     * @returns a random CVSS v3.x privileges required
     */
    private static getRandomPrivilegesRequired;
    /**
     * Gets a random CVSS v3.x user interaction.
     *
     * @returns a random CVSS v3.x user interaction
     */
    private static getRandomUserInteraction;
    /**
     * Gets a random CVSS v3.x scope.
     *
     * @returns a random CVSS v3.x scope
     */
    private static getRandomScope;
    /**
     * Gets a random CVSS v3.x impact
     *
     * @returns a random CVSS v3.x impact
     */
    private static getRandomImpact;
    /**
     * Gets a random CVSS v3.x exploit code maturity.
     *
     * @returns a random CVSS v3.x exploit code maturity.
     */
    private static getRandomExploitCodeMaturity;
    /**
     * Gets a random CVSS v3.x remediation level.
     *
     * @returns a random CVSS v3.x remediation level
     */
    private static getRandomRemediationLevel;
    /**
     * Gets a random CVSS v3.x report confidence.
     *
     * @returns a random CVSS v3.x report confidence
     */
    private static getRandomReportConfidence;
    /**
     * Gets a random CVSS v3.x security requirement.
     *
     * @returns a random CVSS v3.x security requirement
     */
    private static getRandomSecurityRequirement;
    /**
     * Generates and returns a randomly-initialized CVSS v2 scoring engine.
     *
     * @returns a randomly-initialized CVSS v2 scoring engine
     */
    generate(): Cvss3ScoringEngine;
}
