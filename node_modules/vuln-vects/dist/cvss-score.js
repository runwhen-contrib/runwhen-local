"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a CVSS score produced by an instance of {@link CvssScoringEngine}.
 *
 * @public
 */
var CvssScore = /** @class */ (function () {
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
    function CvssScore(baseScore, impactSubscore, exploitabilitySubscore, temporalScore, // These numbers are nullable.
    environmentalScore, modifiedImpactSubscore, overallScore) {
        if (baseScore === void 0) { baseScore = 0; }
        if (impactSubscore === void 0) { impactSubscore = 0; }
        if (exploitabilitySubscore === void 0) { exploitabilitySubscore = 0; }
        if (temporalScore === void 0) { temporalScore = null; }
        if (environmentalScore === void 0) { environmentalScore = null; }
        if (modifiedImpactSubscore === void 0) { modifiedImpactSubscore = null; }
        if (overallScore === void 0) { overallScore = 0; }
        this._baseScore = baseScore;
        this._impactSubscore = impactSubscore;
        this._exploitabilitySubscore = exploitabilitySubscore;
        this._temporalScore = temporalScore;
        this._environmentalScore = environmentalScore;
        this._modifiedImpactSubscore = modifiedImpactSubscore;
        this._overallScore = overallScore;
    }
    Object.defineProperty(CvssScore.prototype, "baseScore", {
        /**
         * Gets the base score.
         *
         * The base score represents the severity of the vulnerability based on its intrinsic properties. It is constant
         * over time.
         *
         * @returns the base score
         */
        get: function () {
            return this._baseScore;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CvssScore.prototype, "impactSubscore", {
        /**
         * Gets the impact subscore.
         *
         * The impact subscore is a measure of impact, derived from the base impact metrics.
         *
         * @returns the impact subscore
         */
        get: function () {
            return this._impactSubscore;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CvssScore.prototype, "exploitabilitySubscore", {
        /**
         * Gets the exploitability subscore.
         *
         * The exploitability subscore is a measure of exploitability, derived from the base exploitability metrics.
         *
         * @returns the exploitability subscore
         */
        get: function () {
            return this._exploitabilitySubscore;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CvssScore.prototype, "temporalScore", {
        /**
         * Gets the temporal score.
         *
         * The temporal score represents the severity of the vulnerability as it currently exists, accounting for factors
         * such as whether or not there exists an exploit, patch or workaround for the vulnerability.
         *
         * @returns the temporal score
         */
        get: function () {
            return this._temporalScore;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CvssScore.prototype, "environmentalScore", {
        /**
         * Gets the environmental score.
         *
         * The environmental score represents the severity of the vulnerability as it exists on a specific organization's
         * IT infrastructure.
         *
         * @returns the environmental score
         */
        get: function () {
            return this._environmentalScore;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CvssScore.prototype, "modifiedImpactSubscore", {
        /**
         * Gets the modified impact subscore.
         *
         * The impact subscore is a measure of impact, derived from the modified (environmental) impact metrics.
         *
         * @returns the moodified impact subscore
         */
        get: function () {
            return this._modifiedImpactSubscore;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CvssScore.prototype, "overallScore", {
        /**
         * Gets the overall score.
         *
         * The overall score is a non-standard measure which is preferentially equal to the environmental score, then
         * temporal score and finally base score if neither of the former two are defined.
         *
         * @returns the overall score
         */
        get: function () {
            return this._overallScore;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CvssScore.prototype, "cvss3OverallSeverityText", {
        /**
         * Gets the CVSS v3.0/1 severity text for this score.
         *
         * @returns the severity text
         */
        get: function () {
            if (this._overallScore > 0 && this._overallScore < 4) {
                return "low";
            }
            else if (this._overallScore >= 4 && this._overallScore < 7) {
                return "medium";
            }
            else if (this._overallScore >= 7 && this._overallScore < 9) {
                return "high";
            }
            else if (this._overallScore >= 9) {
                return "critical";
            }
            return "none";
        },
        enumerable: true,
        configurable: true
    });
    return CvssScore;
}());
exports.CvssScore = CvssScore;
