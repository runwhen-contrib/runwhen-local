"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cvss2_enums_1 = require("./cvss2-enums");
/**
 * Represents a prefixing option for CVSS v2 vectors.
 *
 * @public
 */
var Cvss2VectorPrefixOption;
(function (Cvss2VectorPrefixOption) {
    /**
     * Represents no prefixing option (i.e. a bare vector).
     */
    Cvss2VectorPrefixOption[Cvss2VectorPrefixOption["NONE"] = 0] = "NONE";
    /**
     * Represents a bracketed prefixing option (i.e. a vector in parentheses).
     */
    Cvss2VectorPrefixOption[Cvss2VectorPrefixOption["BRACKETED"] = 1] = "BRACKETED";
    /**
     * Represents a versioned prefixing option (i.e. a 'CVSS2#' prefix).
     */
    Cvss2VectorPrefixOption[Cvss2VectorPrefixOption["VERSION"] = 2] = "VERSION";
})(Cvss2VectorPrefixOption = exports.Cvss2VectorPrefixOption || (exports.Cvss2VectorPrefixOption = {}));
/**
 * Represents a service that supports rendering the state of CVSS v2 scoring engines as CVSS vector strings.
 *
 * @public
 * @see Cvss2ScoringEngine
 */
var Cvss2VectorRenderer = /** @class */ (function () {
    /**
     * Initializes a new instance of a service that supports rendering the state of CVSS v2 scoring engines as CVSS
     * vector strings.
     *
     * @param prefixOption the prefixing option active for this renderer
     */
    function Cvss2VectorRenderer(prefixOption) {
        this._prefixOption = prefixOption;
    }
    Object.defineProperty(Cvss2VectorRenderer.prototype, "prefixOption", {
        /**
         * Gets or sets the prefixing option active for this renderer.
         */
        get: function () {
            return this._prefixOption;
        },
        set: function (prefixOption) {
            this._prefixOption = prefixOption;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Converts an access vector enum value into its string representation.
     *
     * @param accessVector the enum value to convert
     * @returns the converted string
     */
    Cvss2VectorRenderer.renderAccessVector = function (accessVector) {
        switch (accessVector) {
            case cvss2_enums_1.AccessVector.LOCAL:
                return 'L';
            case cvss2_enums_1.AccessVector.NETWORK:
                return 'N';
            case cvss2_enums_1.AccessVector.ADJACENT_NETWORK:
                return 'A';
        }
        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected access vector value during vector rendering.');
    };
    /**
     * Converts an access complexity enum value into its string representation.
     *
     * @param accessComplexity the enum value to convert
     * @returns the converted string
     */
    Cvss2VectorRenderer.renderAccessComplexity = function (accessComplexity) {
        switch (accessComplexity) {
            case cvss2_enums_1.AccessComplexity.HIGH:
                return 'H';
            case cvss2_enums_1.AccessComplexity.MEDIUM:
                return 'M';
            case cvss2_enums_1.AccessComplexity.LOW:
                return 'L';
        }
        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected access complexity value during vector rendering.');
    };
    /**
     * Converts an authentication enum value into its string representation.
     *
     * @param authentication the enum value to convert
     * @returns the converted string
     */
    Cvss2VectorRenderer.renderAuthentication = function (authentication) {
        switch (authentication) {
            case cvss2_enums_1.Authentication.MULTIPLE:
                return 'M';
            case cvss2_enums_1.Authentication.SINGLE:
                return 'S';
            case cvss2_enums_1.Authentication.NONE:
                return 'N';
        }
        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected authentication value during vector rendering.');
    };
    /**
     * Converts an impact enum value into its string representation.
     *
     * @param impact the enum value to convert
     * @returns the converted string
     */
    Cvss2VectorRenderer.renderImpact = function (impact) {
        switch (impact) {
            case cvss2_enums_1.Impact.NONE:
                return 'N';
            case cvss2_enums_1.Impact.PARTIAL:
                return 'P';
            case cvss2_enums_1.Impact.COMPLETE:
                return 'C';
        }
        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected impact value during vector rendering.');
    };
    /**
     * Converts an exploitability enum value into its string representation.
     *
     * @param exploitability the enum value to convert
     * @returns the converted string
     */
    Cvss2VectorRenderer.renderExploitability = function (exploitability) {
        switch (exploitability) {
            case cvss2_enums_1.Exploitability.NOT_DEFINED:
                return "ND";
            case cvss2_enums_1.Exploitability.UNPROVEN_THAT_EXPLOIT_EXISTS:
                return "U";
            case cvss2_enums_1.Exploitability.PROOF_OF_CONCEPT_CODE:
                return "POC";
            case cvss2_enums_1.Exploitability.FUNCTIONAL_EXPLOIT_EXISTS:
                return "F";
            case cvss2_enums_1.Exploitability.HIGH:
                return "H";
        }
    };
    /**
     * Converts a remediation level enum value into its string representation.
     *
     * @param remediationLevel the enum value to convert
     * @returns the converted string
     */
    Cvss2VectorRenderer.renderRemediationLevel = function (remediationLevel) {
        switch (remediationLevel) {
            case cvss2_enums_1.RemediationLevel.NOT_DEFINED:
                return "ND";
            case cvss2_enums_1.RemediationLevel.OFFICIAL_FIX:
                return "OF";
            case cvss2_enums_1.RemediationLevel.TEMPORARY_FIX:
                return "TF";
            case cvss2_enums_1.RemediationLevel.WORKAROUND:
                return "W";
            case cvss2_enums_1.RemediationLevel.UNAVAILABLE:
                return "U";
        }
    };
    /**
     * Converts a report confidence enum value into its string representation.
     *
     * @param reportConfidence the enum value to convert
     * @returns the converted string
     */
    Cvss2VectorRenderer.renderReportConfidence = function (reportConfidence) {
        switch (reportConfidence) {
            case cvss2_enums_1.ReportConfidence.NOT_DEFINED:
                return "ND";
            case cvss2_enums_1.ReportConfidence.UNCONFIRMED:
                return "UC";
            case cvss2_enums_1.ReportConfidence.UNCORROBORATED:
                return "UR";
            case cvss2_enums_1.ReportConfidence.CONFIRMED:
                return "C";
        }
    };
    /**
     * Converts a collateral damage potential enum value into its string representation.
     *
     * @param collateralDamagePotential the enum value to convert
     * @returns the converted string
     */
    Cvss2VectorRenderer.renderCollateralDamagePotential = function (collateralDamagePotential) {
        switch (collateralDamagePotential) {
            case cvss2_enums_1.CollateralDamagePotential.NOT_DEFINED:
                return "ND";
            case cvss2_enums_1.CollateralDamagePotential.NONE:
                return "N";
            case cvss2_enums_1.CollateralDamagePotential.LOW:
                return "L";
            case cvss2_enums_1.CollateralDamagePotential.LOW_MEDIUM:
                return "LM";
            case cvss2_enums_1.CollateralDamagePotential.MEDIUM_HIGH:
                return "MH";
            case cvss2_enums_1.CollateralDamagePotential.HIGH:
                return "H";
        }
    };
    /**
     * Converts a target distribution enum value into its string representation.
     *
     * @param targetDistribution the enum value to convert
     * @returns the converted string
     */
    Cvss2VectorRenderer.renderTargetDistribution = function (targetDistribution) {
        switch (targetDistribution) {
            case cvss2_enums_1.TargetDistribution.NOT_DEFINED:
                return "ND";
            case cvss2_enums_1.TargetDistribution.NONE:
                return "N";
            case cvss2_enums_1.TargetDistribution.LOW:
                return "L";
            case cvss2_enums_1.TargetDistribution.MEDIUM:
                return "M";
            case cvss2_enums_1.TargetDistribution.HIGH:
                return "H";
        }
    };
    /**
     * Converts an impact subscore enum value into its string representation.
     *
     * @param impactSubscore the enum value to convert
     * @returns the converted string
     */
    Cvss2VectorRenderer.renderImpactSubscore = function (impactSubscore) {
        switch (impactSubscore) {
            case cvss2_enums_1.ImpactSubscore.NOT_DEFINED:
                return "ND";
            case cvss2_enums_1.ImpactSubscore.LOW:
                return "L";
            case cvss2_enums_1.ImpactSubscore.MEDIUM:
                return "M";
            case cvss2_enums_1.ImpactSubscore.HIGH:
                return "H";
        }
    };
    /**
     * Renders the state of a CVSS v2 scoring engine as a CVSS vector.
     *
     * @param scoringEngine the scoring engine to render the state of
     * @returns the resulting CVSS vector
     */
    Cvss2VectorRenderer.prototype.render = function (scoringEngine) {
        // Do not allow rendering of invalid vectors.
        if (!scoringEngine.isValid()) {
            throw new RangeError("Cannot render a vector for a CVSS v2 scoring engine that does not validate.");
        }
        // Base metrics must be included
        var vector = [];
        vector.push('AV:' + Cvss2VectorRenderer.renderAccessVector(scoringEngine.accessVector));
        vector.push('AC:' + Cvss2VectorRenderer.renderAccessComplexity(scoringEngine.accessComplexity));
        vector.push('Au:' + Cvss2VectorRenderer.renderAuthentication(scoringEngine.authentication));
        vector.push('C:' + Cvss2VectorRenderer.renderImpact(scoringEngine.confidentialityImpact));
        vector.push('I:' + Cvss2VectorRenderer.renderImpact(scoringEngine.integrityImpact));
        vector.push('A:' + Cvss2VectorRenderer.renderImpact(scoringEngine.availabilityImpact));
        // If present, include temporal metrics.
        if (scoringEngine.isTemporalScoreDefined()) {
            vector.push('E:' + Cvss2VectorRenderer.renderExploitability(scoringEngine.exploitability));
            vector.push('RL:' + Cvss2VectorRenderer.renderRemediationLevel(scoringEngine.remediationLevel));
            vector.push('RC:' + Cvss2VectorRenderer.renderReportConfidence(scoringEngine.reportConfidence));
        }
        // If present, include environmental metrics.
        if (scoringEngine.isEnvironmentalScoreDefined()) {
            vector.push('CDP:'
                + Cvss2VectorRenderer.renderCollateralDamagePotential(scoringEngine.collateralDamagePotential));
            vector.push('TD:' + Cvss2VectorRenderer.renderTargetDistribution(scoringEngine.targetDistribution));
            vector.push('CR:' + Cvss2VectorRenderer.renderImpactSubscore(scoringEngine.confidentialityRequirement));
            vector.push('IR:' + Cvss2VectorRenderer.renderImpactSubscore(scoringEngine.integrityRequirement));
            vector.push('AR:' + Cvss2VectorRenderer.renderImpactSubscore(scoringEngine.availabilityRequirement));
        }
        // Join vector together with forward slashes.
        var vectorString = vector.join('/');
        // Apply prefix options.
        switch (this._prefixOption) {
            case Cvss2VectorPrefixOption.VERSION:
                return 'CVSS2#' + vectorString;
            case Cvss2VectorPrefixOption.BRACKETED:
                return '(' + vectorString + ')';
        }
        // Prefix option is none.
        return vectorString;
    };
    return Cvss2VectorRenderer;
}());
exports.Cvss2VectorRenderer = Cvss2VectorRenderer;
