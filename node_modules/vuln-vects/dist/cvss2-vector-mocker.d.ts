import { CvssVectorMocker } from "./cvss-vector-mocker";
import { Cvss2ScoringEngine } from "./cvss2-scoring-engine";
/**
 * A mocking service for generating random CVSS v2 vectors.
 *
 * @public
 */
export declare class Cvss2VectorMocker extends CvssVectorMocker {
    /**
     * Gets a random CVSS v2 access vector.
     *
     * @returns a random CVSS v2 access vector
     */
    private static getRandomAccessVector;
    /**
     * Gets a random CVSS v2 access complexity.
     *
     * @returns a random CVSS v2 access complexity
     */
    private static getRandomAccessComplexity;
    /**
     * Gets a random CVSS v2 authentication.
     *
     * @returns a random CVSS v2 authentication
     */
    private static getRandomAuthentication;
    /**
     * Gets a random CVSS v2 collateral damage potential.
     *
     * @returns a random CVSS v2 collateral damage potential
     */
    private static getRandomCollateralDamagePotential;
    /**
     * Gets a random CVSS v2 exploitability.
     *
     * @returns a random CVSS v2 exploitability
     */
    private static getRandomExploitability;
    /**
     * Gets a random CVSS v2 impact subscore.
     *
     * @returns a random CVSS v2 impact subscore
     */
    private static getRandomImpactSubscore;
    /**
     * Gets a random CVSS v2 impact.
     *
     * @returns a random CVSS v2 impact
     */
    private static getRandomImpact;
    /**
     * Gets a random CVSS v2 remediation level.
     *
     * @returns a random CVSS v2 remediation level
     */
    private static getRandomRemediationLevel;
    /**
     * Gets a random CVSS v2 report confidence.
     *
     * @returns a random CVSS v2 report confidence
     */
    private static getRandomReportConfidence;
    /**
     * Gets a random CVSS v2 target distribution.
     *
     * @returns a random CVSS v2 target distribution
     */
    private static getRandomTargetDistribution;
    /**
     * Generates and returns a randomly-initialized CVSS v2 scoring engine.
     *
     * @returns a randomly-initialized CVSS v2 scoring engine
     */
    generate(): Cvss2ScoringEngine;
}
