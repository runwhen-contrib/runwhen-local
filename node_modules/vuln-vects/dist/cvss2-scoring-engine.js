"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cvss_score_1 = require("./cvss-score");
var score_validation_error_1 = require("./score-validation-error");
var cvss2_enums_1 = require("./cvss2-enums");
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
var Cvss2ScoringEngine = /** @class */ (function () {
    /**
     * Initializes a new instance of a service offering CVSS v2 vulnerability scoring.
     */
    function Cvss2ScoringEngine() {
        // Base score metrics do not permit undefined values. This is caught in validation.
        this._accessVector = cvss2_enums_1.AccessVector.NOT_DEFINED;
        this._accessComplexity = cvss2_enums_1.AccessComplexity.NOT_DEFINED;
        this._authentication = cvss2_enums_1.Authentication.NOT_DEFINED;
        this._confidentialityImpact = cvss2_enums_1.Impact.NOT_DEFINED;
        this._integrityImpact = cvss2_enums_1.Impact.NOT_DEFINED;
        this._availabilityImpact = cvss2_enums_1.Impact.NOT_DEFINED;
        // Temporal score metrics permit undefined values.
        this._exploitability = cvss2_enums_1.Exploitability.NOT_DEFINED;
        this._remediationLevel = cvss2_enums_1.RemediationLevel.NOT_DEFINED;
        this._reportConfidence = cvss2_enums_1.ReportConfidence.NOT_DEFINED;
        // Environmental score metrics also permit undefined values.
        this._collateralDamagePotential = cvss2_enums_1.CollateralDamagePotential.NOT_DEFINED; // General modifiers.
        this._targetDistribution = cvss2_enums_1.TargetDistribution.NOT_DEFINED;
        this._confidentialityRequirement = cvss2_enums_1.ImpactSubscore.NOT_DEFINED; // Impact subscore modifiers.
        this._integrityRequirement = cvss2_enums_1.ImpactSubscore.NOT_DEFINED;
        this._availabilityRequirement = cvss2_enums_1.ImpactSubscore.NOT_DEFINED;
    }
    Object.defineProperty(Cvss2ScoringEngine.prototype, "accessVector", {
        /**
         * Gets or sets the access vector.
         */
        get: function () {
            return this._accessVector;
        },
        set: function (accessVector) {
            this._accessVector = accessVector;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss2ScoringEngine.prototype, "accessComplexity", {
        /**
         * Gets or sets the access complexity.
         */
        get: function () {
            return this._accessComplexity;
        },
        set: function (accessComplexity) {
            this._accessComplexity = accessComplexity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss2ScoringEngine.prototype, "authentication", {
        /**
         * Gets or sets the authentication.
         */
        get: function () {
            return this._authentication;
        },
        set: function (authentication) {
            this._authentication = authentication;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss2ScoringEngine.prototype, "confidentialityImpact", {
        /**
         * Gets or sets the confidentiality impact.
         */
        get: function () {
            return this._confidentialityImpact;
        },
        set: function (confidentialityImpact) {
            this._confidentialityImpact = confidentialityImpact;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss2ScoringEngine.prototype, "integrityImpact", {
        /**
         * Gets or sets the integrity impact.
         */
        get: function () {
            return this._integrityImpact;
        },
        set: function (integrityImpact) {
            this._integrityImpact = integrityImpact;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss2ScoringEngine.prototype, "availabilityImpact", {
        /**
         * Gets or sets the availability impact.
         */
        get: function () {
            return this._availabilityImpact;
        },
        set: function (availabilityImpact) {
            this._availabilityImpact = availabilityImpact;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss2ScoringEngine.prototype, "exploitability", {
        /**
         * Gets or sets the exploitability.
         */
        get: function () {
            return this._exploitability;
        },
        set: function (exploitability) {
            this._exploitability = exploitability;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss2ScoringEngine.prototype, "remediationLevel", {
        /**
         * Gets or sets the remediation level.
         */
        get: function () {
            return this._remediationLevel;
        },
        set: function (remediationLevel) {
            this._remediationLevel = remediationLevel;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss2ScoringEngine.prototype, "reportConfidence", {
        /**
         * Gets or sets the report confidence.
         */
        get: function () {
            return this._reportConfidence;
        },
        set: function (reportConfidence) {
            this._reportConfidence = reportConfidence;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss2ScoringEngine.prototype, "collateralDamagePotential", {
        /**
         * Gets or sets the collateral damage potential.
         */
        get: function () {
            return this._collateralDamagePotential;
        },
        set: function (collateralDamagePotential) {
            this._collateralDamagePotential = collateralDamagePotential;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss2ScoringEngine.prototype, "targetDistribution", {
        /**
         * Gets or sets the target distribution.
         */
        get: function () {
            return this._targetDistribution;
        },
        set: function (targetDistribution) {
            this._targetDistribution = targetDistribution;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss2ScoringEngine.prototype, "confidentialityRequirement", {
        /**
         * Gets or sets the confidentiality requirement.
         */
        get: function () {
            return this._confidentialityRequirement;
        },
        set: function (confidentialityRequirement) {
            this._confidentialityRequirement = confidentialityRequirement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss2ScoringEngine.prototype, "integrityRequirement", {
        /**
         * Gets or sets the integrity requirement.
         */
        get: function () {
            return this._integrityRequirement;
        },
        set: function (integrityRequirement) {
            this._integrityRequirement = integrityRequirement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss2ScoringEngine.prototype, "availabilityRequirement", {
        /**
         * Gets or sets the availability requirement.
         */
        get: function () {
            return this._availabilityRequirement;
        },
        set: function (availabilityRequirement) {
            this._availabilityRequirement = availabilityRequirement;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @inheritdoc
     */
    Cvss2ScoringEngine.prototype.validate = function () {
        // Build a collection of errors.
        var scoreValidationErrors = [];
        // Exploitability metrics are not allowed to be undefined.
        if (this._accessVector === cvss2_enums_1.AccessVector.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("Access vector cannot be undefined in CVSS v2 scores. Ensure you have set it."));
        }
        if (this._accessComplexity === cvss2_enums_1.AccessComplexity.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("Access complexity cannot be undefined in CVSS v2 scores. Ensure you have set it."));
        }
        if (this._authentication === cvss2_enums_1.Authentication.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("Authentication cannot be undefined in CVSS v2 scores. Ensure you have set it."));
        }
        // Impact metrics are not allowed to be undefined.
        if (this._confidentialityImpact === cvss2_enums_1.Impact.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("Confidentiality impact cannot be undefined in CVSS v2 scores. Ensure you have set it."));
        }
        if (this._integrityImpact === cvss2_enums_1.Impact.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("Integrity impact cannot be undefined in CVSS v2 scores. Ensure you have set it."));
        }
        if (this._availabilityImpact === cvss2_enums_1.Impact.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("Availability impact cannot be undefined in CVSS v2 scores. Ensure you have set it."));
        }
        // Return errors.
        return scoreValidationErrors;
    };
    /**
     * @inheritdoc
     */
    Cvss2ScoringEngine.prototype.isValid = function () {
        return this.validate().length == 0;
    };
    /**
     * Converts an {@link Impact} enum value to a number for use in calculations.
     *
     * @param impact the enum value to convert
     */
    Cvss2ScoringEngine.renderImpact = function (impact) {
        switch (impact) {
            case cvss2_enums_1.Impact.NONE:
                return 0;
            case cvss2_enums_1.Impact.PARTIAL:
                return 0.275;
            case cvss2_enums_1.Impact.COMPLETE:
                return 0.660;
        }
        return 0; // Never returned.
    };
    /**
     * Computes the impact score.
     *
     * @returns the impact score
     */
    Cvss2ScoringEngine.prototype.computeImpactScore = function () {
        // Render impacts to numeric scores.
        var confidentialityImpact = Cvss2ScoringEngine.renderImpact(this._confidentialityImpact);
        var integrityImpact = Cvss2ScoringEngine.renderImpact(this._integrityImpact);
        var availabilityImpact = Cvss2ScoringEngine.renderImpact(this._availabilityImpact);
        // Compute and return overall impact score.
        var impact = 10.41 * (1 - (1 - confidentialityImpact) * (1 - integrityImpact) * (1 - availabilityImpact));
        return impact;
    };
    /**
     * Converts an {@link AccessComplexity} enum value to a number for use in calculations.
     *
     * @param accessComplexity the enum value to convert
     */
    Cvss2ScoringEngine.renderAccessComplexity = function (accessComplexity) {
        switch (accessComplexity) {
            case cvss2_enums_1.AccessComplexity.HIGH:
                return 0.35;
            case cvss2_enums_1.AccessComplexity.MEDIUM:
                return 0.61;
            case cvss2_enums_1.AccessComplexity.LOW:
                return 0.71;
        }
        return 0; // Never returned.
    };
    /**
     * Converts an {@link Authentication} enum value to a number for use in calculations.
     *
     * @param authentication the enum value to convert
     */
    Cvss2ScoringEngine.renderAuthentication = function (authentication) {
        switch (authentication) {
            case cvss2_enums_1.Authentication.NONE:
                return 0.704;
            case cvss2_enums_1.Authentication.SINGLE:
                return 0.56;
            case cvss2_enums_1.Authentication.MULTIPLE:
                return 0.45;
        }
        return 0; // Never returned.
    };
    /**
     * Converts an {@link AccessVector} enum value to a number for use in calculations.
     *
     * @param accessVector the enum value to convert
     */
    Cvss2ScoringEngine.renderAccessVector = function (accessVector) {
        switch (accessVector) {
            case cvss2_enums_1.AccessVector.LOCAL:
                return 0.395;
            case cvss2_enums_1.AccessVector.NETWORK:
                return 1.0;
            case cvss2_enums_1.AccessVector.ADJACENT_NETWORK:
                return 0.646;
        }
        return 0; // Never returned.
    };
    /**
     * Computes the exploitability score.
     *
     * @returns the exploitability score
     */
    Cvss2ScoringEngine.prototype.computeExploitabilityScore = function () {
        // Render exploitabilities to numeric scores.
        var accessComplexity = Cvss2ScoringEngine.renderAccessComplexity(this._accessComplexity);
        var authentication = Cvss2ScoringEngine.renderAuthentication(this._authentication);
        var accessVector = Cvss2ScoringEngine.renderAccessVector(this._accessVector);
        // Compute and return overall exploitability score.
        var exploitability = 20 * accessComplexity * authentication * accessVector;
        return exploitability;
    };
    /**
     * Converts an impact score to an impact factor.
     *
     * @param impact the impact score to convert
     * @returns the converted impact factor
     */
    Cvss2ScoringEngine.impactFactor = function (impact) {
        return impact == 0 ? 0 : 1.176;
    };
    /**
     * Computes the base score.
     *
     * @returns the base score
     */
    Cvss2ScoringEngine.prototype.computeBaseScore = function () {
        // Compute relevant subscores.
        var impact = this.computeImpactScore();
        var exploitability = this.computeExploitabilityScore();
        // Compute and return base score.
        var baseScore = (0.6 * impact + 0.4 * exploitability - 1.5) * Cvss2ScoringEngine.impactFactor(impact);
        return baseScore;
    };
    /**
     * Converts an {@link Exploitability} enum value to a number for use in calculations.
     *
     * @param exploitability the enum value to convert
     */
    Cvss2ScoringEngine.renderExploitability = function (exploitability) {
        switch (exploitability) {
            case cvss2_enums_1.Exploitability.UNPROVEN_THAT_EXPLOIT_EXISTS:
                return 0.85;
            case cvss2_enums_1.Exploitability.PROOF_OF_CONCEPT_CODE:
                return 0.9;
            case cvss2_enums_1.Exploitability.FUNCTIONAL_EXPLOIT_EXISTS:
                return 0.95;
            case cvss2_enums_1.Exploitability.HIGH:
            case cvss2_enums_1.Exploitability.NOT_DEFINED:
                return 1;
        }
    };
    /**
     * Converts an {@link RemediationLevel} enum value to a number for use in calculations.
     *
     * @param remediationLevel the enum value to convert
     */
    Cvss2ScoringEngine.renderRemediationLevel = function (remediationLevel) {
        switch (remediationLevel) {
            case cvss2_enums_1.RemediationLevel.OFFICIAL_FIX:
                return 0.87;
            case cvss2_enums_1.RemediationLevel.TEMPORARY_FIX:
                return 0.9;
            case cvss2_enums_1.RemediationLevel.WORKAROUND:
                return 0.95;
            case cvss2_enums_1.RemediationLevel.UNAVAILABLE:
            case cvss2_enums_1.RemediationLevel.NOT_DEFINED:
                return 1;
        }
    };
    /**
     * Converts an {@link ReportConfidence} enum value to a number for use in calculations.
     *
     * @param reportConfidence the enum value to convert
     */
    Cvss2ScoringEngine.renderReportConfidence = function (reportConfidence) {
        switch (reportConfidence) {
            case cvss2_enums_1.ReportConfidence.UNCONFIRMED:
                return 0.90;
            case cvss2_enums_1.ReportConfidence.UNCORROBORATED:
                return 0.95;
            case cvss2_enums_1.ReportConfidence.CONFIRMED:
            case cvss2_enums_1.ReportConfidence.NOT_DEFINED:
                return 1;
        }
    };
    /**
     * Computes the temporal score.
     *
     * @returns the temporal score
     */
    Cvss2ScoringEngine.prototype.computeTemporalScore = function () {
        // Compute base score.
        var baseScore = this.computeBaseScore();
        // Compute relevant subscores.
        var exploitability = Cvss2ScoringEngine.renderExploitability(this._exploitability);
        var remediationLevel = Cvss2ScoringEngine.renderRemediationLevel(this._remediationLevel);
        var reportConfidence = Cvss2ScoringEngine.renderReportConfidence(this._reportConfidence);
        // Compute and return temporal score.
        var temporalScore = baseScore * exploitability * remediationLevel * reportConfidence;
        return temporalScore;
    };
    /**
     * Converts an {@link ImpactSubscore} enum value to a number for use in calculations.
     *
     * @param impactSubscore the enum value to convert
     */
    Cvss2ScoringEngine.renderImpactSubscore = function (impactSubscore) {
        switch (impactSubscore) {
            case cvss2_enums_1.ImpactSubscore.LOW:
                return 0.5;
            case cvss2_enums_1.ImpactSubscore.MEDIUM:
            case cvss2_enums_1.ImpactSubscore.NOT_DEFINED:
                return 1;
            case cvss2_enums_1.ImpactSubscore.HIGH:
                return 1.51;
        }
    };
    /**
     * Computes the adjusted impact score.
     *
     * @returns the adjusted impact score
     */
    Cvss2ScoringEngine.prototype.computeAdjustedImpactScore = function () {
        // Render impacts to numeric scores.
        var confidentialityImpact = Cvss2ScoringEngine.renderImpact(this._confidentialityImpact);
        var integrityImpact = Cvss2ScoringEngine.renderImpact(this._integrityImpact);
        var availabilityImpact = Cvss2ScoringEngine.renderImpact(this._availabilityImpact);
        // Render requirements to numeric scores.
        var confidenialityRequirement = Cvss2ScoringEngine.renderImpactSubscore(this._confidentialityRequirement);
        var integrityRequirement = Cvss2ScoringEngine.renderImpactSubscore(this._integrityRequirement);
        var availabilityRequirement = Cvss2ScoringEngine.renderImpactSubscore(this._availabilityRequirement);
        // Compute and return adjusted impact score.
        var adjustedImpactScore = Math.min(10, 10.41
            * (1 - (1 - confidentialityImpact * confidenialityRequirement)
                * (1 - integrityImpact * integrityRequirement)
                * (1 - availabilityImpact * availabilityRequirement)));
        return adjustedImpactScore;
    };
    /**
     * Computes the adjusted base score.
     *
     * @returns the adjusted base score
     */
    Cvss2ScoringEngine.prototype.computeAdjustedBaseScore = function () {
        // Compute relevant subscores.
        var impact = this.computeAdjustedImpactScore(); // Adjusted.
        var exploitability = this.computeExploitabilityScore();
        // Compute and return adjusted base score.
        var baseScore = (0.6 * impact + 0.4 * exploitability - 1.5) * Cvss2ScoringEngine.impactFactor(impact);
        return baseScore;
    };
    /**
     * Computes the adjusted temporal score.
     *
     * @returns the adjusted temporal score
     */
    Cvss2ScoringEngine.prototype.computeAdjustedTemporalScore = function () {
        // Compute base score.
        var baseScore = this.computeAdjustedBaseScore(); // Adjusted.
        // Compute relevant subscores.
        var exploitability = Cvss2ScoringEngine.renderExploitability(this._exploitability);
        var remediationLevel = Cvss2ScoringEngine.renderRemediationLevel(this._remediationLevel);
        var reportConfidence = Cvss2ScoringEngine.renderReportConfidence(this._reportConfidence);
        // Compute and return adjusted temporal score.
        var temporalScore = baseScore * exploitability * remediationLevel * reportConfidence;
        return temporalScore;
    };
    /**
     * Converts an {@link CollateralDamagePotential} enum value to a number for use in calculations.
     *
     * @param collateralDamagePotential the enum value to convert
     */
    Cvss2ScoringEngine.renderCollateralDamagePotential = function (collateralDamagePotential) {
        switch (collateralDamagePotential) {
            case cvss2_enums_1.CollateralDamagePotential.NONE:
            case cvss2_enums_1.CollateralDamagePotential.NOT_DEFINED:
                return 0;
            case cvss2_enums_1.CollateralDamagePotential.LOW:
                return 0.1;
            case cvss2_enums_1.CollateralDamagePotential.LOW_MEDIUM:
                return 0.3;
            case cvss2_enums_1.CollateralDamagePotential.MEDIUM_HIGH:
                return 0.4;
            case cvss2_enums_1.CollateralDamagePotential.HIGH:
                return 0.5;
        }
    };
    /**
     * Converts an {@link TargetDistribution} enum value to a number for use in calculations.
     *
     * @param targetDistribution the enum value to convert
     */
    Cvss2ScoringEngine.renderTargetDistribution = function (targetDistribution) {
        switch (targetDistribution) {
            case cvss2_enums_1.TargetDistribution.NONE:
                return 0;
            case cvss2_enums_1.TargetDistribution.LOW:
                return 0.25;
            case cvss2_enums_1.TargetDistribution.MEDIUM:
                return 0.75;
            case cvss2_enums_1.TargetDistribution.HIGH:
            case cvss2_enums_1.TargetDistribution.NOT_DEFINED:
                return 1;
        }
    };
    /**
     * Computes the environmental score.
     *
     * @returns the environmental score
     */
    Cvss2ScoringEngine.prototype.computeEnvironmentalScore = function () {
        // Compute relevant subscores.
        var ajdustedTemporalScore = this.computeAdjustedTemporalScore();
        var collateralDamagePotential = Cvss2ScoringEngine.renderCollateralDamagePotential(this._collateralDamagePotential);
        var targetDistribution = Cvss2ScoringEngine.renderTargetDistribution(this._targetDistribution);
        // Compute and return environmental score.
        var environmentalScore = (ajdustedTemporalScore + (10 - ajdustedTemporalScore) * collateralDamagePotential)
            * targetDistribution;
        return environmentalScore;
    };
    /**
     * Gets whether or not a temporal score is defined.
     *
     * @returns true if a temporal score is defined, otherwise false
     */
    Cvss2ScoringEngine.prototype.isTemporalScoreDefined = function () {
        return (this._exploitability != cvss2_enums_1.Exploitability.NOT_DEFINED)
            || (this._remediationLevel != cvss2_enums_1.RemediationLevel.NOT_DEFINED)
            || (this._reportConfidence != cvss2_enums_1.ReportConfidence.NOT_DEFINED);
    };
    /**
     * Gets whether or not an environmental score is defined.
     *
     * @returns true if an environmental score is defined, otherwise false
     */
    Cvss2ScoringEngine.prototype.isEnvironmentalScoreDefined = function () {
        return (this._collateralDamagePotential != cvss2_enums_1.CollateralDamagePotential.NOT_DEFINED)
            || (this._targetDistribution != cvss2_enums_1.TargetDistribution.NOT_DEFINED)
            || (this._confidentialityRequirement != cvss2_enums_1.ImpactSubscore.NOT_DEFINED)
            || (this._integrityRequirement != cvss2_enums_1.ImpactSubscore.NOT_DEFINED)
            || (this._availabilityRequirement != cvss2_enums_1.ImpactSubscore.NOT_DEFINED);
    };
    /**
     * Computes the overall score.
     *
     * @returns the overall score
     */
    Cvss2ScoringEngine.prototype.computeOverallScore = function () {
        // Prioritize environmental, then temporal, then base.
        if (this.isEnvironmentalScoreDefined()) {
            return this.computeEnvironmentalScore();
        }
        else if (this.isTemporalScoreDefined()) {
            return this.computeTemporalScore();
        }
        return this.computeBaseScore();
    };
    /**
     * @inheritdoc
     */
    Cvss2ScoringEngine.prototype.computeScore = function () {
        // Do not proceed if there are validation errors.
        if (!this.isValid()) {
            throw new RangeError("The CVSS v2 scoring engine is not fully configured. Run the validate() function. to "
                + "check for validation errors.");
        }
        // Return computed score set.
        return new cvss_score_1.CvssScore(this.computeBaseScore(), this.computeImpactScore(), this.computeExploitabilityScore(), this.isTemporalScoreDefined() ? this.computeTemporalScore() : null, // These fields are not always defined.
        this.isEnvironmentalScoreDefined() ? this.computeEnvironmentalScore() : null, this.isEnvironmentalScoreDefined() ? this.computeAdjustedImpactScore() : null, this.computeOverallScore());
    };
    return Cvss2ScoringEngine;
}());
exports.Cvss2ScoringEngine = Cvss2ScoringEngine;
