import { Cvss2ScoringEngine } from "./cvss2-scoring-engine";
/**
 * Represents a prefixing option for CVSS v2 vectors.
 *
 * @public
 */
export declare enum Cvss2VectorPrefixOption {
    /**
     * Represents no prefixing option (i.e. a bare vector).
     */
    NONE = 0,
    /**
     * Represents a bracketed prefixing option (i.e. a vector in parentheses).
     */
    BRACKETED = 1,
    /**
     * Represents a versioned prefixing option (i.e. a 'CVSS2#' prefix).
     */
    VERSION = 2
}
/**
 * Represents a service that supports rendering the state of CVSS v2 scoring engines as CVSS vector strings.
 *
 * @public
 * @see Cvss2ScoringEngine
 */
export declare class Cvss2VectorRenderer {
    private _prefixOption;
    /**
     * Initializes a new instance of a service that supports rendering the state of CVSS v2 scoring engines as CVSS
     * vector strings.
     *
     * @param prefixOption the prefixing option active for this renderer
     */
    constructor(prefixOption: Cvss2VectorPrefixOption);
    /**
     * Gets or sets the prefixing option active for this renderer.
     */
    get prefixOption(): Cvss2VectorPrefixOption;
    set prefixOption(prefixOption: Cvss2VectorPrefixOption);
    /**
     * Converts an access vector enum value into its string representation.
     *
     * @param accessVector the enum value to convert
     * @returns the converted string
     */
    private static renderAccessVector;
    /**
     * Converts an access complexity enum value into its string representation.
     *
     * @param accessComplexity the enum value to convert
     * @returns the converted string
     */
    private static renderAccessComplexity;
    /**
     * Converts an authentication enum value into its string representation.
     *
     * @param authentication the enum value to convert
     * @returns the converted string
     */
    private static renderAuthentication;
    /**
     * Converts an impact enum value into its string representation.
     *
     * @param impact the enum value to convert
     * @returns the converted string
     */
    private static renderImpact;
    /**
     * Converts an exploitability enum value into its string representation.
     *
     * @param exploitability the enum value to convert
     * @returns the converted string
     */
    private static renderExploitability;
    /**
     * Converts a remediation level enum value into its string representation.
     *
     * @param remediationLevel the enum value to convert
     * @returns the converted string
     */
    private static renderRemediationLevel;
    /**
     * Converts a report confidence enum value into its string representation.
     *
     * @param reportConfidence the enum value to convert
     * @returns the converted string
     */
    private static renderReportConfidence;
    /**
     * Converts a collateral damage potential enum value into its string representation.
     *
     * @param collateralDamagePotential the enum value to convert
     * @returns the converted string
     */
    private static renderCollateralDamagePotential;
    /**
     * Converts a target distribution enum value into its string representation.
     *
     * @param targetDistribution the enum value to convert
     * @returns the converted string
     */
    private static renderTargetDistribution;
    /**
     * Converts an impact subscore enum value into its string representation.
     *
     * @param impactSubscore the enum value to convert
     * @returns the converted string
     */
    private static renderImpactSubscore;
    /**
     * Renders the state of a CVSS v2 scoring engine as a CVSS vector.
     *
     * @param scoringEngine the scoring engine to render the state of
     * @returns the resulting CVSS vector
     */
    render(scoringEngine: Cvss2ScoringEngine): string;
}
