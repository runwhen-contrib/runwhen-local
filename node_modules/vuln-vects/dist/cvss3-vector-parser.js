"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cvss3_scoring_engine_1 = require("./cvss3-scoring-engine");
var cvss3_enums_1 = require("./cvss3-enums");
/**
 * Implements a service offering CVSS v3 vector parsing.
 *
 * @remarks
 * Consumers should be aware that {@link parse} will raise an exception if an invalid CVSS v3 vector string is passed.
 * This includes strings containing incorrect keys/values and those that are missing required entries.
 *
 * @public
 */
var Cvss3VectorParser = /** @class */ (function () {
    function Cvss3VectorParser() {
    }
    /**
     * Converts an attack vector, represented as a string, into an enum value.
     *
     * @param attackVectorString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseAttackVector = function (attackVectorString) {
        switch (attackVectorString) {
            case "L":
                return cvss3_enums_1.AttackVector.LOCAL;
            case "A":
                return cvss3_enums_1.AttackVector.ADJACENT_NETWORK;
            case "N":
                return cvss3_enums_1.AttackVector.NETWORK;
            case "P":
                return cvss3_enums_1.AttackVector.PHYSICAL;
        }
        throw new RangeError("Invalid CVSS v3 attack vector value: \"" + attackVectorString + "\"");
    };
    /**
     * Converts an attack complexity, represented as a string, into an enum value.
     *
     * @param attackComplexityString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseAttackComplexity = function (attackComplexityString) {
        switch (attackComplexityString) {
            case "H":
                return cvss3_enums_1.AttackComplexity.HIGH;
            case "L":
                return cvss3_enums_1.AttackComplexity.LOW;
        }
        throw new RangeError("Invalid CVSS v3 attack complexity value: \"" + attackComplexityString + "\"");
    };
    /**
     * Converts a privileges requirement, represented as a string, into an enum value.
     *
     * @param privilegesRequiredString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parsePrivilegesRequired = function (privilegesRequiredString) {
        switch (privilegesRequiredString) {
            case "H":
                return cvss3_enums_1.PrivilegesRequired.HIGH;
            case "L":
                return cvss3_enums_1.PrivilegesRequired.LOW;
            case "N":
                return cvss3_enums_1.PrivilegesRequired.NONE;
        }
        throw new RangeError("Invalid CVSS v3 privileges required value: \"" + privilegesRequiredString + "\"");
    };
    /**
     * Converts a user interaction level, represented as a string, into an enum value.
     *
     * @param userInteractionString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseUserInteraction = function (userInteractionString) {
        switch (userInteractionString) {
            case "R":
                return cvss3_enums_1.UserInteraction.REQUIRED;
            case "N":
                return cvss3_enums_1.UserInteraction.NONE;
        }
        throw new RangeError("Invalid CVSS v3 user interaction value: \"" + userInteractionString + "\"");
    };
    /**
     * Converts a scope, represented as a string, into an enum value.
     *
     * @param scopeString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseScope = function (scopeString) {
        switch (scopeString) {
            case "C":
                return cvss3_enums_1.Scope.CHANGED;
            case "U":
                return cvss3_enums_1.Scope.UNCHANGED;
        }
        throw new RangeError("Invalid CVSS v3 scope value: \"" + scopeString + "\"");
    };
    /**
     * Converts an impact magnitude, represented as a string, into an enum value.
     *
     * @param impactString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseImpact = function (impactString) {
        switch (impactString) {
            case "N":
                return cvss3_enums_1.Impact.NONE;
            case "L":
                return cvss3_enums_1.Impact.LOW;
            case "H":
                return cvss3_enums_1.Impact.HIGH;
        }
        throw new RangeError("Invalid CVSS v3 impact value: \"" + impactString + "\"");
    };
    /**
     * Converts an exploit code maturity level, represented as a string, into an enum value.
     *
     * @param exploitCodeMaturityString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseExploitCodeMaturity = function (exploitCodeMaturityString) {
        switch (exploitCodeMaturityString) {
            case "X":
                return cvss3_enums_1.ExploitCodeMaturity.NOT_DEFINED;
            case "U":
                return cvss3_enums_1.ExploitCodeMaturity.UNPROVEN_THAT_EXPLOIT_EXISTS;
            case "P":
                return cvss3_enums_1.ExploitCodeMaturity.PROOF_OF_CONCEPT_CODE;
            case "F":
                return cvss3_enums_1.ExploitCodeMaturity.FUNCTIONAL_EXPLOIT_EXISTS;
            case "H":
                return cvss3_enums_1.ExploitCodeMaturity.HIGH;
        }
        throw new RangeError("Invalid CVSS v3 exploit code maturity value: \"" + exploitCodeMaturityString + "\"");
    };
    /**
     * Converts a remediation level, represented as a string, into an enum value.
     *
     * @param remediationLevelString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseRemediationLevel = function (remediationLevelString) {
        switch (remediationLevelString) {
            case "X":
                return cvss3_enums_1.RemediationLevel.NOT_DEFINED;
            case "O":
                return cvss3_enums_1.RemediationLevel.OFFICIAL_FIX;
            case "T":
                return cvss3_enums_1.RemediationLevel.TEMPORARY_FIX;
            case "W":
                return cvss3_enums_1.RemediationLevel.WORKAROUND;
            case "U":
                return cvss3_enums_1.RemediationLevel.UNAVAILABLE;
        }
        throw new RangeError("Invalid CVSS v3 remediation level value: \"" + remediationLevelString + "\"");
    };
    /**
     * Converts a report confidence level, represented as a string, into an enum value.
     *
     * @param reportConfidenceString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseReportConfidence = function (reportConfidenceString) {
        switch (reportConfidenceString) {
            case "X":
                return cvss3_enums_1.ReportConfidence.NOT_DEFINED;
            case "U":
                return cvss3_enums_1.ReportConfidence.UNKNOWN;
            case "R":
                return cvss3_enums_1.ReportConfidence.REASONABLE;
            case "C":
                return cvss3_enums_1.ReportConfidence.CONFIRMED;
        }
        throw new RangeError("Invalid CVSS v3 report confidence value: \"" + reportConfidenceString + "\"");
    };
    /**
     * Converts a modified attack vector, represented as a string, into an enum value.
     *
     * @param modifiedAttackVectorString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseModifiedAttackVector = function (modifiedAttackVectorString) {
        switch (modifiedAttackVectorString) {
            case "X":
                return cvss3_enums_1.AttackVector.NOT_DEFINED;
            case "L":
                return cvss3_enums_1.AttackVector.LOCAL;
            case "A":
                return cvss3_enums_1.AttackVector.ADJACENT_NETWORK;
            case "N":
                return cvss3_enums_1.AttackVector.NETWORK;
            case "P":
                return cvss3_enums_1.AttackVector.PHYSICAL;
        }
        throw new RangeError("Invalid CVSS v3 modified attack vector value: \"" + modifiedAttackVectorString + "\"");
    };
    /**
     * Converts a modified attack complexity, represented as a string, into an enum value.
     *
     * @param modifiedAttackVectorString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseModifiedAttackComplexity = function (modifiedAttackComplexityString) {
        switch (modifiedAttackComplexityString) {
            case "X":
                return cvss3_enums_1.AttackComplexity.NOT_DEFINED;
            case "H":
                return cvss3_enums_1.AttackComplexity.HIGH;
            case "L":
                return cvss3_enums_1.AttackComplexity.LOW;
        }
        throw new RangeError("Invalid CVSS v3 modified attack complexity value: \"" + modifiedAttackComplexityString + "\"");
    };
    /**
     * Converts a modified privileges requirement, represented as a string, into an enum value.
     *
     * @param modifiedPrivilegesRequiredString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseModifiedPrivilegesRequired = function (modifiedPrivilegesRequiredString) {
        switch (modifiedPrivilegesRequiredString) {
            case "X":
                return cvss3_enums_1.PrivilegesRequired.NOT_DEFINED;
            case "H":
                return cvss3_enums_1.PrivilegesRequired.HIGH;
            case "L":
                return cvss3_enums_1.PrivilegesRequired.LOW;
            case "N":
                return cvss3_enums_1.PrivilegesRequired.NONE;
        }
        throw new RangeError("Invalid CVSS v3 privileges required value: \"" + modifiedPrivilegesRequiredString + "\"");
    };
    /**
     * Converts a modified user interaction level, represented as a string, into an enum value.
     *
     * @param modifiedUserInteractionString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseModifiedUserInteraction = function (modifiedUserInteractionString) {
        switch (modifiedUserInteractionString) {
            case "X":
                return cvss3_enums_1.UserInteraction.NOT_DEFINED;
            case "R":
                return cvss3_enums_1.UserInteraction.REQUIRED;
            case "N":
                return cvss3_enums_1.UserInteraction.NONE;
        }
        throw new RangeError("Invalid CVSS v3 modified user interaction value: \"" + modifiedUserInteractionString + "\"");
    };
    /**
     * Converts a modified scope, represented as a string, into an enum value.
     *
     * @param scopeString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseModifiedScope = function (modifiedScopeString) {
        switch (modifiedScopeString) {
            case "X":
                return cvss3_enums_1.Scope.NOT_DEFINED;
            case "C":
                return cvss3_enums_1.Scope.CHANGED;
            case "U":
                return cvss3_enums_1.Scope.UNCHANGED;
        }
        throw new RangeError("Invalid CVSS v3 modified scope value: \"" + modifiedScopeString + "\"");
    };
    /**
     * Converts a modified impact magnitude, represented as a string, into an enum value.
     *
     * @param impactString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseModifiedImpact = function (modifiedImpactString) {
        switch (modifiedImpactString) {
            case "X":
                return cvss3_enums_1.Impact.NOT_DEFINED;
            case "N":
                return cvss3_enums_1.Impact.NONE;
            case "L":
                return cvss3_enums_1.Impact.LOW;
            case "H":
                return cvss3_enums_1.Impact.HIGH;
        }
        throw new RangeError("Invalid CVSS v3 impact value: \"" + modifiedImpactString + "\"");
    };
    /**
     * Converts a security requirement, represented as a string, into an enum value.
     *
     * @param securityRequirementString the string to convert
     * @returns the converted enum value
     */
    Cvss3VectorParser.parseSecurityRequirement = function (securityRequirementString) {
        switch (securityRequirementString) {
            case "X":
                return cvss3_enums_1.SecurityRequirement.NOT_DEFINED;
            case "L":
                return cvss3_enums_1.SecurityRequirement.LOW;
            case "M":
                return cvss3_enums_1.SecurityRequirement.MEDIUM;
            case "H":
                return cvss3_enums_1.SecurityRequirement.HIGH;
        }
        throw new RangeError("Invalid CVSS v3 security requirement value: \"" + securityRequirementString + "\"");
    };
    /**
     * Generates and returns a version-specific (CVSS v3.x) scoring engine loaded with a vector.
     *
     * @param vector the vector to load in to the scoring engine
     * @returns the loaded scoring engine
     */
    Cvss3VectorParser.prototype.generateScoringEngine = function (vector) {
        // Variable to hold vector with version prefix stripped.
        var strippedVector = vector;
        // Validate version prefix if present.
        var versionCheck = /^CVSS:(\d)\.(\d)\//.exec(strippedVector);
        if (versionCheck !== null) {
            if (versionCheck[1] !== "3" || (['0', '1'].indexOf(versionCheck[2]) === -1)) {
                throw RangeError("Bad version prefix. Ensure that the CVSS vector version prefix in use (if any) is "
                    + "'CVSS:3.0/' or 'CVSS:3.1/' if the vector is in either of these formats.");
            }
            strippedVector = strippedVector.replace(versionCheck[0], ""); // Strip vector.
        }
        // Get scoring engine ready.
        var cvss = new cvss3_scoring_engine_1.Cvss3ScoringEngine();
        // Split along slashes.
        var segments = strippedVector.split("/");
        for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
            var segment = segments_1[_i];
            // Split segment.
            var sections = segment.split(":");
            // Validate segment.
            if (sections.length != 2) {
                throw new RangeError("Invalid CVSS v3 vector segment: \"" + segment + "\"");
            }
            // Parse segment.
            switch (sections[0].toUpperCase()) {
                case "AV":
                    cvss.attackVector = Cvss3VectorParser.parseAttackVector(sections[1]);
                    break;
                case "AC":
                    cvss.attackComplexity = Cvss3VectorParser.parseAttackComplexity(sections[1]);
                    break;
                case "PR":
                    cvss.privilegesRequired = Cvss3VectorParser.parsePrivilegesRequired(sections[1]);
                    break;
                case "UI":
                    cvss.userInteraction = Cvss3VectorParser.parseUserInteraction(sections[1]);
                    break;
                case "S":
                    cvss.scope = Cvss3VectorParser.parseScope(sections[1]);
                    break;
                case "C":
                    cvss.confidentialityImpact = Cvss3VectorParser.parseImpact(sections[1]);
                    break;
                case "I":
                    cvss.integrityImpact = Cvss3VectorParser.parseImpact(sections[1]);
                    break;
                case "A":
                    cvss.availabilityImpact = Cvss3VectorParser.parseImpact(sections[1]);
                    break;
                case "E":
                    cvss.exploitCodeMaturity = Cvss3VectorParser.parseExploitCodeMaturity(sections[1]);
                    break;
                case "RL":
                    cvss.remediationLevel = Cvss3VectorParser.parseRemediationLevel(sections[1]);
                    break;
                case "RC":
                    cvss.reportConfidence = Cvss3VectorParser.parseReportConfidence(sections[1]);
                    break;
                case "MAV":
                    cvss.modifiedAttackVector = Cvss3VectorParser.parseModifiedAttackVector(sections[1]);
                    break;
                case "MAC":
                    cvss.modifiedAttackComplexity = Cvss3VectorParser.parseModifiedAttackComplexity(sections[1]);
                    break;
                case "MPR":
                    cvss.modifiedPrivilegesRequired = Cvss3VectorParser.parseModifiedPrivilegesRequired(sections[1]);
                    break;
                case "MUI":
                    cvss.modifiedUserInteraction = Cvss3VectorParser.parseModifiedUserInteraction(sections[1]);
                    break;
                case "MS":
                    cvss.modifiedScope = Cvss3VectorParser.parseModifiedScope(sections[1]);
                    break;
                case "MC":
                    cvss.modifiedConfidentialityImpact = Cvss3VectorParser.parseModifiedImpact(sections[1]);
                    break;
                case "MI":
                    cvss.modifiedIntegrityImpact = Cvss3VectorParser.parseModifiedImpact(sections[1]);
                    break;
                case "MA":
                    cvss.modifiedAvailabilityImpact = Cvss3VectorParser.parseModifiedImpact(sections[1]);
                    break;
                case "CR":
                    cvss.confidentialityRequirement = Cvss3VectorParser.parseSecurityRequirement(sections[1]);
                    break;
                case "IR":
                    cvss.integrityRequirement = Cvss3VectorParser.parseSecurityRequirement(sections[1]);
                    break;
                case "AR":
                    cvss.availabilityRequirement = Cvss3VectorParser.parseSecurityRequirement(sections[1]);
                    break;
                default:
                    throw new RangeError("Invalid CVSS v3 vector key: \"" + sections[1] + "\"");
            }
        }
        // Return scoring engine.
        return cvss;
    };
    /**
     * @inheritDoc
     */
    Cvss3VectorParser.prototype.parse = function (vector) {
        // Return computed score.
        return this.generateScoringEngine(vector).computeScore();
    };
    return Cvss3VectorParser;
}());
exports.Cvss3VectorParser = Cvss3VectorParser;
