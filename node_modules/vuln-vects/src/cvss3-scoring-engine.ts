import { CvssScoringEngine, roundUp } from "./cvss-scoring";
import { CvssScore } from "./cvss-score";
import { ScoreValidationError } from "./score-validation-error";
import {
    AttackVector,
    AttackComplexity,
    PrivilegesRequired,
    UserInteraction,
    Scope,
    Impact,
    ExploitCodeMaturity,
    RemediationLevel,
    ReportConfidence,
    SecurityRequirement
} from "./cvss3-enums";


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
export class Cvss3ScoringEngine implements CvssScoringEngine {

    private _attackVector: AttackVector;

    private _attackComplexity: AttackComplexity;

    private _privilegesRequired: PrivilegesRequired;

    private _userInteraction: UserInteraction;

    private _scope: Scope;

    private _confidentialityImpact: Impact;

    private _integrityImpact: Impact;

    private _availabilityImpact: Impact;

    private _exploitCodeMaturity: ExploitCodeMaturity;

    private _remediationLevel: RemediationLevel;

    private _reportConfidence: ReportConfidence;

    private _modifiedAttackVector: AttackVector;

    private _modifiedAttackComplexity: AttackComplexity;

    private _modifiedPrivilegesRequired: PrivilegesRequired;

    private _modifiedUserInteraction: UserInteraction;

    private _modifiedScope: Scope;

    private _modifiedConfidentialityImpact: Impact;

    private _modifiedIntegrityImpact: Impact;

    private _modifiedAvailabilityImpact: Impact;

    private _confidentialityRequirement: SecurityRequirement;

    private _integrityRequirement: SecurityRequirement;

    private _availabilityRequirement: SecurityRequirement;

    /**
     * Initializes a new instance of a service offering CVSS v3 vulnerability scoring.
     */
    public constructor () {

        // Base score metrics do not permit undefined values. This is caught in validation.
        this._attackVector = AttackVector.NOT_DEFINED;
        this._attackComplexity = AttackComplexity.NOT_DEFINED;
        this._privilegesRequired = PrivilegesRequired.NOT_DEFINED;
        this._userInteraction = UserInteraction.NOT_DEFINED;
        this._scope = Scope.NOT_DEFINED;
        this._confidentialityImpact = Impact.NOT_DEFINED;
        this._integrityImpact = Impact.NOT_DEFINED;
        this._availabilityImpact = Impact.NOT_DEFINED;

        // Temporal score metrics permit undefined values.
        this._exploitCodeMaturity = ExploitCodeMaturity.NOT_DEFINED;
        this._remediationLevel = RemediationLevel.NOT_DEFINED;
        this._reportConfidence = ReportConfidence.NOT_DEFINED;

        // Environmental score metrics also permit undefined values.
        this._modifiedAttackVector = AttackVector.NOT_DEFINED; // Exploitability modifiers.
        this._modifiedAttackComplexity = AttackComplexity.NOT_DEFINED;
        this._modifiedPrivilegesRequired = PrivilegesRequired.NOT_DEFINED;
        this._modifiedUserInteraction = UserInteraction.NOT_DEFINED;
        this._modifiedScope = Scope.NOT_DEFINED;
        this._modifiedConfidentialityImpact = Impact.NOT_DEFINED; // Impact modifiers
        this._modifiedIntegrityImpact = Impact.NOT_DEFINED;
        this._modifiedAvailabilityImpact = Impact.NOT_DEFINED;
        this._confidentialityRequirement = SecurityRequirement.NOT_DEFINED; // Security requirements.
        this._integrityRequirement = SecurityRequirement.NOT_DEFINED;
        this._availabilityRequirement = SecurityRequirement.NOT_DEFINED;
    }

    /**
     * Gets or sets the attack vector.
     */
    get attackVector (): AttackVector {
        return this._attackVector;
    }
    set attackVector (attackVector: AttackVector) {
        this._attackVector = attackVector;
    }

    /**
     * Gets or sets the attack complexity.
     */
    get attackComplexity (): AttackComplexity {
        return this._attackComplexity;
    }
    set attackComplexity (attackComplexity: AttackComplexity) {
        this._attackComplexity = attackComplexity;
    }

    /**
     * Gets or sets the Privileges Required.
     */
    get privilegesRequired (): PrivilegesRequired {
        return this._privilegesRequired;
    }
    set privilegesRequired (privilegesRequired: PrivilegesRequired) {
        this._privilegesRequired = privilegesRequired;
    }

    /**
     * Gets or sets the user interaction.
     */
    get userInteraction (): UserInteraction {
        return this._userInteraction;
    }
    set userInteraction (userInteraction: UserInteraction) {
        this._userInteraction = userInteraction;
    }

    /**
     * Gets or sets scope
     */
    get scope (): Scope {
        return this._scope;
    }
    set scope (scope: Scope) {
        this._scope = scope;
    }

    /**
     * Gets or sets the confidentiality impact.
     */
    get confidentialityImpact (): Impact {
        return this._confidentialityImpact;
    }
    set confidentialityImpact (confidentialityImpact: Impact) {
        this._confidentialityImpact = confidentialityImpact;
    }

    /**
     * Gets or sets the integrity impact.
     */
    get integrityImpact (): Impact {
        return this._integrityImpact;
    }
    set integrityImpact (integrityImpact: Impact) {
        this._integrityImpact = integrityImpact;
    }

    /**
     * Gets or sets the availability impact.
     */
    get availabilityImpact (): Impact {
        return this._availabilityImpact;
    }
    set availabilityImpact (availabilityImpact: Impact) {
        this._availabilityImpact = availabilityImpact;
    }

    /**
     * Gets or sets the exploit code maturity.
     */
    get exploitCodeMaturity (): ExploitCodeMaturity {
        return this._exploitCodeMaturity;
    }
    set exploitCodeMaturity (exploitCodeMaturity: ExploitCodeMaturity) {
        this._exploitCodeMaturity = exploitCodeMaturity;
    }

    /**
     * Gets or sets the remediation level.
     */
    get remediationLevel (): RemediationLevel {
        return this._remediationLevel;
    }
    set remediationLevel (remediationLevel: RemediationLevel) {
        this._remediationLevel = remediationLevel;
    }

    /**
     * Gets or sets the report confidence.
     */
    get reportConfidence (): ReportConfidence {
        return this._reportConfidence;
    }
    set reportConfidence (reportConfidence: ReportConfidence) {
        this._reportConfidence = reportConfidence;
    }

        /**
     * Gets or sets the modified attack vector.
     */
    get modifiedAttackVector (): AttackVector {
        return this._modifiedAttackVector;
    }
    set modifiedAttackVector (modifiedAttackVector: AttackVector) {
        this._modifiedAttackVector = modifiedAttackVector;
    }

    /**
     * Gets or sets the modified attack complexity.
     */
    get modifiedAttackComplexity (): AttackComplexity {
        return this._modifiedAttackComplexity;
    }
    set modifiedAttackComplexity (modifiedAttackComplexity: AttackComplexity) {
        this._modifiedAttackComplexity = modifiedAttackComplexity;
    }

    /**
     * Gets or sets the Privileges Required.
     */
    get modifiedPrivilegesRequired (): PrivilegesRequired {
        return this._modifiedPrivilegesRequired;
    }
    set modifiedPrivilegesRequired (modifiedPrivilegesRequired: PrivilegesRequired) {
        this._modifiedPrivilegesRequired = modifiedPrivilegesRequired;
    }

    /**
     * Gets or sets the user interaction.
     */
    get modifiedUserInteraction (): UserInteraction {
        return this._modifiedUserInteraction;
    }
    set modifiedUserInteraction (modifiedUserInteraction: UserInteraction) {
        this._modifiedUserInteraction = modifiedUserInteraction;
    }

    /**
     * Gets or sets scope
     */
    get modifiedScope (): Scope {
        return this._modifiedScope;
    }
    set modifiedScope (modifiedScope: Scope) {
        this._modifiedScope = modifiedScope;
    }

    /**
     * Gets or sets modified confidentiality impact
     */
    get modifiedConfidentialityImpact (): Impact {
        return this._modifiedConfidentialityImpact;
    }
    set modifiedConfidentialityImpact (modifiedConfidentialityImpact: Impact) {
        this._modifiedConfidentialityImpact = modifiedConfidentialityImpact;
    }

    /**
     * Gets or sets modified integrity impact
     */
    get modifiedIntegrityImpact (): Impact {
        return this._modifiedIntegrityImpact;
    }
    set modifiedIntegrityImpact (modifiedIntegrityImpact: Impact) {
        this._modifiedIntegrityImpact = modifiedIntegrityImpact;
    }

    /**
     * Gets or sets modified availability impact
     */
    get modifiedAvailabilityImpact (): Impact {
        return this._modifiedAvailabilityImpact;
    }
    set modifiedAvailabilityImpact (modifiedAvailabilityImpact: Impact) {
        this._modifiedAvailabilityImpact = modifiedAvailabilityImpact;
    }

    /**
     * Gets or sets the confidentiality requirement.
     */
    get confidentialityRequirement (): SecurityRequirement {
        return this._confidentialityRequirement;
    }
    set confidentialityRequirement (confidentialityRequirement: SecurityRequirement) {
        this._confidentialityRequirement = confidentialityRequirement;
    }

    /**
     * Gets or sets the integrity requirement.
     */
    get integrityRequirement (): SecurityRequirement {
        return this._integrityRequirement;
    }
    set integrityRequirement (integrityRequirement: SecurityRequirement) {
        this._integrityRequirement = integrityRequirement;
    }

    /**
     * Gets or sets the availability requirement.
     */
    get availabilityRequirement (): SecurityRequirement {
        return this._availabilityRequirement;
    }
    set availabilityRequirement (availabilityRequirement: SecurityRequirement) {
        this._availabilityRequirement = availabilityRequirement;
    }

    /**
     * Gets the modified attack vector if defined, otherwise returns the base attack vector.
     *
     * @returns the modified attack vector if defined, otherwise the base attack vector
     */
    private getModifiedAttackVectorValue(): AttackVector {
        return this._modifiedAttackVector === AttackVector.NOT_DEFINED ?
            this._attackVector : this._modifiedAttackVector;
    }

    /**
     * Gets the modified attack complexity if defined, otherwise returns the base attack complexity.
     *
     * @returns the modified attack complexity if defined, otherwise the base attack complexity
     */
    private getModifiedAttackComplexityValue(): AttackComplexity {
        return this._modifiedAttackComplexity === AttackComplexity.NOT_DEFINED ?
            this._attackComplexity : this._modifiedAttackComplexity;
    }

    /**
     * Gets the modified privileges required if defined, otherwise returns the base privileges required.
     *
     * @returns the modified privileges required if defined, otherwise the base privileges required
     */
    private getModifiedPrivilegesRequiredValue(): PrivilegesRequired {
        return this._modifiedPrivilegesRequired === PrivilegesRequired.NOT_DEFINED ?
            this._privilegesRequired : this._modifiedPrivilegesRequired;
    }

    /**
     * Gets the modified user interaction if defined, otherwise returns the base user interaction.
     *
     * @returns the modified user interaction if defined, otherwise the base user interaction
     */
    private getModifiedUserInteractionValue(): UserInteraction {
        return this._modifiedUserInteraction === UserInteraction.NOT_DEFINED ?
            this._userInteraction : this._modifiedUserInteraction;
    }

    /**
     * Gets the modified scope if defined, otherwise returns the base scope.
     *
     * @returns the modified scope if defined, otherwise the base scope
     */
    private getModifiedScopeValue(): Scope {
        return this._modifiedScope === Scope.NOT_DEFINED ?
            this._modifiedScope : this._scope;
    }

    /**
     * Gets the modified confidentiality impact if defined, otherwise returns the base confidentiality impact.
     *
     * @returns the modified confidentiality impact if defined, otherwise the base confidentiality impact
     */
    private getModifiedConfidentialityImpactValue(): Impact {
        return this._modifiedConfidentialityImpact === Impact.NOT_DEFINED ?
            this._confidentialityImpact : this._modifiedConfidentialityImpact;
    }

    /**
     * Gets the modified integrity impact if defined, otherwise returns the base integrity impact.
     *
     * @returns the modified integrity impact if defined, otherwise the base integrity impact
     */
    private getModifiedIntegrityImpactValue(): Impact {
        return this._modifiedIntegrityImpact === Impact.NOT_DEFINED ?
            this._integrityImpact : this._modifiedIntegrityImpact;
    }

    /**
     * Gets the modified availability impact if defined, otherwise returns the base availability impact.
     *
     * @returns the modified availability impact if defined, otherwise the base availability impact
     */
    private getModifiedAvailabilityImpactValue(): Impact {
        return this._modifiedAvailabilityImpact === Impact.NOT_DEFINED ?
            this._availabilityImpact : this._modifiedAvailabilityImpact;
    }

    /**
     * Audits the readiness of this instance to compute a CVSS score.
     *
     * @returns a list of validation errors discovered that must be addressed before score generation
     */
    public validate (): ScoreValidationError[] {

        // Build a collection of errors.
        let scoreValidationErrors: ScoreValidationError[] = [];

        // Exploitability metrics are not allowed to be undefined.
        if (this._attackVector === AttackVector.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "Attack vector cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        if (this._attackComplexity === AttackComplexity.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "Attack complexity cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        if (this._privilegesRequired === PrivilegesRequired.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "Privileges Required cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        if (this._userInteraction === UserInteraction.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "User Interaction cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        if (this._scope === Scope.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "Scope cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }

        // Impact3 metrics are not allowed to be undefined.
        if (this._confidentialityImpact === Impact.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "Confidentiality impact cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        if (this._integrityImpact === Impact.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "Integrity impact cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        if (this._availabilityImpact === Impact.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "Availability impact cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }

        // Return errors.
        return scoreValidationErrors;
    }

    /**
     * Validates that this instance is ready to compute a CVSS score.
     *
     * @returns true if this instance is ready to compute a CVSS score, otherwise false
     */
    public isValid (): boolean {
        return this.validate().length == 0;
    }

    /**
     * Converts an {@link Impact} enum value to a number for use in calculations.
     *
     * @param impact the enum value to convert
     */
    private static renderImpact (impact: Impact): number {
        switch (impact) {
            case Impact.NONE:
                return 0;
            case Impact.LOW:
                return 0.22;
            case Impact.HIGH:
                return 0.56;
        }
        return 0; // Never returned.
    }

    /**
     * Computes the base impact subscore (called ISC_Base) in the specification.
     *
     * @returns the base impact subscore
     */
    private computeBaseImpactSubscore(): number {

        // Render impacts to numeric scores.
        let confidentialityImpact = Cvss3ScoringEngine.renderImpact(this._confidentialityImpact);
        let integrityImpact = Cvss3ScoringEngine.renderImpact(this._integrityImpact);
        let availabilityImpact = Cvss3ScoringEngine.renderImpact(this._availabilityImpact);

        // Compute and return the base impact subscore (called ISC_Base) in the specification.
        return 1 - ((1 - confidentialityImpact) * (1 - integrityImpact) * (1 - availabilityImpact));
    }

    /**
     * Computes the impact subscore (called ISC in the specification).
     *
     * @returns the impact subscore
     */
    private computeImpactSubscore(): number {

        // Gets the impact subscore.
        let baseImpactSubscore = this.computeBaseImpactSubscore();

        // Compute and return the impact subscore (called ISC in the specification).
        if (this._scope === Scope.UNCHANGED) {
            return 6.42 * baseImpactSubscore;
        }
        return 7.52 * (baseImpactSubscore - 0.029) - 3.25 * Math.pow(baseImpactSubscore - 0.02, 15);
    }

    /**
     * Converts an {@link AttackVector} enum value to a number for use in calculations.
     *
     * @param attackVector the enum value to convert
     */
    private static renderAttackVector (attackVector: AttackVector): number {
        switch (attackVector) {
            case AttackVector.NETWORK:
                return 0.85;
            case AttackVector.ADJACENT_NETWORK:
                return 0.62;
            case AttackVector.LOCAL:
                return 0.55;
            case AttackVector.PHYSICAL:
                return 0.2;
        }
        return 0; // Never returned.
    }

    /**
     * Converts an {@link AttackComplexity} enum value to a number for use in calculations.
     *
     * @param attackComplexity the enum value to convert
     */
    private static renderAttackComplexity (attackComplexity: AttackComplexity): number {
        switch (attackComplexity) {
            case AttackComplexity.LOW:
                return 0.77;
            case AttackComplexity.HIGH:
                return 0.44;
        }
        return 0; // Never returned.
    }

    /**
     * Converts a {@link PrivilegesRequired} enum value to a number for use in calculations.
     *
     * @param privilegesRequired the enum value to convert
     */
    private static renderPrivilegesRequired (privilegesRequired: PrivilegesRequired, scope: Scope): number {
        switch (privilegesRequired) {
            case PrivilegesRequired.NONE:
                return 0.85;
            case PrivilegesRequired.LOW:
                return scope === Scope.UNCHANGED ? 0.62 : 0.68;
            case PrivilegesRequired.HIGH:
                return scope === Scope.UNCHANGED ? 0.27 : 0.5;
        }
        return 0; // Never returned.
    }

     /**
      * Converts a {@link UserInteraction} enum value to a number for use in calculations.
      *
      * @param UserInteraction the enum value to convert
      */
    private static renderUserInteraction (userInteraction: UserInteraction): number {
        switch (userInteraction) {
            case UserInteraction.NONE:
                return 0.85;
            case UserInteraction.REQUIRED:
                return 0.62;
        }
        return 0; // Never Returned.
    }

    /**
     * Computes the exploitability subscore.
     *
     * @returns the exploitability subscore
     */
    private computeExploitabilitySubscore (): number {

        // Render exploitabilities to numeric scores.
        let attackVector = Cvss3ScoringEngine.renderAttackVector(this._attackVector);
        let attackComplexity = Cvss3ScoringEngine.renderAttackComplexity(this._attackComplexity);
        let privilegesRequired = Cvss3ScoringEngine.renderPrivilegesRequired(this._privilegesRequired, this._scope);
        let userInteraction = Cvss3ScoringEngine.renderUserInteraction(this._userInteraction);

        // Compute and return overall exploitability score.
        let exploitability = 8.22 * attackVector * attackComplexity * privilegesRequired * userInteraction;
        return exploitability;
    }

    /**
     * Computes the base score.
     *
     * @returns the base score
     */
    private computeBaseScore (): number {

        // Compute relevant subscores.
        let impactSubscore = this.computeImpactSubscore();
        let exploitability = this.computeExploitabilitySubscore();

        // Compute and return base score.
        if (impactSubscore <= 0) {
            return 0;
        }
        let modifier = this._scope === Scope.UNCHANGED ? 1 : 1.08;
        return roundUp(Math.min(modifier * (impactSubscore + exploitability), 10));
    }

    /**
     * Converts an {@link ExploitCodeMaturity} enum value to a number for use in calculations.
     *
     * @param exploitCodeMaturity the enum value to convert
     */
    private static renderExploitCodeMaturity (exploitCodeMaturity: ExploitCodeMaturity): number {
        switch (exploitCodeMaturity) {
            case ExploitCodeMaturity.UNPROVEN_THAT_EXPLOIT_EXISTS:
                return 0.91;
            case ExploitCodeMaturity.PROOF_OF_CONCEPT_CODE:
                return 0.94;
            case ExploitCodeMaturity.FUNCTIONAL_EXPLOIT_EXISTS:
                return 0.97;
            case ExploitCodeMaturity.HIGH:
            case ExploitCodeMaturity.NOT_DEFINED:
                return 1;
        }
    }

    /**
     * Converts a {@link RemediationLevel} enum value to a number for use in calculations.
     *
     * @param remediationLevel the enum value to convert
     */
    private static renderRemediationLevel (remediationLevel: RemediationLevel): number {
        switch (remediationLevel) {
            case RemediationLevel.OFFICIAL_FIX:
                return 0.95;
            case RemediationLevel.TEMPORARY_FIX:
                return 0.96;
            case RemediationLevel.WORKAROUND:
                return 0.97;
            case RemediationLevel.UNAVAILABLE:
            case RemediationLevel.NOT_DEFINED:
                return 1;
        }
    }

    /**
     * Converts a {@link ReportConfidence} enum value to a number for use in calculations.
     *
     * @param reportConfidence the enum value to convert
     */
    private static renderReportConfidence (reportConfidence: ReportConfidence): number {
        switch (reportConfidence) {
            case ReportConfidence.REASONABLE:
                return 0.96;
            case ReportConfidence.UNKNOWN:
                return 0.92;
            case ReportConfidence.CONFIRMED:
            case ReportConfidence.NOT_DEFINED:
                return 1;
        }
    }

    /**
     * Computes the temporal score.
     *
     * @returns the temporal score
     */
    private computeTemporalScore (): number {

        // Compute base score.
        let baseScore = this.computeBaseScore();

        // Compute relevant subscores.
        let exploitCodeMaturity = Cvss3ScoringEngine.renderExploitCodeMaturity(this._exploitCodeMaturity);
        let remediationLevel = Cvss3ScoringEngine.renderRemediationLevel(this._remediationLevel);
        let reportConfidence = Cvss3ScoringEngine.renderReportConfidence(this._reportConfidence);

        // Compute and return temporal score.
        let temporalScore = roundUp(baseScore * exploitCodeMaturity * remediationLevel * reportConfidence);
        return temporalScore;
    }

    /**
     * Converts a {@link SecurityRequirement} enum value to a number for use in calculations.
     *
     * @param securityRequirement the enum value to convert
     */
    private static renderSecurityRequirement (securityRequirement: SecurityRequirement): number {
        switch (securityRequirement) {
            case SecurityRequirement.LOW:
                return 0.5;
            case SecurityRequirement.MEDIUM:
            case SecurityRequirement.NOT_DEFINED:
                return 1;
            case SecurityRequirement.HIGH:
                return 1.5;
        }
    }

    /**
     * Computes the value defined in the specification as ISC_Modified.
     *
     * @returns the value defined in the specification as ISC_Modified.
     */
    private computeIscModified (): number {

        // Compute relevant modified subscores.
        let modifiedConfidentialityImpact = Cvss3ScoringEngine.renderImpact(this.getModifiedConfidentialityImpactValue());
        let modifiedIntegrityImpact = Cvss3ScoringEngine.renderImpact(this.getModifiedIntegrityImpactValue());
        let modifiedAvailabilityImpact = Cvss3ScoringEngine.renderImpact(this.getModifiedAvailabilityImpactValue());

        // Compute impact requirement subscores.
        let confidenialityRequirement = Cvss3ScoringEngine.renderSecurityRequirement(this._confidentialityRequirement);
        let integrityRequirement = Cvss3ScoringEngine.renderSecurityRequirement(this._integrityRequirement);
        let availabilityRequirement = Cvss3ScoringEngine.renderSecurityRequirement(this._availabilityRequirement);

        // Compute and return ISC_Modified.
        let productOfComplements = (1 - modifiedConfidentialityImpact * confidenialityRequirement)
            * (1 - modifiedIntegrityImpact * integrityRequirement)
            * (1 - modifiedAvailabilityImpact * availabilityRequirement);
        return Math.min(1 - productOfComplements, 0.915);
    }

    /**
     * Computes the modified impact subscore.
     *
     * @returns the modified impact subscore.
     */
    private computeModifiedImpactSubscore (): number {

        // Compute ISC_Modified.
        let iscModified = this.computeIscModified();

        // Compute modified impact subscore.
        if (this._modifiedScope === Scope.UNCHANGED) {
            return 6.42 * iscModified;
        }
        return 7.52 * (iscModified - 0.029) - 3.25 * Math.pow(iscModified - 0.02, 15);
    }

    /**
     * Computes the modified exploitability subscore.
     *
     * @returns the modified exploitability subscore
     */
    private computeModifiedExploitabilitySubscore (): number {

        // Compute relevant modified values.
        let modifiedAttackVector = Cvss3ScoringEngine.renderAttackVector(this.getModifiedAttackVectorValue());
        let modifiedAttackComplexity = Cvss3ScoringEngine.renderAttackComplexity(this.getModifiedAttackComplexityValue());
        let modifiedPrivilegesRequired = Cvss3ScoringEngine.renderPrivilegesRequired(this.getModifiedPrivilegesRequiredValue(), this.getModifiedScopeValue());
        let modifiedUserInteraction = Cvss3ScoringEngine.renderUserInteraction(this.getModifiedUserInteractionValue());

        return 8.22 * modifiedAttackVector * modifiedAttackComplexity * modifiedPrivilegesRequired * modifiedUserInteraction;
    }

    /**
     * Computes the environmental score.
     *
     * @returns the Environmental score.
     */
    private computeEnvironmentalScore (): number {

        // Get all required subscores and values.
        let modifiedImpactSubscore = this.computeModifiedImpactSubscore();
        let modifiedExploitabilitySubscore = this.computeModifiedExploitabilitySubscore();
        let exploitCodeMaturity = Cvss3ScoringEngine.renderExploitCodeMaturity(this._exploitCodeMaturity);
        let remediationLevel = Cvss3ScoringEngine.renderRemediationLevel(this._remediationLevel);
        let reportConfidence = Cvss3ScoringEngine.renderReportConfidence(this._reportConfidence);
        let modifiedScope = this._modifiedScope == Scope.NOT_DEFINED ? this._scope : this._modifiedScope;

        // Compute and return the environmental score.
        if (modifiedImpactSubscore <= 0) {
            return 0;
        }
        let modifier = modifiedScope === Scope.UNCHANGED ? 1 : 1.08;
        return roundUp(roundUp(Math.min(modifier
            * (modifiedImpactSubscore + modifiedExploitabilitySubscore), 10))
            * exploitCodeMaturity
            * remediationLevel
            * reportConfidence);
    }

    /**
     * Gets whether or not a temporal score is defined.
     *
     * @returns true if a temporal score is defined, otherwise false
     */
    public isTemporalScoreDefined (): boolean {
        return (this._exploitCodeMaturity != ExploitCodeMaturity.NOT_DEFINED)
         || (this._remediationLevel != RemediationLevel.NOT_DEFINED)
         || (this._reportConfidence != ReportConfidence.NOT_DEFINED);
    }

    /**
     * Gets whether or not an environmental score is defined.
     *
     * @returns true if an environmental score is defined, otherwise false
     */
     public isEnvironmentalScoreDefined (): boolean {
        return (this._modifiedAttackVector != AttackVector.NOT_DEFINED)
         || (this._modifiedAttackComplexity != AttackComplexity.NOT_DEFINED)
         || (this._modifiedPrivilegesRequired != PrivilegesRequired.NOT_DEFINED)
         || (this._modifiedUserInteraction != UserInteraction.NOT_DEFINED)
         || (this._modifiedScope != Scope.NOT_DEFINED)
         || (this._modifiedConfidentialityImpact != Impact.NOT_DEFINED)
         || (this._modifiedIntegrityImpact != Impact.NOT_DEFINED)
         || (this._modifiedAvailabilityImpact != Impact.NOT_DEFINED)
         || (this._confidentialityRequirement != SecurityRequirement.NOT_DEFINED)
         || (this._integrityRequirement != SecurityRequirement.NOT_DEFINED)
         || (this._availabilityRequirement != SecurityRequirement.NOT_DEFINED);
    }

    /**
     * Computes the overall score.
     *
     * @returns the overall score
     */
    private computeOverallScore (): number {

        // Prioritize environmental, then temporal, then base.
        if (this.isEnvironmentalScoreDefined()) {
            return this.computeEnvironmentalScore();
        } else if (this.isTemporalScoreDefined()) {
            return this.computeTemporalScore();
        }
        return this.computeBaseScore();
    }

    /**
     * Computes the CVSS score set under the current configuration.
     *
     * @returns the computed CVSS score set
     */
    public computeScore (): CvssScore {

        // Do not proceed if there are validation errors.
        if (!this.isValid()) {
            throw new RangeError("The CVSS v3 scoring engine is not fully configured. Run the validate() function. to "
                + "check for validation errors.");
        }

        // Return computed score set.
        return new CvssScore(
            this.computeBaseScore(),
            this.computeImpactSubscore(),
            this.computeExploitabilitySubscore(),
            this.isTemporalScoreDefined() ? this.computeTemporalScore() : null, // These fields are not always defined.
            this.isEnvironmentalScoreDefined() ? this.computeEnvironmentalScore() : null,
            this.isEnvironmentalScoreDefined() ? this.computeModifiedImpactSubscore() : null,
            this.computeOverallScore());
    }
}
