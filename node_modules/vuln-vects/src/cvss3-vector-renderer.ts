import {
    AttackComplexity,
    AttackVector,
    PrivilegesRequired,
    UserInteraction,
    Scope,
    Impact,
    ExploitCodeMaturity,
    RemediationLevel,
    ReportConfidence,
    SecurityRequirement
} from "./cvss3-enums";
import { Cvss3ScoringEngine } from "./cvss3-scoring-engine";


/**
 * Represents a prefixing option for CVSS v3.x vectors.
 *
 * @public
 */
export enum Cvss3VectorPrefixOption {

    /**
     * Represents no prefixing option (i.e. a bare vector).
     */
    NONE,

    /**
     * Represents a CVSS v3.0 prefixing option (i.e. a 'CVSS:3.0/' prefix).
     */
    VERSION_3_0,

    /**
     * Represents a CVSS v3.1 prefixing option (i.e. a 'CVSS:3.0/' prefix).
     */
    VERSION_3_1,
}

/**
 * Represents a service that supports rendering the state of CVSS v3.x scoring engines as CVSS vector strings.
 *
 * @public
 * @see Cvss3ScoringEngine
 */
export class Cvss3VectorRenderer {

    private _prefixOption: Cvss3VectorPrefixOption;

    /**
     * Initializes a new instance of a service that supports rendering the state of CVSS v3.x scoring engines as CVSS
     * vector strings.
     *
     * @param prefixOption the prefixing option active for this renderer
     */
    public constructor(prefixOption: Cvss3VectorPrefixOption) {
        this._prefixOption = prefixOption;
    }

    /**
     * Gets or sets the prefixing option active for this renderer.
     */
    get prefixOption(): Cvss3VectorPrefixOption {
        return this._prefixOption;
    }
    set prefixOption(prefixOption: Cvss3VectorPrefixOption) {
        this._prefixOption = prefixOption;
    }

    /**
     * Converts an attack vector enum value into its string representation.
     *
     * @param attackVector the enum value to convert
     * @returns the converted string
     */
    private static renderAttackVector(attackVector: AttackVector): string {
        switch (attackVector) {
            case AttackVector.LOCAL:
                return 'L';
            case AttackVector.ADJACENT_NETWORK:
                return 'A';
            case AttackVector.NETWORK:
                return 'N';
            case AttackVector.PHYSICAL:
                return 'P';
        }

        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected attack vector value during vector rendering.');
    }

    /**
     * Converts an attack complexity enum value into its string representation.
     *
     * @param attackComplexity the enum value to convert
     * @returns the converted string
     */
    private static renderAttackComplexity(attackComplexity: AttackComplexity): string {
        switch (attackComplexity) {
            case AttackComplexity.HIGH:
                return 'H';
            case AttackComplexity.LOW:
                return 'L';
        }

        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected access complexity value during vector rendering.');
    }

    /**
     * Converts a privileges required enum value into its string representation.
     *
     * @param privilegesRequired the enum value to convert
     * @returns the converted string
     */
    private static renderPrivilegesRequired(privilegesRequired: PrivilegesRequired): string {
        switch (privilegesRequired) {
            case PrivilegesRequired.NOT_DEFINED:
                return 'X';
            case PrivilegesRequired.HIGH:
                return 'H';
            case PrivilegesRequired.LOW:
                return 'L';
            case PrivilegesRequired.NONE:
                return 'N';
        }

        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected privileges required value during vector rendering.');
    }

    /**
     * Converts a user interaction enum value into its string representation.
     *
     * @param userInteraction the enum value to convert
     * @returns the converted string
     */
    private static renderUserInteraction(userInteraction: UserInteraction): string {
        switch (userInteraction) {
            case UserInteraction.REQUIRED:
                return 'R';
            case UserInteraction.NONE:
                return 'N';
        }

        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected user interaction value during vector rendering.');
    }

    /**
     * Converts a scope enum value into its string representation.
     *
     * @param scope the enum value to convert
     * @returns the converted string
     */
    private static renderScope(scope: Scope): string {
        switch (scope) {
            case Scope.CHANGED:
                return "C";
            case Scope.UNCHANGED:
                return "U";
        }

        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected user interaction value during vector rendering.');
    }

    /**
     * Converts an impact enum value into its string representation.
     *
     * @param impact the enum value to convert
     * @returns the converted string
     */
    private static renderImpact(impact: Impact): string {
        switch (impact) {
            case Impact.NONE:
                return "N";
            case Impact.LOW:
                return "L";
            case Impact.HIGH:
                return "H";
        }

        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected user interaction value during vector rendering.');
    }

    /**
     * Converts a exploit code maturity enum value into its string representation.
     *
     * @param exploitCodeMaturity the enum value to convert
     * @returns the converted string
     */
    private static renderExploitCodeMaturity(exploitCodeMaturity: ExploitCodeMaturity): string {
        switch (exploitCodeMaturity) {
            case ExploitCodeMaturity.NOT_DEFINED:
                return "X";
            case ExploitCodeMaturity.UNPROVEN_THAT_EXPLOIT_EXISTS:
                return "U";
            case ExploitCodeMaturity.PROOF_OF_CONCEPT_CODE:
                return "P";
            case ExploitCodeMaturity.FUNCTIONAL_EXPLOIT_EXISTS:
                return "F";
            case ExploitCodeMaturity.HIGH:
                return "H";
        }
    }

    /**
     * Converts a remediation level enum value into its string representation.
     *
     * @param remediationLevel the enum value to convert
     * @returns the converted string
     */
    private static renderRemediationLevel(remediationLevel: RemediationLevel): string {
        switch (remediationLevel) {
            case RemediationLevel.NOT_DEFINED:
                return "X";
            case RemediationLevel.OFFICIAL_FIX:
                return "O";
            case RemediationLevel.TEMPORARY_FIX:
                return "T";
            case RemediationLevel.WORKAROUND:
                return "W";
            case RemediationLevel.UNAVAILABLE:
                return "U";
        }
    }

    /**
     * Converts a report confidence enum value into its string representation.
     *
     * @param reportConfidence the enum value to convert
     * @returns the converted string
     */
    private static renderReportConfidence(reportConfidence: ReportConfidence): string {
        switch (reportConfidence) {
            case ReportConfidence.NOT_DEFINED:
                return "X";
            case ReportConfidence.UNKNOWN:
                return "U";
            case ReportConfidence.REASONABLE:
                return "R";
            case ReportConfidence.CONFIRMED:
                return "C";
        }
    }

    /**
     * Converts a security requirement enum value into its string representation.
     *
     * @param securityRequirement the enum value to convert
     * @returns the converted string
     */
    private static renderSecurityRequirement(securityRequirement: SecurityRequirement): string {
        switch (securityRequirement) {
            case SecurityRequirement.NOT_DEFINED:
                return "X";
            case SecurityRequirement.LOW:
                return "L";
            case SecurityRequirement.MEDIUM:
                return "M";
            case SecurityRequirement.HIGH:
                return "H";
        }
    }

    /**
     * Renders the state of a CVSS v3.x scoring engine as a CVSS vector.
     *
     * @param scoringEngine the scoring engine to render the state of
     * @returns the resulting CVSS vector
     */
    public render(scoringEngine: Cvss3ScoringEngine) {

        // Do not allow rendering of invalid vectors.
        if (!scoringEngine.isValid()) {
            throw new RangeError("Cannot render a vector for a CVSS v2 scoring engine that does not validate.");
        }

        // Base metrics must be included
        let vector = [];
        vector.push('AV:' + Cvss3VectorRenderer.renderAttackVector(scoringEngine.attackVector));
        vector.push('AC:' + Cvss3VectorRenderer.renderAttackComplexity(scoringEngine.attackComplexity));
        vector.push('PR:' + Cvss3VectorRenderer.renderPrivilegesRequired(scoringEngine.privilegesRequired));
        vector.push('UI:' + Cvss3VectorRenderer.renderUserInteraction(scoringEngine.userInteraction));
        vector.push('S:' + Cvss3VectorRenderer.renderScope(scoringEngine.scope));
        vector.push('C:' + Cvss3VectorRenderer.renderImpact(scoringEngine.confidentialityImpact));
        vector.push('I:' + Cvss3VectorRenderer.renderImpact(scoringEngine.integrityImpact));
        vector.push('A:' + Cvss3VectorRenderer.renderImpact(scoringEngine.availabilityImpact));

        // If present, include temporal metrics.
        if (scoringEngine.isTemporalScoreDefined()) {
            vector.push('E:' + Cvss3VectorRenderer.renderExploitCodeMaturity(scoringEngine.exploitCodeMaturity));
            vector.push('RL:' + Cvss3VectorRenderer.renderRemediationLevel(scoringEngine.remediationLevel));
            vector.push('RC:' + Cvss3VectorRenderer.renderReportConfidence(scoringEngine.reportConfidence));
        }

        // If present, include environmental metrics.
        if (scoringEngine.isEnvironmentalScoreDefined()) {
            vector.push('MAV:' + Cvss3VectorRenderer.renderAttackVector(scoringEngine.modifiedAttackVector));
            vector.push('MAC:' + Cvss3VectorRenderer.renderAttackComplexity(scoringEngine.modifiedAttackComplexity));
            vector.push('MPR:'
                + Cvss3VectorRenderer.renderPrivilegesRequired(scoringEngine.modifiedPrivilegesRequired));
            vector.push('MUI:' + Cvss3VectorRenderer.renderUserInteraction(scoringEngine.modifiedUserInteraction));
            vector.push('MS:' + Cvss3VectorRenderer.renderScope(scoringEngine.modifiedScope));
            vector.push('MC:' + Cvss3VectorRenderer.renderImpact(scoringEngine.modifiedConfidentialityImpact));
            vector.push('MI:' + Cvss3VectorRenderer.renderImpact(scoringEngine.modifiedIntegrityImpact));
            vector.push('MA:' + Cvss3VectorRenderer.renderImpact(scoringEngine.modifiedAvailabilityImpact));
            vector.push('CR:'
                + Cvss3VectorRenderer.renderSecurityRequirement(scoringEngine.confidentialityRequirement));
            vector.push('IR:' + Cvss3VectorRenderer.renderSecurityRequirement(scoringEngine.integrityRequirement));
            vector.push('AR:' + Cvss3VectorRenderer.renderSecurityRequirement(scoringEngine.availabilityRequirement))
        }

        // Join vector together with forward slashes.
        const vectorString = vector.join('/');

        // Apply prefix options.
        switch (this._prefixOption) {
            case Cvss3VectorPrefixOption.VERSION_3_0:
                return 'CVSS:3.0/' + vectorString;
            case Cvss3VectorPrefixOption.VERSION_3_1:
                return 'CVSS:3.1/' + vectorString;
        }

        // Prefix option is none.
        return vectorString;
    }
}
