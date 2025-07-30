import { Cvss3ScoringEngine } from "./cvss3-scoring-engine";
/**
 * Represents a prefixing option for CVSS v3.x vectors.
 *
 * @public
 */
export declare enum Cvss3VectorPrefixOption {
    /**
     * Represents no prefixing option (i.e. a bare vector).
     */
    NONE = 0,
    /**
     * Represents a CVSS v3.0 prefixing option (i.e. a 'CVSS:3.0/' prefix).
     */
    VERSION_3_0 = 1,
    /**
     * Represents a CVSS v3.1 prefixing option (i.e. a 'CVSS:3.0/' prefix).
     */
    VERSION_3_1 = 2
}
/**
 * Represents a service that supports rendering the state of CVSS v3.x scoring engines as CVSS vector strings.
 *
 * @public
 * @see Cvss3ScoringEngine
 */
export declare class Cvss3VectorRenderer {
    private _prefixOption;
    /**
     * Initializes a new instance of a service that supports rendering the state of CVSS v3.x scoring engines as CVSS
     * vector strings.
     *
     * @param prefixOption the prefixing option active for this renderer
     */
    constructor(prefixOption: Cvss3VectorPrefixOption);
    /**
     * Gets or sets the prefixing option active for this renderer.
     */
    get prefixOption(): Cvss3VectorPrefixOption;
    set prefixOption(prefixOption: Cvss3VectorPrefixOption);
    /**
     * Converts an attack vector enum value into its string representation.
     *
     * @param attackVector the enum value to convert
     * @returns the converted string
     */
    private static renderAttackVector;
    /**
     * Converts an attack complexity enum value into its string representation.
     *
     * @param attackComplexity the enum value to convert
     * @returns the converted string
     */
    private static renderAttackComplexity;
    /**
     * Converts a privileges required enum value into its string representation.
     *
     * @param privilegesRequired the enum value to convert
     * @returns the converted string
     */
    private static renderPrivilegesRequired;
    /**
     * Converts a user interaction enum value into its string representation.
     *
     * @param userInteraction the enum value to convert
     * @returns the converted string
     */
    private static renderUserInteraction;
    /**
     * Converts a scope enum value into its string representation.
     *
     * @param scope the enum value to convert
     * @returns the converted string
     */
    private static renderScope;
    /**
     * Converts an impact enum value into its string representation.
     *
     * @param impact the enum value to convert
     * @returns the converted string
     */
    private static renderImpact;
    /**
     * Converts a exploit code maturity enum value into its string representation.
     *
     * @param exploitCodeMaturity the enum value to convert
     * @returns the converted string
     */
    private static renderExploitCodeMaturity;
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
     * Converts a security requirement enum value into its string representation.
     *
     * @param securityRequirement the enum value to convert
     * @returns the converted string
     */
    private static renderSecurityRequirement;
    /**
     * Renders the state of a CVSS v3.x scoring engine as a CVSS vector.
     *
     * @param scoringEngine the scoring engine to render the state of
     * @returns the resulting CVSS vector
     */
    render(scoringEngine: Cvss3ScoringEngine): string;
}
