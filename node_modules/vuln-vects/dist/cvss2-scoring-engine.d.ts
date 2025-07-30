import { CvssScoringEngine } from "./cvss-scoring";
import { CvssScore } from "./cvss-score";
import { ScoreValidationError } from "./score-validation-error";
import { AccessComplexity, AccessVector, Authentication, CollateralDamagePotential, Exploitability, Impact, ImpactSubscore, RemediationLevel, ReportConfidence, TargetDistribution } from "./cvss2-enums";
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
export declare class Cvss2ScoringEngine implements CvssScoringEngine {
    private _accessVector;
    private _accessComplexity;
    private _authentication;
    private _confidentialityImpact;
    private _integrityImpact;
    private _availabilityImpact;
    private _exploitability;
    private _remediationLevel;
    private _reportConfidence;
    private _collateralDamagePotential;
    private _targetDistribution;
    private _confidentialityRequirement;
    private _integrityRequirement;
    private _availabilityRequirement;
    /**
     * Initializes a new instance of a service offering CVSS v2 vulnerability scoring.
     */
    constructor();
    /**
     * Gets or sets the access vector.
     */
    get accessVector(): AccessVector;
    set accessVector(accessVector: AccessVector);
    /**
     * Gets or sets the access complexity.
     */
    get accessComplexity(): AccessComplexity;
    set accessComplexity(accessComplexity: AccessComplexity);
    /**
     * Gets or sets the authentication.
     */
    get authentication(): Authentication;
    set authentication(authentication: Authentication);
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
     * Gets or sets the exploitability.
     */
    get exploitability(): Exploitability;
    set exploitability(exploitability: Exploitability);
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
     * Gets or sets the collateral damage potential.
     */
    get collateralDamagePotential(): CollateralDamagePotential;
    set collateralDamagePotential(collateralDamagePotential: CollateralDamagePotential);
    /**
     * Gets or sets the target distribution.
     */
    get targetDistribution(): TargetDistribution;
    set targetDistribution(targetDistribution: TargetDistribution);
    /**
     * Gets or sets the confidentiality requirement.
     */
    get confidentialityRequirement(): ImpactSubscore;
    set confidentialityRequirement(confidentialityRequirement: ImpactSubscore);
    /**
     * Gets or sets the integrity requirement.
     */
    get integrityRequirement(): ImpactSubscore;
    set integrityRequirement(integrityRequirement: ImpactSubscore);
    /**
     * Gets or sets the availability requirement.
     */
    get availabilityRequirement(): ImpactSubscore;
    set availabilityRequirement(availabilityRequirement: ImpactSubscore);
    /**
     * @inheritdoc
     */
    validate(): ScoreValidationError[];
    /**
     * @inheritdoc
     */
    isValid(): boolean;
    /**
     * Converts an {@link Impact} enum value to a number for use in calculations.
     *
     * @param impact the enum value to convert
     */
    private static renderImpact;
    /**
     * Computes the impact score.
     *
     * @returns the impact score
     */
    private computeImpactScore;
    /**
     * Converts an {@link AccessComplexity} enum value to a number for use in calculations.
     *
     * @param accessComplexity the enum value to convert
     */
    private static renderAccessComplexity;
    /**
     * Converts an {@link Authentication} enum value to a number for use in calculations.
     *
     * @param authentication the enum value to convert
     */
    private static renderAuthentication;
    /**
     * Converts an {@link AccessVector} enum value to a number for use in calculations.
     *
     * @param accessVector the enum value to convert
     */
    private static renderAccessVector;
    /**
     * Computes the exploitability score.
     *
     * @returns the exploitability score
     */
    private computeExploitabilityScore;
    /**
     * Converts an impact score to an impact factor.
     *
     * @param impact the impact score to convert
     * @returns the converted impact factor
     */
    private static impactFactor;
    /**
     * Computes the base score.
     *
     * @returns the base score
     */
    private computeBaseScore;
    /**
     * Converts an {@link Exploitability} enum value to a number for use in calculations.
     *
     * @param exploitability the enum value to convert
     */
    private static renderExploitability;
    /**
     * Converts an {@link RemediationLevel} enum value to a number for use in calculations.
     *
     * @param remediationLevel the enum value to convert
     */
    private static renderRemediationLevel;
    /**
     * Converts an {@link ReportConfidence} enum value to a number for use in calculations.
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
     * Converts an {@link ImpactSubscore} enum value to a number for use in calculations.
     *
     * @param impactSubscore the enum value to convert
     */
    private static renderImpactSubscore;
    /**
     * Computes the adjusted impact score.
     *
     * @returns the adjusted impact score
     */
    private computeAdjustedImpactScore;
    /**
     * Computes the adjusted base score.
     *
     * @returns the adjusted base score
     */
    private computeAdjustedBaseScore;
    /**
     * Computes the adjusted temporal score.
     *
     * @returns the adjusted temporal score
     */
    private computeAdjustedTemporalScore;
    /**
     * Converts an {@link CollateralDamagePotential} enum value to a number for use in calculations.
     *
     * @param collateralDamagePotential the enum value to convert
     */
    private static renderCollateralDamagePotential;
    /**
     * Converts an {@link TargetDistribution} enum value to a number for use in calculations.
     *
     * @param targetDistribution the enum value to convert
     */
    private static renderTargetDistribution;
    /**
     * Computes the environmental score.
     *
     * @returns the environmental score
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
     * @inheritdoc
     */
    computeScore(): CvssScore;
}
