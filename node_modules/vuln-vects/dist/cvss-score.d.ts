/**
 * Represents a CVSS score produced by an instance of {@link CvssScoringEngine}.
 *
 * @public
 */
export declare class CvssScore {
    private _baseScore;
    private _impactSubscore;
    private _exploitabilitySubscore;
    private _temporalScore;
    private _environmentalScore;
    private _modifiedImpactSubscore;
    private _overallScore;
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
    constructor(baseScore?: number, impactSubscore?: number, exploitabilitySubscore?: number, temporalScore?: number | null, // These numbers are nullable.
    environmentalScore?: number | null, modifiedImpactSubscore?: number | null, overallScore?: number);
    /**
     * Gets the base score.
     *
     * The base score represents the severity of the vulnerability based on its intrinsic properties. It is constant
     * over time.
     *
     * @returns the base score
     */
    get baseScore(): number;
    /**
     * Gets the impact subscore.
     *
     * The impact subscore is a measure of impact, derived from the base impact metrics.
     *
     * @returns the impact subscore
     */
    get impactSubscore(): number;
    /**
     * Gets the exploitability subscore.
     *
     * The exploitability subscore is a measure of exploitability, derived from the base exploitability metrics.
     *
     * @returns the exploitability subscore
     */
    get exploitabilitySubscore(): number;
    /**
     * Gets the temporal score.
     *
     * The temporal score represents the severity of the vulnerability as it currently exists, accounting for factors
     * such as whether or not there exists an exploit, patch or workaround for the vulnerability.
     *
     * @returns the temporal score
     */
    get temporalScore(): number | null;
    /**
     * Gets the environmental score.
     *
     * The environmental score represents the severity of the vulnerability as it exists on a specific organization's
     * IT infrastructure.
     *
     * @returns the environmental score
     */
    get environmentalScore(): number | null;
    /**
     * Gets the modified impact subscore.
     *
     * The impact subscore is a measure of impact, derived from the modified (environmental) impact metrics.
     *
     * @returns the moodified impact subscore
     */
    get modifiedImpactSubscore(): number | null;
    /**
     * Gets the overall score.
     *
     * The overall score is a non-standard measure which is preferentially equal to the environmental score, then
     * temporal score and finally base score if neither of the former two are defined.
     *
     * @returns the overall score
     */
    get overallScore(): number;
    /**
     * Gets the CVSS v3.0/1 severity text for this score.
     *
     * @returns the severity text
     */
    get cvss3OverallSeverityText(): string;
}
