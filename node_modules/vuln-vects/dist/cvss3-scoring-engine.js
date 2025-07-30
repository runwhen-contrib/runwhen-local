"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cvss_scoring_1 = require("./cvss-scoring");
var cvss_score_1 = require("./cvss-score");
var score_validation_error_1 = require("./score-validation-error");
var cvss3_enums_1 = require("./cvss3-enums");
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
var Cvss3ScoringEngine = /** @class */ (function () {
    /**
     * Initializes a new instance of a service offering CVSS v3 vulnerability scoring.
     */
    function Cvss3ScoringEngine() {
        // Base score metrics do not permit undefined values. This is caught in validation.
        this._attackVector = cvss3_enums_1.AttackVector.NOT_DEFINED;
        this._attackComplexity = cvss3_enums_1.AttackComplexity.NOT_DEFINED;
        this._privilegesRequired = cvss3_enums_1.PrivilegesRequired.NOT_DEFINED;
        this._userInteraction = cvss3_enums_1.UserInteraction.NOT_DEFINED;
        this._scope = cvss3_enums_1.Scope.NOT_DEFINED;
        this._confidentialityImpact = cvss3_enums_1.Impact.NOT_DEFINED;
        this._integrityImpact = cvss3_enums_1.Impact.NOT_DEFINED;
        this._availabilityImpact = cvss3_enums_1.Impact.NOT_DEFINED;
        // Temporal score metrics permit undefined values.
        this._exploitCodeMaturity = cvss3_enums_1.ExploitCodeMaturity.NOT_DEFINED;
        this._remediationLevel = cvss3_enums_1.RemediationLevel.NOT_DEFINED;
        this._reportConfidence = cvss3_enums_1.ReportConfidence.NOT_DEFINED;
        // Environmental score metrics also permit undefined values.
        this._modifiedAttackVector = cvss3_enums_1.AttackVector.NOT_DEFINED; // Exploitability modifiers.
        this._modifiedAttackComplexity = cvss3_enums_1.AttackComplexity.NOT_DEFINED;
        this._modifiedPrivilegesRequired = cvss3_enums_1.PrivilegesRequired.NOT_DEFINED;
        this._modifiedUserInteraction = cvss3_enums_1.UserInteraction.NOT_DEFINED;
        this._modifiedScope = cvss3_enums_1.Scope.NOT_DEFINED;
        this._modifiedConfidentialityImpact = cvss3_enums_1.Impact.NOT_DEFINED; // Impact modifiers
        this._modifiedIntegrityImpact = cvss3_enums_1.Impact.NOT_DEFINED;
        this._modifiedAvailabilityImpact = cvss3_enums_1.Impact.NOT_DEFINED;
        this._confidentialityRequirement = cvss3_enums_1.SecurityRequirement.NOT_DEFINED; // Security requirements.
        this._integrityRequirement = cvss3_enums_1.SecurityRequirement.NOT_DEFINED;
        this._availabilityRequirement = cvss3_enums_1.SecurityRequirement.NOT_DEFINED;
    }
    Object.defineProperty(Cvss3ScoringEngine.prototype, "attackVector", {
        /**
         * Gets or sets the attack vector.
         */
        get: function () {
            return this._attackVector;
        },
        set: function (attackVector) {
            this._attackVector = attackVector;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "attackComplexity", {
        /**
         * Gets or sets the attack complexity.
         */
        get: function () {
            return this._attackComplexity;
        },
        set: function (attackComplexity) {
            this._attackComplexity = attackComplexity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "privilegesRequired", {
        /**
         * Gets or sets the Privileges Required.
         */
        get: function () {
            return this._privilegesRequired;
        },
        set: function (privilegesRequired) {
            this._privilegesRequired = privilegesRequired;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "userInteraction", {
        /**
         * Gets or sets the user interaction.
         */
        get: function () {
            return this._userInteraction;
        },
        set: function (userInteraction) {
            this._userInteraction = userInteraction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "scope", {
        /**
         * Gets or sets scope
         */
        get: function () {
            return this._scope;
        },
        set: function (scope) {
            this._scope = scope;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "confidentialityImpact", {
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
    Object.defineProperty(Cvss3ScoringEngine.prototype, "integrityImpact", {
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
    Object.defineProperty(Cvss3ScoringEngine.prototype, "availabilityImpact", {
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
    Object.defineProperty(Cvss3ScoringEngine.prototype, "exploitCodeMaturity", {
        /**
         * Gets or sets the exploit code maturity.
         */
        get: function () {
            return this._exploitCodeMaturity;
        },
        set: function (exploitCodeMaturity) {
            this._exploitCodeMaturity = exploitCodeMaturity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "remediationLevel", {
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
    Object.defineProperty(Cvss3ScoringEngine.prototype, "reportConfidence", {
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
    Object.defineProperty(Cvss3ScoringEngine.prototype, "modifiedAttackVector", {
        /**
     * Gets or sets the modified attack vector.
     */
        get: function () {
            return this._modifiedAttackVector;
        },
        set: function (modifiedAttackVector) {
            this._modifiedAttackVector = modifiedAttackVector;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "modifiedAttackComplexity", {
        /**
         * Gets or sets the modified attack complexity.
         */
        get: function () {
            return this._modifiedAttackComplexity;
        },
        set: function (modifiedAttackComplexity) {
            this._modifiedAttackComplexity = modifiedAttackComplexity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "modifiedPrivilegesRequired", {
        /**
         * Gets or sets the Privileges Required.
         */
        get: function () {
            return this._modifiedPrivilegesRequired;
        },
        set: function (modifiedPrivilegesRequired) {
            this._modifiedPrivilegesRequired = modifiedPrivilegesRequired;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "modifiedUserInteraction", {
        /**
         * Gets or sets the user interaction.
         */
        get: function () {
            return this._modifiedUserInteraction;
        },
        set: function (modifiedUserInteraction) {
            this._modifiedUserInteraction = modifiedUserInteraction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "modifiedScope", {
        /**
         * Gets or sets scope
         */
        get: function () {
            return this._modifiedScope;
        },
        set: function (modifiedScope) {
            this._modifiedScope = modifiedScope;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "modifiedConfidentialityImpact", {
        /**
         * Gets or sets modified confidentiality impact
         */
        get: function () {
            return this._modifiedConfidentialityImpact;
        },
        set: function (modifiedConfidentialityImpact) {
            this._modifiedConfidentialityImpact = modifiedConfidentialityImpact;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "modifiedIntegrityImpact", {
        /**
         * Gets or sets modified integrity impact
         */
        get: function () {
            return this._modifiedIntegrityImpact;
        },
        set: function (modifiedIntegrityImpact) {
            this._modifiedIntegrityImpact = modifiedIntegrityImpact;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "modifiedAvailabilityImpact", {
        /**
         * Gets or sets modified availability impact
         */
        get: function () {
            return this._modifiedAvailabilityImpact;
        },
        set: function (modifiedAvailabilityImpact) {
            this._modifiedAvailabilityImpact = modifiedAvailabilityImpact;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cvss3ScoringEngine.prototype, "confidentialityRequirement", {
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
    Object.defineProperty(Cvss3ScoringEngine.prototype, "integrityRequirement", {
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
    Object.defineProperty(Cvss3ScoringEngine.prototype, "availabilityRequirement", {
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
     * Gets the modified attack vector if defined, otherwise returns the base attack vector.
     *
     * @returns the modified attack vector if defined, otherwise the base attack vector
     */
    Cvss3ScoringEngine.prototype.getModifiedAttackVectorValue = function () {
        return this._modifiedAttackVector === cvss3_enums_1.AttackVector.NOT_DEFINED ?
            this._attackVector : this._modifiedAttackVector;
    };
    /**
     * Gets the modified attack complexity if defined, otherwise returns the base attack complexity.
     *
     * @returns the modified attack complexity if defined, otherwise the base attack complexity
     */
    Cvss3ScoringEngine.prototype.getModifiedAttackComplexityValue = function () {
        return this._modifiedAttackComplexity === cvss3_enums_1.AttackComplexity.NOT_DEFINED ?
            this._attackComplexity : this._modifiedAttackComplexity;
    };
    /**
     * Gets the modified privileges required if defined, otherwise returns the base privileges required.
     *
     * @returns the modified privileges required if defined, otherwise the base privileges required
     */
    Cvss3ScoringEngine.prototype.getModifiedPrivilegesRequiredValue = function () {
        return this._modifiedPrivilegesRequired === cvss3_enums_1.PrivilegesRequired.NOT_DEFINED ?
            this._privilegesRequired : this._modifiedPrivilegesRequired;
    };
    /**
     * Gets the modified user interaction if defined, otherwise returns the base user interaction.
     *
     * @returns the modified user interaction if defined, otherwise the base user interaction
     */
    Cvss3ScoringEngine.prototype.getModifiedUserInteractionValue = function () {
        return this._modifiedUserInteraction === cvss3_enums_1.UserInteraction.NOT_DEFINED ?
            this._userInteraction : this._modifiedUserInteraction;
    };
    /**
     * Gets the modified scope if defined, otherwise returns the base scope.
     *
     * @returns the modified scope if defined, otherwise the base scope
     */
    Cvss3ScoringEngine.prototype.getModifiedScopeValue = function () {
        return this._modifiedScope === cvss3_enums_1.Scope.NOT_DEFINED ?
            this._modifiedScope : this._scope;
    };
    /**
     * Gets the modified confidentiality impact if defined, otherwise returns the base confidentiality impact.
     *
     * @returns the modified confidentiality impact if defined, otherwise the base confidentiality impact
     */
    Cvss3ScoringEngine.prototype.getModifiedConfidentialityImpactValue = function () {
        return this._modifiedConfidentialityImpact === cvss3_enums_1.Impact.NOT_DEFINED ?
            this._confidentialityImpact : this._modifiedConfidentialityImpact;
    };
    /**
     * Gets the modified integrity impact if defined, otherwise returns the base integrity impact.
     *
     * @returns the modified integrity impact if defined, otherwise the base integrity impact
     */
    Cvss3ScoringEngine.prototype.getModifiedIntegrityImpactValue = function () {
        return this._modifiedIntegrityImpact === cvss3_enums_1.Impact.NOT_DEFINED ?
            this._integrityImpact : this._modifiedIntegrityImpact;
    };
    /**
     * Gets the modified availability impact if defined, otherwise returns the base availability impact.
     *
     * @returns the modified availability impact if defined, otherwise the base availability impact
     */
    Cvss3ScoringEngine.prototype.getModifiedAvailabilityImpactValue = function () {
        return this._modifiedAvailabilityImpact === cvss3_enums_1.Impact.NOT_DEFINED ?
            this._availabilityImpact : this._modifiedAvailabilityImpact;
    };
    /**
     * Audits the readiness of this instance to compute a CVSS score.
     *
     * @returns a list of validation errors discovered that must be addressed before score generation
     */
    Cvss3ScoringEngine.prototype.validate = function () {
        // Build a collection of errors.
        var scoreValidationErrors = [];
        // Exploitability metrics are not allowed to be undefined.
        if (this._attackVector === cvss3_enums_1.AttackVector.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("Attack vector cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        if (this._attackComplexity === cvss3_enums_1.AttackComplexity.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("Attack complexity cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        if (this._privilegesRequired === cvss3_enums_1.PrivilegesRequired.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("Privileges Required cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        if (this._userInteraction === cvss3_enums_1.UserInteraction.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("User Interaction cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        if (this._scope === cvss3_enums_1.Scope.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("Scope cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        // Impact3 metrics are not allowed to be undefined.
        if (this._confidentialityImpact === cvss3_enums_1.Impact.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("Confidentiality impact cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        if (this._integrityImpact === cvss3_enums_1.Impact.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("Integrity impact cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        if (this._availabilityImpact === cvss3_enums_1.Impact.NOT_DEFINED) {
            scoreValidationErrors.push(new score_validation_error_1.ScoreValidationError("Availability impact cannot be undefined in CVSS v3 scores. Ensure you have set it."));
        }
        // Return errors.
        return scoreValidationErrors;
    };
    /**
     * Validates that this instance is ready to compute a CVSS score.
     *
     * @returns true if this instance is ready to compute a CVSS score, otherwise false
     */
    Cvss3ScoringEngine.prototype.isValid = function () {
        return this.validate().length == 0;
    };
    /**
     * Converts an {@link Impact} enum value to a number for use in calculations.
     *
     * @param impact the enum value to convert
     */
    Cvss3ScoringEngine.renderImpact = function (impact) {
        switch (impact) {
            case cvss3_enums_1.Impact.NONE:
                return 0;
            case cvss3_enums_1.Impact.LOW:
                return 0.22;
            case cvss3_enums_1.Impact.HIGH:
                return 0.56;
        }
        return 0; // Never returned.
    };
    /**
     * Computes the base impact subscore (called ISC_Base) in the specification.
     *
     * @returns the base impact subscore
     */
    Cvss3ScoringEngine.prototype.computeBaseImpactSubscore = function () {
        // Render impacts to numeric scores.
        var confidentialityImpact = Cvss3ScoringEngine.renderImpact(this._confidentialityImpact);
        var integrityImpact = Cvss3ScoringEngine.renderImpact(this._integrityImpact);
        var availabilityImpact = Cvss3ScoringEngine.renderImpact(this._availabilityImpact);
        // Compute and return the base impact subscore (called ISC_Base) in the specification.
        return 1 - ((1 - confidentialityImpact) * (1 - integrityImpact) * (1 - availabilityImpact));
    };
    /**
     * Computes the impact subscore (called ISC in the specification).
     *
     * @returns the impact subscore
     */
    Cvss3ScoringEngine.prototype.computeImpactSubscore = function () {
        // Gets the impact subscore.
        var baseImpactSubscore = this.computeBaseImpactSubscore();
        // Compute and return the impact subscore (called ISC in the specification).
        if (this._scope === cvss3_enums_1.Scope.UNCHANGED) {
            return 6.42 * baseImpactSubscore;
        }
        return 7.52 * (baseImpactSubscore - 0.029) - 3.25 * Math.pow(baseImpactSubscore - 0.02, 15);
    };
    /**
     * Converts an {@link AttackVector} enum value to a number for use in calculations.
     *
     * @param attackVector the enum value to convert
     */
    Cvss3ScoringEngine.renderAttackVector = function (attackVector) {
        switch (attackVector) {
            case cvss3_enums_1.AttackVector.NETWORK:
                return 0.85;
            case cvss3_enums_1.AttackVector.ADJACENT_NETWORK:
                return 0.62;
            case cvss3_enums_1.AttackVector.LOCAL:
                return 0.55;
            case cvss3_enums_1.AttackVector.PHYSICAL:
                return 0.2;
        }
        return 0; // Never returned.
    };
    /**
     * Converts an {@link AttackComplexity} enum value to a number for use in calculations.
     *
     * @param attackComplexity the enum value to convert
     */
    Cvss3ScoringEngine.renderAttackComplexity = function (attackComplexity) {
        switch (attackComplexity) {
            case cvss3_enums_1.AttackComplexity.LOW:
                return 0.77;
            case cvss3_enums_1.AttackComplexity.HIGH:
                return 0.44;
        }
        return 0; // Never returned.
    };
    /**
     * Converts a {@link PrivilegesRequired} enum value to a number for use in calculations.
     *
     * @param privilegesRequired the enum value to convert
     */
    Cvss3ScoringEngine.renderPrivilegesRequired = function (privilegesRequired, scope) {
        switch (privilegesRequired) {
            case cvss3_enums_1.PrivilegesRequired.NONE:
                return 0.85;
            case cvss3_enums_1.PrivilegesRequired.LOW:
                return scope === cvss3_enums_1.Scope.UNCHANGED ? 0.62 : 0.68;
            case cvss3_enums_1.PrivilegesRequired.HIGH:
                return scope === cvss3_enums_1.Scope.UNCHANGED ? 0.27 : 0.5;
        }
        return 0; // Never returned.
    };
    /**
     * Converts a {@link UserInteraction} enum value to a number for use in calculations.
     *
     * @param UserInteraction the enum value to convert
     */
    Cvss3ScoringEngine.renderUserInteraction = function (userInteraction) {
        switch (userInteraction) {
            case cvss3_enums_1.UserInteraction.NONE:
                return 0.85;
            case cvss3_enums_1.UserInteraction.REQUIRED:
                return 0.62;
        }
        return 0; // Never Returned.
    };
    /**
     * Computes the exploitability subscore.
     *
     * @returns the exploitability subscore
     */
    Cvss3ScoringEngine.prototype.computeExploitabilitySubscore = function () {
        // Render exploitabilities to numeric scores.
        var attackVector = Cvss3ScoringEngine.renderAttackVector(this._attackVector);
        var attackComplexity = Cvss3ScoringEngine.renderAttackComplexity(this._attackComplexity);
        var privilegesRequired = Cvss3ScoringEngine.renderPrivilegesRequired(this._privilegesRequired, this._scope);
        var userInteraction = Cvss3ScoringEngine.renderUserInteraction(this._userInteraction);
        // Compute and return overall exploitability score.
        var exploitability = 8.22 * attackVector * attackComplexity * privilegesRequired * userInteraction;
        return exploitability;
    };
    /**
     * Computes the base score.
     *
     * @returns the base score
     */
    Cvss3ScoringEngine.prototype.computeBaseScore = function () {
        // Compute relevant subscores.
        var impactSubscore = this.computeImpactSubscore();
        var exploitability = this.computeExploitabilitySubscore();
        // Compute and return base score.
        if (impactSubscore <= 0) {
            return 0;
        }
        var modifier = this._scope === cvss3_enums_1.Scope.UNCHANGED ? 1 : 1.08;
        return cvss_scoring_1.roundUp(Math.min(modifier * (impactSubscore + exploitability), 10));
    };
    /**
     * Converts an {@link ExploitCodeMaturity} enum value to a number for use in calculations.
     *
     * @param exploitCodeMaturity the enum value to convert
     */
    Cvss3ScoringEngine.renderExploitCodeMaturity = function (exploitCodeMaturity) {
        switch (exploitCodeMaturity) {
            case cvss3_enums_1.ExploitCodeMaturity.UNPROVEN_THAT_EXPLOIT_EXISTS:
                return 0.91;
            case cvss3_enums_1.ExploitCodeMaturity.PROOF_OF_CONCEPT_CODE:
                return 0.94;
            case cvss3_enums_1.ExploitCodeMaturity.FUNCTIONAL_EXPLOIT_EXISTS:
                return 0.97;
            case cvss3_enums_1.ExploitCodeMaturity.HIGH:
            case cvss3_enums_1.ExploitCodeMaturity.NOT_DEFINED:
                return 1;
        }
    };
    /**
     * Converts a {@link RemediationLevel} enum value to a number for use in calculations.
     *
     * @param remediationLevel the enum value to convert
     */
    Cvss3ScoringEngine.renderRemediationLevel = function (remediationLevel) {
        switch (remediationLevel) {
            case cvss3_enums_1.RemediationLevel.OFFICIAL_FIX:
                return 0.95;
            case cvss3_enums_1.RemediationLevel.TEMPORARY_FIX:
                return 0.96;
            case cvss3_enums_1.RemediationLevel.WORKAROUND:
                return 0.97;
            case cvss3_enums_1.RemediationLevel.UNAVAILABLE:
            case cvss3_enums_1.RemediationLevel.NOT_DEFINED:
                return 1;
        }
    };
    /**
     * Converts a {@link ReportConfidence} enum value to a number for use in calculations.
     *
     * @param reportConfidence the enum value to convert
     */
    Cvss3ScoringEngine.renderReportConfidence = function (reportConfidence) {
        switch (reportConfidence) {
            case cvss3_enums_1.ReportConfidence.REASONABLE:
                return 0.96;
            case cvss3_enums_1.ReportConfidence.UNKNOWN:
                return 0.92;
            case cvss3_enums_1.ReportConfidence.CONFIRMED:
            case cvss3_enums_1.ReportConfidence.NOT_DEFINED:
                return 1;
        }
    };
    /**
     * Computes the temporal score.
     *
     * @returns the temporal score
     */
    Cvss3ScoringEngine.prototype.computeTemporalScore = function () {
        // Compute base score.
        var baseScore = this.computeBaseScore();
        // Compute relevant subscores.
        var exploitCodeMaturity = Cvss3ScoringEngine.renderExploitCodeMaturity(this._exploitCodeMaturity);
        var remediationLevel = Cvss3ScoringEngine.renderRemediationLevel(this._remediationLevel);
        var reportConfidence = Cvss3ScoringEngine.renderReportConfidence(this._reportConfidence);
        // Compute and return temporal score.
        var temporalScore = cvss_scoring_1.roundUp(baseScore * exploitCodeMaturity * remediationLevel * reportConfidence);
        return temporalScore;
    };
    /**
     * Converts a {@link SecurityRequirement} enum value to a number for use in calculations.
     *
     * @param securityRequirement the enum value to convert
     */
    Cvss3ScoringEngine.renderSecurityRequirement = function (securityRequirement) {
        switch (securityRequirement) {
            case cvss3_enums_1.SecurityRequirement.LOW:
                return 0.5;
            case cvss3_enums_1.SecurityRequirement.MEDIUM:
            case cvss3_enums_1.SecurityRequirement.NOT_DEFINED:
                return 1;
            case cvss3_enums_1.SecurityRequirement.HIGH:
                return 1.5;
        }
    };
    /**
     * Computes the value defined in the specification as ISC_Modified.
     *
     * @returns the value defined in the specification as ISC_Modified.
     */
    Cvss3ScoringEngine.prototype.computeIscModified = function () {
        // Compute relevant modified subscores.
        var modifiedConfidentialityImpact = Cvss3ScoringEngine.renderImpact(this.getModifiedConfidentialityImpactValue());
        var modifiedIntegrityImpact = Cvss3ScoringEngine.renderImpact(this.getModifiedIntegrityImpactValue());
        var modifiedAvailabilityImpact = Cvss3ScoringEngine.renderImpact(this.getModifiedAvailabilityImpactValue());
        // Compute impact requirement subscores.
        var confidenialityRequirement = Cvss3ScoringEngine.renderSecurityRequirement(this._confidentialityRequirement);
        var integrityRequirement = Cvss3ScoringEngine.renderSecurityRequirement(this._integrityRequirement);
        var availabilityRequirement = Cvss3ScoringEngine.renderSecurityRequirement(this._availabilityRequirement);
        // Compute and return ISC_Modified.
        var productOfComplements = (1 - modifiedConfidentialityImpact * confidenialityRequirement)
            * (1 - modifiedIntegrityImpact * integrityRequirement)
            * (1 - modifiedAvailabilityImpact * availabilityRequirement);
        return Math.min(1 - productOfComplements, 0.915);
    };
    /**
     * Computes the modified impact subscore.
     *
     * @returns the modified impact subscore.
     */
    Cvss3ScoringEngine.prototype.computeModifiedImpactSubscore = function () {
        // Compute ISC_Modified.
        var iscModified = this.computeIscModified();
        // Compute modified impact subscore.
        if (this._modifiedScope === cvss3_enums_1.Scope.UNCHANGED) {
            return 6.42 * iscModified;
        }
        return 7.52 * (iscModified - 0.029) - 3.25 * Math.pow(iscModified - 0.02, 15);
    };
    /**
     * Computes the modified exploitability subscore.
     *
     * @returns the modified exploitability subscore
     */
    Cvss3ScoringEngine.prototype.computeModifiedExploitabilitySubscore = function () {
        // Compute relevant modified values.
        var modifiedAttackVector = Cvss3ScoringEngine.renderAttackVector(this.getModifiedAttackVectorValue());
        var modifiedAttackComplexity = Cvss3ScoringEngine.renderAttackComplexity(this.getModifiedAttackComplexityValue());
        var modifiedPrivilegesRequired = Cvss3ScoringEngine.renderPrivilegesRequired(this.getModifiedPrivilegesRequiredValue(), this.getModifiedScopeValue());
        var modifiedUserInteraction = Cvss3ScoringEngine.renderUserInteraction(this.getModifiedUserInteractionValue());
        return 8.22 * modifiedAttackVector * modifiedAttackComplexity * modifiedPrivilegesRequired * modifiedUserInteraction;
    };
    /**
     * Computes the environmental score.
     *
     * @returns the Environmental score.
     */
    Cvss3ScoringEngine.prototype.computeEnvironmentalScore = function () {
        // Get all required subscores and values.
        var modifiedImpactSubscore = this.computeModifiedImpactSubscore();
        var modifiedExploitabilitySubscore = this.computeModifiedExploitabilitySubscore();
        var exploitCodeMaturity = Cvss3ScoringEngine.renderExploitCodeMaturity(this._exploitCodeMaturity);
        var remediationLevel = Cvss3ScoringEngine.renderRemediationLevel(this._remediationLevel);
        var reportConfidence = Cvss3ScoringEngine.renderReportConfidence(this._reportConfidence);
        var modifiedScope = this._modifiedScope == cvss3_enums_1.Scope.NOT_DEFINED ? this._scope : this._modifiedScope;
        // Compute and return the environmental score.
        if (modifiedImpactSubscore <= 0) {
            return 0;
        }
        var modifier = modifiedScope === cvss3_enums_1.Scope.UNCHANGED ? 1 : 1.08;
        return cvss_scoring_1.roundUp(cvss_scoring_1.roundUp(Math.min(modifier
            * (modifiedImpactSubscore + modifiedExploitabilitySubscore), 10))
            * exploitCodeMaturity
            * remediationLevel
            * reportConfidence);
    };
    /**
     * Gets whether or not a temporal score is defined.
     *
     * @returns true if a temporal score is defined, otherwise false
     */
    Cvss3ScoringEngine.prototype.isTemporalScoreDefined = function () {
        return (this._exploitCodeMaturity != cvss3_enums_1.ExploitCodeMaturity.NOT_DEFINED)
            || (this._remediationLevel != cvss3_enums_1.RemediationLevel.NOT_DEFINED)
            || (this._reportConfidence != cvss3_enums_1.ReportConfidence.NOT_DEFINED);
    };
    /**
     * Gets whether or not an environmental score is defined.
     *
     * @returns true if an environmental score is defined, otherwise false
     */
    Cvss3ScoringEngine.prototype.isEnvironmentalScoreDefined = function () {
        return (this._modifiedAttackVector != cvss3_enums_1.AttackVector.NOT_DEFINED)
            || (this._modifiedAttackComplexity != cvss3_enums_1.AttackComplexity.NOT_DEFINED)
            || (this._modifiedPrivilegesRequired != cvss3_enums_1.PrivilegesRequired.NOT_DEFINED)
            || (this._modifiedUserInteraction != cvss3_enums_1.UserInteraction.NOT_DEFINED)
            || (this._modifiedScope != cvss3_enums_1.Scope.NOT_DEFINED)
            || (this._modifiedConfidentialityImpact != cvss3_enums_1.Impact.NOT_DEFINED)
            || (this._modifiedIntegrityImpact != cvss3_enums_1.Impact.NOT_DEFINED)
            || (this._modifiedAvailabilityImpact != cvss3_enums_1.Impact.NOT_DEFINED)
            || (this._confidentialityRequirement != cvss3_enums_1.SecurityRequirement.NOT_DEFINED)
            || (this._integrityRequirement != cvss3_enums_1.SecurityRequirement.NOT_DEFINED)
            || (this._availabilityRequirement != cvss3_enums_1.SecurityRequirement.NOT_DEFINED);
    };
    /**
     * Computes the overall score.
     *
     * @returns the overall score
     */
    Cvss3ScoringEngine.prototype.computeOverallScore = function () {
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
     * Computes the CVSS score set under the current configuration.
     *
     * @returns the computed CVSS score set
     */
    Cvss3ScoringEngine.prototype.computeScore = function () {
        // Do not proceed if there are validation errors.
        if (!this.isValid()) {
            throw new RangeError("The CVSS v3 scoring engine is not fully configured. Run the validate() function. to "
                + "check for validation errors.");
        }
        // Return computed score set.
        return new cvss_score_1.CvssScore(this.computeBaseScore(), this.computeImpactSubscore(), this.computeExploitabilitySubscore(), this.isTemporalScoreDefined() ? this.computeTemporalScore() : null, // These fields are not always defined.
        this.isEnvironmentalScoreDefined() ? this.computeEnvironmentalScore() : null, this.isEnvironmentalScoreDefined() ? this.computeModifiedImpactSubscore() : null, this.computeOverallScore());
    };
    return Cvss3ScoringEngine;
}());
exports.Cvss3ScoringEngine = Cvss3ScoringEngine;
