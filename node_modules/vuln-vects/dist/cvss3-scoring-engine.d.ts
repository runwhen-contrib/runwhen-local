import { CvssScoringEngine } from "./cvss-scoring";
import { CvssScore } from "./cvss-score";
import { ScoreValidationError } from "./score-validation-error";
import { AttackVector, AttackComplexity, PrivilegesRequired, UserInteraction, Scope, Impact, ExploitCodeMaturity, RemediationLevel, ReportConfidence, SecurityRequirement } from "./cvss3-enums";
/**
 * Implements a service offering CVSS v3 vulnerability scoring.
 *
 * @remarks
 * Consumers should ensure that they make sure of the validation features built in to this class in the form of the
 * {@link validate} and {@link isValid} functions. Attempting to call {@link computeScore} on an instance with an
 * invalid configuration will raise an exception.
 *
 * @public
 */
export declare class Cvss3ScoringEngine implements CvssScoringEngine {
    private _attackVector;
    private _attackComplexity;
    private _privilegesRequired;
    private _userInteraction;
    private _scope;
    private _confidentialityImpact;
    private _integrityImpact;
    private _availabilityImpact;
    private _exploitCodeMaturity;
    private _remediationLevel;
    private _reportConfidence;
    private _modifiedAttackVector;
    private _modifiedAttackComplexity;
    private _modifiedPrivilegesRequired;
    private _modifiedUserInteraction;
    private _modifiedScope;
    private _modifiedConfidentialityImpact;
    private _modifiedIntegrityImpact;
    private _modifiedAvailabilityImpact;
    private _confidentialityRequirement;
    private _integrityRequirement;
    private _availabilityRequirement;
    /**
     * Initializes a new instance of a service offering CVSS v3 vulnerability scoring.
     */
    constructor();
    /**
     * Gets or sets the attack vector.
     */
    get attackVector(): AttackVector;
    set attackVector(attackVector: AttackVector);
    /**
     * Gets or sets the attack complexity.
     */
    get attackComplexity(): AttackComplexity;
    set attackComplexity(attackComplexity: AttackComplexity);
    /**
     * Gets or sets the Privileges Required.
     */
    get privilegesRequired(): PrivilegesRequired;
    set privilegesRequired(privilegesRequired: PrivilegesRequired);
    /**
     * Gets or sets the user interaction.
     */
    get userInteraction(): UserInteraction;
    set userInteraction(userInteraction: UserInteraction);
    /**
     * Gets or sets scope
     */
    get scope(): Scope;
    set scope(scope: Scope);
    /**
     * Gets or sets the confidentiality impact.
     */
    get confidentialityImpact(): Impact;
    set confidentialityImpact(confidentialityImpact: Impact);
    /**
     * Gets or sets the integrity impact.
     */
    get integrityImpact(): Impact;
    set integrityImpact(integrityImpact: Impact);
    /**
     * Gets or sets the availability impact.
     */
    get availabilityImpact(): Impact;
    set availabilityImpact(availabilityImpact: Impact);
    /**
     * Gets or sets the exploit code maturity.
     */
    get exploitCodeMaturity(): ExploitCodeMaturity;
    set exploitCodeMaturity(exploitCodeMaturity: ExploitCodeMaturity);
    /**
     * Gets or sets the remediation level.
     */
    get remediationLevel(): RemediationLevel;
    set remediationLevel(remediationLevel: RemediationLevel);
    /**
     * Gets or sets the report confidence.
     */
    get reportConfidence(): ReportConfidence;
    set reportConfidence(reportConfidence: ReportConfidence);
    /**
 * Gets or sets the modified attack vector.
 */
    get modifiedAttackVector(): AttackVector;
    set modifiedAttackVector(modifiedAttackVector: AttackVector);
    /**
     * Gets or sets the modified attack complexity.
     */
    get modifiedAttackComplexity(): AttackComplexity;
    set modifiedAttackComplexity(modifiedAttackComplexity: AttackComplexity);
    /**
     * Gets or sets the Privileges Required.
     */
    get modifiedPrivilegesRequired(): PrivilegesRequired;
    set modifiedPrivilegesRequired(modifiedPrivilegesRequired: PrivilegesRequired);
    /**
     * Gets or sets the user interaction.
     */
    get modifiedUserInteraction(): UserInteraction;
    set modifiedUserInteraction(modifiedUserInteraction: UserInteraction);
    /**
     * Gets or sets scope
     */
    get modifiedScope(): Scope;
    set modifiedScope(modifiedScope: Scope);
    /**
     * Gets or sets modified confidentiality impact
     */
    get modifiedConfidentialityImpact(): Impact;
    set modifiedConfidentialityImpact(modifiedConfidentialityImpact: Impact);
    /**
     * Gets or sets modified integrity impact
     */
    get modifiedIntegrityImpact(): Impact;
    set modifiedIntegrityImpact(modifiedIntegrityImpact: Impact);
    /**
     * Gets or sets modified availability impact
     */
    get modifiedAvailabilityImpact(): Impact;
    set modifiedAvailabilityImpact(modifiedAvailabilityImpact: Impact);
    /**
     * Gets or sets the confidentiality requirement.
     */
    get confidentialityRequirement(): SecurityRequirement;
    set confidentialityRequirement(confidentialityRequirement: SecurityRequirement);
    /**
     * Gets or sets the integrity requirement.
     */
    get integrityRequirement(): SecurityRequirement;
    set integrityRequirement(integrityRequirement: SecurityRequirement);
    /**
     * Gets or sets the availability requirement.
     */
    get availabilityRequirement(): SecurityRequirement;
    set availabilityRequirement(availabilityRequirement: SecurityRequirement);
    /**
     * Gets the modified attack vector if defined, otherwise returns the base attack vector.
     *
     * @returns the modified attack vector if defined, otherwise the base attack vector
     */
    private getModifiedAttackVectorValue;
    /**
     * Gets the modified attack complexity if defined, otherwise returns the base attack complexity.
     *
     * @returns the modified attack complexity if defined, otherwise the base attack complexity
     */
    private getModifiedAttackComplexityValue;
    /**
     * Gets the modified privileges required if defined, otherwise returns the base privileges required.
     *
     * @returns the modified privileges required if defined, otherwise the base privileges required
     */
    private getModifiedPrivilegesRequiredValue;
    /**
     * Gets the modified user interaction if defined, otherwise returns the base user interaction.
     *
     * @returns the modified user interaction if defined, otherwise the base user interaction
     */
    private getModifiedUserInteractionValue;
    /**
     * Gets the modified scope if defined, otherwise returns the base scope.
     *
     * @returns the modified scope if defined, otherwise the base scope
     */
    private getModifiedScopeValue;
    /**
     * Gets the modified confidentiality impact if defined, otherwise returns the base confidentiality impact.
     *
     * @returns the modified confidentiality impact if defined, otherwise the base confidentiality impact
     */
    private getModifiedConfidentialityImpactValue;
    /**
     * Gets the modified integrity impact if defined, otherwise returns the base integrity impact.
     *
     * @returns the modified integrity impact if defined, otherwise the base integrity impact
     */
    private getModifiedIntegrityImpactValue;
    /**
     * Gets the modified availability impact if defined, otherwise returns the base availability impact.
     *
     * @returns the modified availability impact if defined, otherwise the base availability impact
     */
    private getModifiedAvailabilityImpactValue;
    /**
     * Audits the readiness of this instance to compute a CVSS score.
     *
     * @returns a list of validation errors discovered that must be addressed before score generation
     */
    validate(): ScoreValidationError[];
    /**
     * Validates that this instance is ready to compute a CVSS score.
     *
     * @returns true if this instance is ready to compute a CVSS score, otherwise false
     */
    isValid(): boolean;
    /**
     * Converts an {@link Impact} enum value to a number for use in calculations.
     *
     * @param impact the enum value to convert
     */
    private static renderImpact;
    /**
     * Computes the base impact subscore (called ISC_Base) in the specification.
     *
     * @returns the base impact subscore
     */
    private computeBaseImpactSubscore;
    /**
     * Computes the impact subscore (called ISC in the specification).
     *
     * @returns the impact subscore
     */
    private computeImpactSubscore;
    /**
     * Converts an {@link AttackVector} enum value to a number for use in calculations.
     *
     * @param attackVector the enum value to convert
     */
    private static renderAttackVector;
    /**
     * Converts an {@link AttackComplexity} enum value to a number for use in calculations.
     *
     * @param attackComplexity the enum value to convert
     */
    private static renderAttackComplexity;
    /**
     * Converts a {@link PrivilegesRequired} enum value to a number for use in calculations.
     *
     * @param privilegesRequired the enum value to convert
     */
    private static renderPrivilegesRequired;
    /**
     * Converts a {@link UserInteraction} enum value to a number for use in calculations.
     *
     * @param UserInteraction the enum value to convert
     */
    private static renderUserInteraction;
    /**
     * Computes the exploitability subscore.
     *
     * @returns the exploitability subscore
     */
    private computeExploitabilitySubscore;
    /**
     * Computes the base score.
     *
     * @returns the base score
     */
    private computeBaseScore;
    /**
     * Converts an {@link ExploitCodeMaturity} enum value to a number for use in calculations.
     *
     * @param exploitCodeMaturity the enum value to convert
     */
    private static renderExploitCodeMaturity;
    /**
     * Converts a {@link RemediationLevel} enum value to a number for use in calculations.
     *
     * @param remediationLevel the enum value to convert
     */
    private static renderRemediationLevel;
    /**
     * Converts a {@link ReportConfidence} enum value to a number for use in calculations.
     *
     * @param reportConfidence the enum value to convert
     */
    private static renderReportConfidence;
    /**
     * Computes the temporal score.
     *
     * @returns the temporal score
     */
    private computeTemporalScore;
    /**
     * Converts a {@link SecurityRequirement} enum value to a number for use in calculations.
     *
     * @param securityRequirement the enum value to convert
     */
    private static renderSecurityRequirement;
    /**
     * Computes the value defined in the specification as ISC_Modified.
     *
     * @returns the value defined in the specification as ISC_Modified.
     */
    private computeIscModified;
    /**
     * Computes the modified impact subscore.
     *
     * @returns the modified impact subscore.
     */
    private computeModifiedImpactSubscore;
    /**
     * Computes the modified exploitability subscore.
     *
     * @returns the modified exploitability subscore
     */
    private computeModifiedExploitabilitySubscore;
    /**
     * Computes the environmental score.
     *
     * @returns the Environmental score.
     */
    private computeEnvironmentalScore;
    /**
     * Gets whether or not a temporal score is defined.
     *
     * @returns true if a temporal score is defined, otherwise false
     */
    isTemporalScoreDefined(): boolean;
    /**
     * Gets whether or not an environmental score is defined.
     *
     * @returns true if an environmental score is defined, otherwise false
     */
    isEnvironmentalScoreDefined(): boolean;
    /**
     * Computes the overall score.
     *
     * @returns the overall score
     */
    private computeOverallScore;
    /**
     * Computes the CVSS score set under the current configuration.
     *
     * @returns the computed CVSS score set
     */
    computeScore(): CvssScore;
}
