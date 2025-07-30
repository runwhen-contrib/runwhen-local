import { CvssScore } from "./cvss-score";
import { Cvss3ScoringEngine } from "./cvss3-scoring-engine";
import { CvssVectorParser } from "./cvss-vector-parser";
/**
 * Implements a service offering CVSS v3 vector parsing.
 *
 * @remarks
 * Consumers should be aware that {@link parse} will raise an exception if an invalid CVSS v3 vector string is passed.
 * This includes strings containing incorrect keys/values and those that are missing required entries.
 *
 * @public
 */
export declare class Cvss3VectorParser implements CvssVectorParser {
    /**
     * Converts an attack vector, represented as a string, into an enum value.
     *
     * @param attackVectorString the string to convert
     * @returns the converted enum value
     */
    private static parseAttackVector;
    /**
     * Converts an attack complexity, represented as a string, into an enum value.
     *
     * @param attackComplexityString the string to convert
     * @returns the converted enum value
     */
    private static parseAttackComplexity;
    /**
     * Converts a privileges requirement, represented as a string, into an enum value.
     *
     * @param privilegesRequiredString the string to convert
     * @returns the converted enum value
     */
    private static parsePrivilegesRequired;
    /**
     * Converts a user interaction level, represented as a string, into an enum value.
     *
     * @param userInteractionString the string to convert
     * @returns the converted enum value
     */
    private static parseUserInteraction;
    /**
     * Converts a scope, represented as a string, into an enum value.
     *
     * @param scopeString the string to convert
     * @returns the converted enum value
     */
    private static parseScope;
    /**
     * Converts an impact magnitude, represented as a string, into an enum value.
     *
     * @param impactString the string to convert
     * @returns the converted enum value
     */
    private static parseImpact;
    /**
     * Converts an exploit code maturity level, represented as a string, into an enum value.
     *
     * @param exploitCodeMaturityString the string to convert
     * @returns the converted enum value
     */
    private static parseExploitCodeMaturity;
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
     * Converts a modified attack vector, represented as a string, into an enum value.
     *
     * @param modifiedAttackVectorString the string to convert
     * @returns the converted enum value
     */
    private static parseModifiedAttackVector;
    /**
     * Converts a modified attack complexity, represented as a string, into an enum value.
     *
     * @param modifiedAttackVectorString the string to convert
     * @returns the converted enum value
     */
    private static parseModifiedAttackComplexity;
    /**
     * Converts a modified privileges requirement, represented as a string, into an enum value.
     *
     * @param modifiedPrivilegesRequiredString the string to convert
     * @returns the converted enum value
     */
    private static parseModifiedPrivilegesRequired;
    /**
     * Converts a modified user interaction level, represented as a string, into an enum value.
     *
     * @param modifiedUserInteractionString the string to convert
     * @returns the converted enum value
     */
    private static parseModifiedUserInteraction;
    /**
     * Converts a modified scope, represented as a string, into an enum value.
     *
     * @param scopeString the string to convert
     * @returns the converted enum value
     */
    private static parseModifiedScope;
    /**
     * Converts a modified impact magnitude, represented as a string, into an enum value.
     *
     * @param impactString the string to convert
     * @returns the converted enum value
     */
    private static parseModifiedImpact;
    /**
     * Converts a security requirement, represented as a string, into an enum value.
     *
     * @param securityRequirementString the string to convert
     * @returns the converted enum value
     */
    private static parseSecurityRequirement;
    /**
     * Generates and returns a version-specific (CVSS v3.x) scoring engine loaded with a vector.
     *
     * @param vector the vector to load in to the scoring engine
     * @returns the loaded scoring engine
     */
    generateScoringEngine(vector: string): Cvss3ScoringEngine;
    /**
     * @inheritDoc
     */
    parse(vector: string): CvssScore;
}
