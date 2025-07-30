"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cvss3_enums_1 = require("./cvss3-enums");
/**
 * Represents a prefixing option for CVSS v3.x vectors.
 *
 * @public
 */
var Cvss3VectorPrefixOption;
(function (Cvss3VectorPrefixOption) {
    /**
     * Represents no prefixing option (i.e. a bare vector).
     */
    Cvss3VectorPrefixOption[Cvss3VectorPrefixOption["NONE"] = 0] = "NONE";
    /**
     * Represents a CVSS v3.0 prefixing option (i.e. a 'CVSS:3.0/' prefix).
     */
    Cvss3VectorPrefixOption[Cvss3VectorPrefixOption["VERSION_3_0"] = 1] = "VERSION_3_0";
    /**
     * Represents a CVSS v3.1 prefixing option (i.e. a 'CVSS:3.0/' prefix).
     */
    Cvss3VectorPrefixOption[Cvss3VectorPrefixOption["VERSION_3_1"] = 2] = "VERSION_3_1";
})(Cvss3VectorPrefixOption = exports.Cvss3VectorPrefixOption || (exports.Cvss3VectorPrefixOption = {}));
/**
 * Represents a service that supports rendering the state of CVSS v3.x scoring engines as CVSS vector strings.
 *
 * @public
 * @see Cvss3ScoringEngine
 */
var Cvss3VectorRenderer = /** @class */ (function () {
    /**
     * Initializes a new instance of a service that supports rendering the state of CVSS v3.x scoring engines as CVSS
     * vector strings.
     *
     * @param prefixOption the prefixing option active for this renderer
     */
    function Cvss3VectorRenderer(prefixOption) {
        this._prefixOption = prefixOption;
    }
    Object.defineProperty(Cvss3VectorRenderer.prototype, "prefixOption", {
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
     * Converts an attack vector enum value into its string representation.
     *
     * @param attackVector the enum value to convert
     * @returns the converted string
     */
    Cvss3VectorRenderer.renderAttackVector = function (attackVector) {
        switch (attackVector) {
            case cvss3_enums_1.AttackVector.LOCAL:
                return 'L';
            case cvss3_enums_1.AttackVector.ADJACENT_NETWORK:
                return 'A';
            case cvss3_enums_1.AttackVector.NETWORK:
                return 'N';
            case cvss3_enums_1.AttackVector.PHYSICAL:
                return 'P';
        }
        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected attack vector value during vector rendering.');
    };
    /**
     * Converts an attack complexity enum value into its string representation.
     *
     * @param attackComplexity the enum value to convert
     * @returns the converted string
     */
    Cvss3VectorRenderer.renderAttackComplexity = function (attackComplexity) {
        switch (attackComplexity) {
            case cvss3_enums_1.AttackComplexity.HIGH:
                return 'H';
            case cvss3_enums_1.AttackComplexity.LOW:
                return 'L';
        }
        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected access complexity value during vector rendering.');
    };
    /**
     * Converts a privileges required enum value into its string representation.
     *
     * @param privilegesRequired the enum value to convert
     * @returns the converted string
     */
    Cvss3VectorRenderer.renderPrivilegesRequired = function (privilegesRequired) {
        switch (privilegesRequired) {
            case cvss3_enums_1.PrivilegesRequired.NOT_DEFINED:
                return 'X';
            case cvss3_enums_1.PrivilegesRequired.HIGH:
                return 'H';
            case cvss3_enums_1.PrivilegesRequired.LOW:
                return 'L';
            case cvss3_enums_1.PrivilegesRequired.NONE:
                return 'N';
        }
        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected privileges required value during vector rendering.');
    };
    /**
     * Converts a user interaction enum value into its string representation.
     *
     * @param userInteraction the enum value to convert
     * @returns the converted string
     */
    Cvss3VectorRenderer.renderUserInteraction = function (userInteraction) {
        switch (userInteraction) {
            case cvss3_enums_1.UserInteraction.REQUIRED:
                return 'R';
            case cvss3_enums_1.UserInteraction.NONE:
                return 'N';
        }
        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected user interaction value during vector rendering.');
    };
    /**
     * Converts a scope enum value into its string representation.
     *
     * @param scope the enum value to convert
     * @returns the converted string
     */
    Cvss3VectorRenderer.renderScope = function (scope) {
        switch (scope) {
            case cvss3_enums_1.Scope.CHANGED:
                return "C";
            case cvss3_enums_1.Scope.UNCHANGED:
                return "U";
        }
        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected user interaction value during vector rendering.');
    };
    /**
     * Converts an impact enum value into its string representation.
     *
     * @param impact the enum value to convert
     * @returns the converted string
     */
    Cvss3VectorRenderer.renderImpact = function (impact) {
        switch (impact) {
            case cvss3_enums_1.Impact.NONE:
                return "N";
            case cvss3_enums_1.Impact.LOW:
                return "L";
            case cvss3_enums_1.Impact.HIGH:
                return "H";
        }
        // Should never happen thanks to validation before call.
        throw new RangeError('Encountered unexpected user interaction value during vector rendering.');
    };
    /**
     * Converts a exploit code maturity enum value into its string representation.
     *
     * @param exploitCodeMaturity the enum value to convert
     * @returns the converted string
     */
    Cvss3VectorRenderer.renderExploitCodeMaturity = function (exploitCodeMaturity) {
        switch (exploitCodeMaturity) {
            case cvss3_enums_1.ExploitCodeMaturity.NOT_DEFINED:
                return "X";
            case cvss3_enums_1.ExploitCodeMaturity.UNPROVEN_THAT_EXPLOIT_EXISTS:
                return "U";
            case cvss3_enums_1.ExploitCodeMaturity.PROOF_OF_CONCEPT_CODE:
                return "P";
            case cvss3_enums_1.ExploitCodeMaturity.FUNCTIONAL_EXPLOIT_EXISTS:
                return "F";
            case cvss3_enums_1.ExploitCodeMaturity.HIGH:
                return "H";
        }
    };
    /**
     * Converts a remediation level enum value into its string representation.
     *
     * @param remediationLevel the enum value to convert
     * @returns the converted string
     */
    Cvss3VectorRenderer.renderRemediationLevel = function (remediationLevel) {
        switch (remediationLevel) {
            case cvss3_enums_1.RemediationLevel.NOT_DEFINED:
                return "X";
            case cvss3_enums_1.RemediationLevel.OFFICIAL_FIX:
                return "O";
            case cvss3_enums_1.RemediationLevel.TEMPORARY_FIX:
                return "T";
            case cvss3_enums_1.RemediationLevel.WORKAROUND:
                return "W";
            case cvss3_enums_1.RemediationLevel.UNAVAILABLE:
                return "U";
        }
    };
    /**
     * Converts a report confidence enum value into its string representation.
     *
     * @param reportConfidence the enum value to convert
     * @returns the converted string
     */
    Cvss3VectorRenderer.renderReportConfidence = function (reportConfidence) {
        switch (reportConfidence) {
            case cvss3_enums_1.ReportConfidence.NOT_DEFINED:
                return "X";
            case cvss3_enums_1.ReportConfidence.UNKNOWN:
                return "U";
            case cvss3_enums_1.ReportConfidence.REASONABLE:
                return "R";
            case cvss3_enums_1.ReportConfidence.CONFIRMED:
                return "C";
        }
    };
    /**
     * Converts a security requirement enum value into its string representation.
     *
     * @param securityRequirement the enum value to convert
     * @returns the converted string
     */
    Cvss3VectorRenderer.renderSecurityRequirement = function (securityRequirement) {
        switch (securityRequirement) {
            case cvss3_enums_1.SecurityRequirement.NOT_DEFINED:
                return "X";
            case cvss3_enums_1.SecurityRequirement.LOW:
                return "L";
            case cvss3_enums_1.SecurityRequirement.MEDIUM:
                return "M";
            case cvss3_enums_1.SecurityRequirement.HIGH:
                return "H";
        }
    };
    /**
     * Renders the state of a CVSS v3.x scoring engine as a CVSS vector.
     *
     * @param scoringEngine the scoring engine to render the state of
     * @returns the resulting CVSS vector
     */
    Cvss3VectorRenderer.prototype.render = function (scoringEngine) {
        // Do not allow rendering of invalid vectors.
        if (!scoringEngine.isValid()) {
            throw new RangeError("Cannot render a vector for a CVSS v2 scoring engine that does not validate.");
        }
        // Base metrics must be included
        var vector = [];
        vector.push('AV:' + Cvss3VectorRenderer.renderAttackVector(scoringEngine.attackVector));
        vector.push('AC:' + Cvss3VectorRenderer.renderAttackComplexity(scoringEngine.attackComplexity));
        vector.push('PR:' + Cvss3VectorRenderer.renderPrivilegesRequired(scoringEngine.privilegesRequired));
        vector.push('UI:' + Cvss3VectorRenderer.renderUserInteraction(scoringEngine.userInteraction));
        vector.push('S:' + Cvss3VectorRenderer.renderScope(scoringEngine.scope));
        vector.push('C:' + Cvss3VectorRenderer.renderImpact(scoringEngine.confidentialityImpact));
        vector.push('I:' + Cvss3VectorRenderer.renderImpact(scoringEngine.integrityImpact));
        vector.push('A:' + Cvss3VectorRenderer.renderImpact(scoringEngine.availabilityImpact));
        // If present, include temporal metrics.
        if (scoringEngine.isTemporalScoreDefined()) {
            vector.push('E:' + Cvss3VectorRenderer.renderExploitCodeMaturity(scoringEngine.exploitCodeMaturity));
            vector.push('RL:' + Cvss3VectorRenderer.renderRemediationLevel(scoringEngine.remediationLevel));
            vector.push('RC:' + Cvss3VectorRenderer.renderReportConfidence(scoringEngine.reportConfidence));
        }
        // If present, include environmental metrics.
        if (scoringEngine.isEnvironmentalScoreDefined()) {
            vector.push('MAV:' + Cvss3VectorRenderer.renderAttackVector(scoringEngine.modifiedAttackVector));
            vector.push('MAC:' + Cvss3VectorRenderer.renderAttackComplexity(scoringEngine.modifiedAttackComplexity));
            vector.push('MPR:'
                + Cvss3VectorRenderer.renderPrivilegesRequired(scoringEngine.modifiedPrivilegesRequired));
            vector.push('MUI:' + Cvss3VectorRenderer.renderUserInteraction(scoringEngine.modifiedUserInteraction));
            vector.push('MS:' + Cvss3VectorRenderer.renderScope(scoringEngine.modifiedScope));
            vector.push('MC:' + Cvss3VectorRenderer.renderImpact(scoringEngine.modifiedConfidentialityImpact));
            vector.push('MI:' + Cvss3VectorRenderer.renderImpact(scoringEngine.modifiedIntegrityImpact));
            vector.push('MA:' + Cvss3VectorRenderer.renderImpact(scoringEngine.modifiedAvailabilityImpact));
            vector.push('CR:'
                + Cvss3VectorRenderer.renderSecurityRequirement(scoringEngine.confidentialityRequirement));
            vector.push('IR:' + Cvss3VectorRenderer.renderSecurityRequirement(scoringEngine.integrityRequirement));
            vector.push('AR:' + Cvss3VectorRenderer.renderSecurityRequirement(scoringEngine.availabilityRequirement));
        }
        // Join vector together with forward slashes.
        var vectorString = vector.join('/');
        // Apply prefix options.
        switch (this._prefixOption) {
            case Cvss3VectorPrefixOption.VERSION_3_0:
                return 'CVSS:3.0/' + vectorString;
            case Cvss3VectorPrefixOption.VERSION_3_1:
                return 'CVSS:3.1/' + vectorString;
        }
        // Prefix option is none.
        return vectorString;
    };
    return Cvss3VectorRenderer;
}());
exports.Cvss3VectorRenderer = Cvss3VectorRenderer;
