import { CvssScoringEngine } from "./cvss-scoring";
import { CvssScore } from "./cvss-score";
import { ScoreValidationError } from "./score-validation-error";
import {
    AccessComplexity,
    AccessVector,
    Authentication,
    CollateralDamagePotential,
    Exploitability,
    Impact,
    ImpactSubscore,
    RemediationLevel,
    ReportConfidence,
    TargetDistribution
} from "./cvss2-enums";


/**
 * Implements a service offering CVSS v2 vulnerability scoring.
 *
 * @remarks
 * Consumers should ensure that they make sure of the validation features built in to this class in the form of the
 * {@link validate} and {@link isValid} functions. Attempting to call {@link computeScore} on an instance with an
 * invalid configuration will raise an exception.
 *
 * @public
 */
export class Cvss2ScoringEngine implements CvssScoringEngine {

    private _accessVector: AccessVector;

    private _accessComplexity: AccessComplexity;

    private _authentication: Authentication;

    private _confidentialityImpact: Impact;

    private _integrityImpact: Impact;

    private _availabilityImpact: Impact;

    private _exploitability: Exploitability;

    private _remediationLevel: RemediationLevel;

    private _reportConfidence: ReportConfidence;

    private _collateralDamagePotential: CollateralDamagePotential;

    private _targetDistribution: TargetDistribution;

    private _confidentialityRequirement: ImpactSubscore;

    private _integrityRequirement: ImpactSubscore;

    private _availabilityRequirement: ImpactSubscore;

    /**
     * Initializes a new instance of a service offering CVSS v2 vulnerability scoring.
     */
    public constructor () {

        // Base score metrics do not permit undefined values. This is caught in validation.
        this._accessVector = AccessVector.NOT_DEFINED;
        this._accessComplexity = AccessComplexity.NOT_DEFINED;
        this._authentication = Authentication.NOT_DEFINED;
        this._confidentialityImpact = Impact.NOT_DEFINED;
        this._integrityImpact = Impact.NOT_DEFINED;
        this._availabilityImpact = Impact.NOT_DEFINED;

        // Temporal score metrics permit undefined values.
        this._exploitability = Exploitability.NOT_DEFINED;
        this._remediationLevel = RemediationLevel.NOT_DEFINED;
        this._reportConfidence = ReportConfidence.NOT_DEFINED;

        // Environmental score metrics also permit undefined values.
        this._collateralDamagePotential = CollateralDamagePotential.NOT_DEFINED; // General modifiers.
        this._targetDistribution = TargetDistribution.NOT_DEFINED;
        this._confidentialityRequirement = ImpactSubscore.NOT_DEFINED; // Impact subscore modifiers.
        this._integrityRequirement = ImpactSubscore.NOT_DEFINED;
        this._availabilityRequirement = ImpactSubscore.NOT_DEFINED;
    }

    /**
     * Gets or sets the access vector.
     */
    get accessVector (): AccessVector {
        return this._accessVector;
    }
    set accessVector (accessVector: AccessVector) {
        this._accessVector = accessVector;
    }

    /**
     * Gets or sets the access complexity.
     */
    get accessComplexity (): AccessComplexity {
        return this._accessComplexity;
    }
    set accessComplexity (accessComplexity: AccessComplexity) {
        this._accessComplexity = accessComplexity;
    }

    /**
     * Gets or sets the authentication.
     */
    get authentication (): Authentication {
        return this._authentication;
    }
    set authentication (authentication: Authentication) {
        this._authentication = authentication;
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
     * Gets or sets the exploitability.
     */
    get exploitability (): Exploitability {
        return this._exploitability;
    }
    set exploitability (exploitability: Exploitability) {
        this._exploitability = exploitability;
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
     * Gets or sets the collateral damage potential.
     */
    get collateralDamagePotential (): CollateralDamagePotential {
        return this._collateralDamagePotential;
    }
    set collateralDamagePotential (collateralDamagePotential: CollateralDamagePotential) {
        this._collateralDamagePotential = collateralDamagePotential;
    }

    /**
     * Gets or sets the target distribution.
     */
    get targetDistribution (): TargetDistribution {
        return this._targetDistribution;
    }
    set targetDistribution (targetDistribution: TargetDistribution) {
        this._targetDistribution = targetDistribution;
    }

    /**
     * Gets or sets the confidentiality requirement.
     */
    get confidentialityRequirement (): ImpactSubscore {
        return this._confidentialityRequirement;
    }
    set confidentialityRequirement (confidentialityRequirement: ImpactSubscore) {
        this._confidentialityRequirement = confidentialityRequirement;
    }

    /**
     * Gets or sets the integrity requirement.
     */
    get integrityRequirement (): ImpactSubscore {
        return this._integrityRequirement;
    }
    set integrityRequirement (integrityRequirement: ImpactSubscore) {
        this._integrityRequirement = integrityRequirement;
    }

    /**
     * Gets or sets the availability requirement.
     */
    get availabilityRequirement (): ImpactSubscore {
        return this._availabilityRequirement;
    }
    set availabilityRequirement (availabilityRequirement: ImpactSubscore) {
        this._availabilityRequirement = availabilityRequirement;
    }

    /**
     * @inheritdoc
     */
    public validate (): ScoreValidationError[] {

        // Build a collection of errors.
        let scoreValidationErrors: ScoreValidationError[] = [];

        // Exploitability metrics are not allowed to be undefined.
        if (this._accessVector === AccessVector.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "Access vector cannot be undefined in CVSS v2 scores. Ensure you have set it."));
        }
        if (this._accessComplexity === AccessComplexity.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "Access complexity cannot be undefined in CVSS v2 scores. Ensure you have set it."));
        }
        if (this._authentication === Authentication.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "Authentication cannot be undefined in CVSS v2 scores. Ensure you have set it."));
        }

        // Impact metrics are not allowed to be undefined.
        if (this._confidentialityImpact === Impact.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "Confidentiality impact cannot be undefined in CVSS v2 scores. Ensure you have set it."));
        }
        if (this._integrityImpact === Impact.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "Integrity impact cannot be undefined in CVSS v2 scores. Ensure you have set it."));
        }
        if (this._availabilityImpact === Impact.NOT_DEFINED) {
            scoreValidationErrors.push(new ScoreValidationError(
                "Availability impact cannot be undefined in CVSS v2 scores. Ensure you have set it."));
        }

        // Return errors.
        return scoreValidationErrors;
    }

    /**
     * @inheritdoc
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
            case Impact.PARTIAL:
                return 0.275;
            case Impact.COMPLETE:
                return 0.660;
        }
        return 0; // Never returned.
    }

    /**
     * Computes the impact score.
     *
     * @returns the impact score
     */
    private computeImpactScore(): number {

        // Render impacts to numeric scores.
        let confidentialityImpact = Cvss2ScoringEngine.renderImpact(this._confidentialityImpact);
        let integrityImpact = Cvss2ScoringEngine.renderImpact(this._integrityImpact);
        let availabilityImpact = Cvss2ScoringEngine.renderImpact(this._availabilityImpact);

        // Compute and return overall impact score.
        let impact = 10.41 * (1 - (1 - confidentialityImpact) * (1 - integrityImpact) * (1 - availabilityImpact))
        return impact;
    }

    /**
     * Converts an {@link AccessComplexity} enum value to a number for use in calculations.
     *
     * @param accessComplexity the enum value to convert
     */
    private static renderAccessComplexity (accessComplexity: AccessComplexity): number {
        switch (accessComplexity) {
            case AccessComplexity.HIGH:
                return 0.35;
            case AccessComplexity.MEDIUM:
                return 0.61;
            case AccessComplexity.LOW:
                return 0.71;
        }
        return 0; // Never returned.
    }

    /**
     * Converts an {@link Authentication} enum value to a number for use in calculations.
     *
     * @param authentication the enum value to convert
     */
    private static renderAuthentication (authentication: Authentication): number {
        switch (authentication) {
            case Authentication.NONE:
                return 0.704;
            case Authentication.SINGLE:
                return 0.56;
            case Authentication.MULTIPLE:
                return 0.45;
        }
        return 0; // Never returned.
    }

    /**
     * Converts an {@link AccessVector} enum value to a number for use in calculations.
     *
     * @param accessVector the enum value to convert
     */
    private static renderAccessVector (accessVector: AccessVector): number {
        switch (accessVector) {
            case AccessVector.LOCAL:
                return 0.395;
            case AccessVector.NETWORK:
                return 1.0;
            case AccessVector.ADJACENT_NETWORK:
                return 0.646;
        }
        return 0; // Never returned.
    }

    /**
     * Computes the exploitability score.
     *
     * @returns the exploitability score
     */
    private computeExploitabilityScore (): number {

        // Render exploitabilities to numeric scores.
        let accessComplexity = Cvss2ScoringEngine.renderAccessComplexity(this._accessComplexity);
        let authentication = Cvss2ScoringEngine.renderAuthentication(this._authentication);
        let accessVector = Cvss2ScoringEngine.renderAccessVector(this._accessVector);

        // Compute and return overall exploitability score.
        let exploitability = 20 * accessComplexity * authentication * accessVector;
        return exploitability;
    }

    /**
     * Converts an impact score to an impact factor.
     *
     * @param impact the impact score to convert
     * @returns the converted impact factor
     */
    private static impactFactor (impact: number): number  {
        return impact == 0 ? 0 : 1.176;
    }

    /**
     * Computes the base score.
     *
     * @returns the base score
     */
    private computeBaseScore (): number {

        // Compute relevant subscores.
        let impact = this.computeImpactScore();
        let exploitability = this.computeExploitabilityScore();

        // Compute and return base score.
        let baseScore = (0.6 * impact + 0.4 * exploitability - 1.5) * Cvss2ScoringEngine.impactFactor(impact);
        return baseScore;
    }

    /**
     * Converts an {@link Exploitability} enum value to a number for use in calculations.
     *
     * @param exploitability the enum value to convert
     */
    private static renderExploitability (exploitability: Exploitability): number {
        switch (exploitability) {
            case Exploitability.UNPROVEN_THAT_EXPLOIT_EXISTS:
                return 0.85;
            case Exploitability.PROOF_OF_CONCEPT_CODE:
                return 0.9;
            case Exploitability.FUNCTIONAL_EXPLOIT_EXISTS:
                return 0.95;
            case Exploitability.HIGH:
            case Exploitability.NOT_DEFINED:
                return 1;
        }
    }

    /**
     * Converts an {@link RemediationLevel} enum value to a number for use in calculations.
     *
     * @param remediationLevel the enum value to convert
     */
    private static renderRemediationLevel (remediationLevel: RemediationLevel): number {
        switch (remediationLevel) {
            case RemediationLevel.OFFICIAL_FIX:
                return 0.87;
            case RemediationLevel.TEMPORARY_FIX:
                return 0.9;
            case RemediationLevel.WORKAROUND:
                return 0.95;
            case RemediationLevel.UNAVAILABLE:
            case RemediationLevel.NOT_DEFINED:
                return 1;
        }
    }

    /**
     * Converts an {@link ReportConfidence} enum value to a number for use in calculations.
     *
     * @param reportConfidence the enum value to convert
     */
    private static renderReportConfidence (reportConfidence: ReportConfidence): number {
        switch (reportConfidence) {
            case ReportConfidence.UNCONFIRMED:
                return 0.90;
            case ReportConfidence.UNCORROBORATED:
                return 0.95;
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
        let exploitability = Cvss2ScoringEngine.renderExploitability(this._exploitability);
        let remediationLevel = Cvss2ScoringEngine.renderRemediationLevel(this._remediationLevel);
        let reportConfidence = Cvss2ScoringEngine.renderReportConfidence(this._reportConfidence);

        // Compute and return temporal score.
        let temporalScore = baseScore * exploitability * remediationLevel * reportConfidence;
        return temporalScore;
    }

    /**
     * Converts an {@link ImpactSubscore} enum value to a number for use in calculations.
     *
     * @param impactSubscore the enum value to convert
     */
    private static renderImpactSubscore (impactSubscore: ImpactSubscore): number {
        switch (impactSubscore) {
            case ImpactSubscore.LOW:
                return 0.5;
            case ImpactSubscore.MEDIUM:
            case ImpactSubscore.NOT_DEFINED:
                return 1;
            case ImpactSubscore.HIGH:
                return 1.51;
        }
    }

    /**
     * Computes the adjusted impact score.
     *
     * @returns the adjusted impact score
     */
    private computeAdjustedImpactScore (): number {

        // Render impacts to numeric scores.
        let confidentialityImpact = Cvss2ScoringEngine.renderImpact(this._confidentialityImpact);
        let integrityImpact = Cvss2ScoringEngine.renderImpact(this._integrityImpact);
        let availabilityImpact = Cvss2ScoringEngine.renderImpact(this._availabilityImpact);

        // Render requirements to numeric scores.
        let confidenialityRequirement = Cvss2ScoringEngine.renderImpactSubscore(this._confidentialityRequirement);
        let integrityRequirement = Cvss2ScoringEngine.renderImpactSubscore(this._integrityRequirement);
        let availabilityRequirement = Cvss2ScoringEngine.renderImpactSubscore(this._availabilityRequirement);

        // Compute and return adjusted impact score.
        let adjustedImpactScore = Math.min(10, 10.41
            * (1 - (1 - confidentialityImpact * confidenialityRequirement)
            * (1 - integrityImpact * integrityRequirement)
            * (1 - availabilityImpact * availabilityRequirement)));
        return adjustedImpactScore;
    }

    /**
     * Computes the adjusted base score.
     *
     * @returns the adjusted base score
     */
    private computeAdjustedBaseScore (): number {

        // Compute relevant subscores.
        let impact = this.computeAdjustedImpactScore(); // Adjusted.
        let exploitability = this.computeExploitabilityScore();

        // Compute and return adjusted base score.
        let baseScore = (0.6 * impact + 0.4 * exploitability - 1.5) * Cvss2ScoringEngine.impactFactor(impact);
        return baseScore;
    }

    /**
     * Computes the adjusted temporal score.
     *
     * @returns the adjusted temporal score
     */
    private computeAdjustedTemporalScore (): number {

        // Compute base score.
        let baseScore = this.computeAdjustedBaseScore(); // Adjusted.

        // Compute relevant subscores.
        let exploitability = Cvss2ScoringEngine.renderExploitability(this._exploitability);
        let remediationLevel = Cvss2ScoringEngine.renderRemediationLevel(this._remediationLevel);
        let reportConfidence = Cvss2ScoringEngine.renderReportConfidence(this._reportConfidence);

        // Compute and return adjusted temporal score.
        let temporalScore = baseScore * exploitability * remediationLevel * reportConfidence;
        return temporalScore;
    }

    /**
     * Converts an {@link CollateralDamagePotential} enum value to a number for use in calculations.
     *
     * @param collateralDamagePotential the enum value to convert
     */
    private static renderCollateralDamagePotential (collateralDamagePotential: CollateralDamagePotential): number {
        switch (collateralDamagePotential) {
            case CollateralDamagePotential.NONE:
            case CollateralDamagePotential.NOT_DEFINED:
                return 0;
            case CollateralDamagePotential.LOW:
                return 0.1;
            case CollateralDamagePotential.LOW_MEDIUM:
                return 0.3;
            case CollateralDamagePotential.MEDIUM_HIGH:
                return 0.4;
            case CollateralDamagePotential.HIGH:
                return 0.5;
        }
    }

    /**
     * Converts an {@link TargetDistribution} enum value to a number for use in calculations.
     *
     * @param targetDistribution the enum value to convert
     */
    private static renderTargetDistribution (targetDistribution: TargetDistribution): number {
        switch (targetDistribution) {
            case TargetDistribution.NONE:
                return 0;
            case TargetDistribution.LOW:
                return 0.25;
            case TargetDistribution.MEDIUM:
                return 0.75;
            case TargetDistribution.HIGH:
            case TargetDistribution.NOT_DEFINED:
                return 1;
        }
    }

    /**
     * Computes the environmental score.
     *
     * @returns the environmental score
     */
    private computeEnvironmentalScore (): number {

        // Compute relevant subscores.
        let ajdustedTemporalScore = this.computeAdjustedTemporalScore();
        let collateralDamagePotential = Cvss2ScoringEngine.renderCollateralDamagePotential(
            this._collateralDamagePotential);
        let targetDistribution = Cvss2ScoringEngine.renderTargetDistribution(this._targetDistribution);

        // Compute and return environmental score.
        let environmentalScore = (ajdustedTemporalScore + (10 - ajdustedTemporalScore) * collateralDamagePotential)
            * targetDistribution;
        return environmentalScore;
    }

    /**
     * Gets whether or not a temporal score is defined.
     *
     * @returns true if a temporal score is defined, otherwise false
     */
    public isTemporalScoreDefined (): boolean {
        return (this._exploitability != Exploitability.NOT_DEFINED)
         || (this._remediationLevel != RemediationLevel.NOT_DEFINED)
         || (this._reportConfidence != ReportConfidence.NOT_DEFINED);
    }

    /**
     * Gets whether or not an environmental score is defined.
     *
     * @returns true if an environmental score is defined, otherwise false
     */
    public isEnvironmentalScoreDefined (): boolean {
        return (this._collateralDamagePotential != CollateralDamagePotential.NOT_DEFINED)
         || (this._targetDistribution != TargetDistribution.NOT_DEFINED)
         || (this._confidentialityRequirement != ImpactSubscore.NOT_DEFINED)
         || (this._integrityRequirement != ImpactSubscore.NOT_DEFINED)
         || (this._availabilityRequirement != ImpactSubscore.NOT_DEFINED);
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
     * @inheritdoc
     */
    public computeScore (): CvssScore {

        // Do not proceed if there are validation errors.
        if (!this.isValid()) {
            throw new RangeError("The CVSS v2 scoring engine is not fully configured. Run the validate() function. to "
                + "check for validation errors.");
        }

        // Return computed score set.
        return new CvssScore(
            this.computeBaseScore(),
            this.computeImpactScore(),
            this.computeExploitabilityScore(),
            this.isTemporalScoreDefined() ? this.computeTemporalScore() : null, // These fields are not always defined.
            this.isEnvironmentalScoreDefined() ? this.computeEnvironmentalScore() : null,
            this.isEnvironmentalScoreDefined() ? this.computeAdjustedImpactScore() : null,
            this.computeOverallScore());
    }
}
