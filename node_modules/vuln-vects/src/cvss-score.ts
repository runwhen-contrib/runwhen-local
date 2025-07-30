/**
 * Represents a CVSS score produced by an instance of {@link CvssScoringEngine}.
 *
 * @public
 */
export class CvssScore {

    private _baseScore: number;

    private _impactSubscore: number;

    private _exploitabilitySubscore: number;

    private _temporalScore: number | null;

    private _environmentalScore: number | null;

    private _modifiedImpactSubscore: number | null;

    private _overallScore: number;

    /**
     * Initializes a new instance of a CVSS score.
     *
     * @param baseScore the base score
     * @param impactSubscore the impact subscore
     * @param exploitabilitySubscore the exploitability subscore
     * @param temporalScore the temporal score
     * @param environmentalScore the environmental score
     * @param modifiedImpactSubscore the modified impact score
     * @param overallScore the overall score (non-standard addition by NIST/NVD)
     */
    public constructor (
        baseScore: number = 0,
        impactSubscore: number = 0,
        exploitabilitySubscore: number = 0,
        temporalScore: number | null = null, // These numbers are nullable.
        environmentalScore: number | null = null,
        modifiedImpactSubscore: number | null = null,
        overallScore: number = 0) {
        this._baseScore = baseScore;
        this._impactSubscore = impactSubscore;
        this._exploitabilitySubscore = exploitabilitySubscore;
        this._temporalScore = temporalScore;
        this._environmentalScore = environmentalScore;
        this._modifiedImpactSubscore = modifiedImpactSubscore;
        this._overallScore = overallScore;
    }

    /**
     * Gets the base score.
     *
     * The base score represents the severity of the vulnerability based on its intrinsic properties. It is constant
     * over time.
     *
     * @returns the base score
     */
    get baseScore (): number {
        return this._baseScore;
    }

    /**
     * Gets the impact subscore.
     *
     * The impact subscore is a measure of impact, derived from the base impact metrics.
     *
     * @returns the impact subscore
     */
    get impactSubscore (): number {
        return this._impactSubscore;
    }

    /**
     * Gets the exploitability subscore.
     *
     * The exploitability subscore is a measure of exploitability, derived from the base exploitability metrics.
     *
     * @returns the exploitability subscore
     */
    get exploitabilitySubscore (): number {
        return this._exploitabilitySubscore;
    }

    /**
     * Gets the temporal score.
     *
     * The temporal score represents the severity of the vulnerability as it currently exists, accounting for factors
     * such as whether or not there exists an exploit, patch or workaround for the vulnerability.
     *
     * @returns the temporal score
     */
    get temporalScore (): number | null {
        return this._temporalScore;
    }

    /**
     * Gets the environmental score.
     *
     * The environmental score represents the severity of the vulnerability as it exists on a specific organization's
     * IT infrastructure.
     *
     * @returns the environmental score
     */
    get environmentalScore (): number | null {
        return this._environmentalScore;
    }

    /**
     * Gets the modified impact subscore.
     *
     * The impact subscore is a measure of impact, derived from the modified (environmental) impact metrics.
     *
     * @returns the moodified impact subscore
     */
    get modifiedImpactSubscore (): number | null {
        return this._modifiedImpactSubscore;
    }

    /**
     * Gets the overall score.
     *
     * The overall score is a non-standard measure which is preferentially equal to the environmental score, then
     * temporal score and finally base score if neither of the former two are defined.
     *
     * @returns the overall score
     */
    get overallScore (): number {
        return this._overallScore;
    }

    /**
     * Gets the CVSS v3.0/1 severity text for this score.
     *
     * @returns the severity text
     */
    get cvss3OverallSeverityText (): string {
        if (this._overallScore > 0 && this._overallScore < 4) {
            return "low";
        } else if (this._overallScore >= 4 && this._overallScore < 7) {
            return "medium";
        } else if (this._overallScore >= 7 && this._overallScore < 9) {
            return "high";
        } else if (this._overallScore >= 9) {
            return "critical";
        }
        return "none";
    }
}
