import { CvssScore } from "./cvss-score";
import { Cvss2ScoringEngine } from "./cvss2-scoring-engine";
import { CvssVectorParser } from "./cvss-vector-parser";
/**
 * Implements a service offering CVSS v2 vector parsing.
 *
 * @remarks
 * Consumers should be aware that {@link parse} will raise an exception if an invalid CVSS v2 vector string is passed.
 * This includes strings containing incorrect keys/values and those that are missing required entries.
 *
 * @public
 */
export declare class Cvss2VectorParser implements CvssVectorParser {
    /**
     * Converts an access vector, represented as a string, into an enum value.
     *
     * @param accessVectorString the string to convert
     * @returns the converted enum value
     */
    private static parseAccessVector;
    /**
     * Converts an access complexity, represented as a string, into an enum value.
     *
     * @param accessComplexityString the string to convert
     * @returns the converted enum value
     */
    private static parseAccessComplexity;
    /**
     * Converts an authentication level, represented as a string, into an enum value.
     *
     * @param authenticationString the string to convert
     * @returns the converted enum value
     */
    private static parseAuthentication;
    /**
     * Converts an impact magnitude, represented as a string, into an enum value.
     *
     * @param impactString the string to convert
     * @returns the converted enum value
     */
    private static parseImpact;
    /**
     * Converts an impact magnitude, represented as a string, into an enum value.
     *
     * @param impactString the string to convert
     * @returns the converted enum value
     */
    private static parseExploitability;
    /**
     * Converts a remediation level, represented as a string, into an enum value.
     *
     * @param remediationLevelString the string to convert
     * @returns the converted enum value
     */
    private static parseRemediationLevel;
    /**
     * Converts a report confidence level, represented as a string, into an enum value.
     *
     * @param reportConfidenceString the string to convert
     * @returns the converted enum value
     */
    private static parseReportConfidence;
    /**
     * Converts a collateral damage potential, represented as a string, into an enum value.
     *
     * @param collateralDamagePotentialString the string to convert
     * @returns the converted enum value
     */
    private static parseCollateralDamagePotential;
    /**
     * Converts a target distribution, represented as a string, into an enum value.
     *
     * @param targetDistributionString the string to convert
     * @returns the converted enum value
     */
    private static parseTargetDistribution;
    /**
     * Converts an impact subscore value, represented as a string, into an enum value.
     *
     * @param impactSubscoreString the string to convert
     * @returns the converted enum value
     */
    private static parseImpactSubscore;
    /**
     * Generates and returns a version-specific (CVSS v2) scoring engine loaded with a vector.
     *
     * @param vector the vector to load in to the scoring engine
     * @returns the loaded scoring engine
     */
    generateScoringEngine(vector: string): Cvss2ScoringEngine;
    /**
     * @inheritdoc
     */
    parse(vector: string): CvssScore;
}
