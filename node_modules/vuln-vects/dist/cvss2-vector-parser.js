"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cvss2_scoring_engine_1 = require("./cvss2-scoring-engine");
var cvss2_enums_1 = require("./cvss2-enums");
/**
 * Implements a service offering CVSS v2 vector parsing.
 *
 * @remarks
 * Consumers should be aware that {@link parse} will raise an exception if an invalid CVSS v2 vector string is passed.
 * This includes strings containing incorrect keys/values and those that are missing required entries.
 *
 * @public
 */
var Cvss2VectorParser = /** @class */ (function () {
    function Cvss2VectorParser() {
    }
    /**
     * Converts an access vector, represented as a string, into an enum value.
     *
     * @param accessVectorString the string to convert
     * @returns the converted enum value
     */
    Cvss2VectorParser.parseAccessVector = function (accessVectorString) {
        switch (accessVectorString) {
            case "L":
                return cvss2_enums_1.AccessVector.LOCAL;
            case "A":
                return cvss2_enums_1.AccessVector.ADJACENT_NETWORK;
            case "N":
                return cvss2_enums_1.AccessVector.NETWORK;
        }
        throw new RangeError("Invalid CVSS v2 access vector value: \"" + accessVectorString + "\"");
    };
    /**
     * Converts an access complexity, represented as a string, into an enum value.
     *
     * @param accessComplexityString the string to convert
     * @returns the converted enum value
     */
    Cvss2VectorParser.parseAccessComplexity = function (accessComplexityString) {
        switch (accessComplexityString) {
            case "H":
                return cvss2_enums_1.AccessComplexity.HIGH;
            case "M":
                return cvss2_enums_1.AccessComplexity.MEDIUM;
            case "L":
                return cvss2_enums_1.AccessComplexity.LOW;
        }
        throw new RangeError("Invalid CVSS v2 access complexity value: \"" + accessComplexityString + "\"");
    };
    /**
     * Converts an authentication level, represented as a string, into an enum value.
     *
     * @param authenticationString the string to convert
     * @returns the converted enum value
     */
    Cvss2VectorParser.parseAuthentication = function (authenticationString) {
        switch (authenticationString) {
            case "M":
                return cvss2_enums_1.Authentication.MULTIPLE;
            case "S":
                return cvss2_enums_1.Authentication.SINGLE;
            case "N":
                return cvss2_enums_1.Authentication.NONE;
        }
        throw new RangeError("Invalid CVSS v2 authentication value: \"" + authenticationString + "\"");
    };
    /**
     * Converts an impact magnitude, represented as a string, into an enum value.
     *
     * @param impactString the string to convert
     * @returns the converted enum value
     */
    Cvss2VectorParser.parseImpact = function (impactString) {
        switch (impactString) {
            case "N":
                return cvss2_enums_1.Impact.NONE;
            case "P":
                return cvss2_enums_1.Impact.PARTIAL;
            case "C":
                return cvss2_enums_1.Impact.COMPLETE;
        }
        throw new RangeError("Invalid CVSS v2 impact value: \"" + impactString + "\"");
    };
    /**
     * Converts an impact magnitude, represented as a string, into an enum value.
     *
     * @param impactString the string to convert
     * @returns the converted enum value
     */
    Cvss2VectorParser.parseExploitability = function (exploitabilityString) {
        switch (exploitabilityString) {
            case "ND":
                return cvss2_enums_1.Exploitability.NOT_DEFINED;
            case "U":
                return cvss2_enums_1.Exploitability.UNPROVEN_THAT_EXPLOIT_EXISTS;
            case "POC":
                return cvss2_enums_1.Exploitability.PROOF_OF_CONCEPT_CODE;
            case "F":
                return cvss2_enums_1.Exploitability.FUNCTIONAL_EXPLOIT_EXISTS;
            case "H":
                return cvss2_enums_1.Exploitability.HIGH;
        }
        throw new RangeError("Invalid CVSS v2 exploitability value: \"" + exploitabilityString + "\"");
    };
    /**
     * Converts a remediation level, represented as a string, into an enum value.
     *
     * @param remediationLevelString the string to convert
     * @returns the converted enum value
     */
    Cvss2VectorParser.parseRemediationLevel = function (remediationLevelString) {
        switch (remediationLevelString) {
            case "ND":
                return cvss2_enums_1.RemediationLevel.NOT_DEFINED;
            case "OF":
                return cvss2_enums_1.RemediationLevel.OFFICIAL_FIX;
            case "TF":
                return cvss2_enums_1.RemediationLevel.TEMPORARY_FIX;
            case "W":
                return cvss2_enums_1.RemediationLevel.WORKAROUND;
            case "U":
                return cvss2_enums_1.RemediationLevel.UNAVAILABLE;
        }
        throw new RangeError("Invalid CVSS v2 remediation level value: \"" + remediationLevelString + "\"");
    };
    /**
     * Converts a report confidence level, represented as a string, into an enum value.
     *
     * @param reportConfidenceString the string to convert
     * @returns the converted enum value
     */
    Cvss2VectorParser.parseReportConfidence = function (reportConfidenceString) {
        switch (reportConfidenceString) {
            case "ND":
                return cvss2_enums_1.ReportConfidence.NOT_DEFINED;
            case "UC":
                return cvss2_enums_1.ReportConfidence.UNCONFIRMED;
            case "UR":
                return cvss2_enums_1.ReportConfidence.UNCORROBORATED;
            case "C":
                return cvss2_enums_1.ReportConfidence.CONFIRMED;
        }
        throw new RangeError("Invalid CVSS v2 report confidence value: \"" + reportConfidenceString + "\"");
    };
    /**
     * Converts a collateral damage potential, represented as a string, into an enum value.
     *
     * @param collateralDamagePotentialString the string to convert
     * @returns the converted enum value
     */
    Cvss2VectorParser.parseCollateralDamagePotential = function (collateralDamagePotentialString) {
        switch (collateralDamagePotentialString) {
            case "ND":
                return cvss2_enums_1.CollateralDamagePotential.NOT_DEFINED;
            case "N":
                return cvss2_enums_1.CollateralDamagePotential.NONE;
            case "L":
                return cvss2_enums_1.CollateralDamagePotential.LOW;
            case "LM":
                return cvss2_enums_1.CollateralDamagePotential.LOW_MEDIUM;
            case "MH":
                return cvss2_enums_1.CollateralDamagePotential.MEDIUM_HIGH;
            case "H":
                return cvss2_enums_1.CollateralDamagePotential.HIGH;
        }
        throw new RangeError("Invalid CVSS v2 collateral damage potential value: \""
            + collateralDamagePotentialString + "\"");
    };
    /**
     * Converts a target distribution, represented as a string, into an enum value.
     *
     * @param targetDistributionString the string to convert
     * @returns the converted enum value
     */
    Cvss2VectorParser.parseTargetDistribution = function (targetDistributionString) {
        switch (targetDistributionString) {
            case "ND":
                return cvss2_enums_1.TargetDistribution.NOT_DEFINED;
            case "N":
                return cvss2_enums_1.TargetDistribution.NONE;
            case "L":
                return cvss2_enums_1.TargetDistribution.LOW;
            case "M":
                return cvss2_enums_1.TargetDistribution.MEDIUM;
            case "H":
                return cvss2_enums_1.TargetDistribution.HIGH;
        }
        throw new RangeError("Invalid CVSS v2 target distribution value: \"" + targetDistributionString + "\"");
    };
    /**
     * Converts an impact subscore value, represented as a string, into an enum value.
     *
     * @param impactSubscoreString the string to convert
     * @returns the converted enum value
     */
    Cvss2VectorParser.parseImpactSubscore = function (impactSubscoreString) {
        switch (impactSubscoreString) {
            case "ND":
                return cvss2_enums_1.ImpactSubscore.NOT_DEFINED;
            case "L":
                return cvss2_enums_1.ImpactSubscore.LOW;
            case "M":
                return cvss2_enums_1.ImpactSubscore.MEDIUM;
            case "H":
                return cvss2_enums_1.ImpactSubscore.HIGH;
        }
        throw new RangeError("Invalid CVSS v2 impact subscore value: \"" + impactSubscoreString + "\"");
    };
    /**
     * Generates and returns a version-specific (CVSS v2) scoring engine loaded with a vector.
     *
     * @param vector the vector to load in to the scoring engine
     * @returns the loaded scoring engine
     */
    Cvss2VectorParser.prototype.generateScoringEngine = function (vector) {
        // Variable to hold vector with version prefix stripped. Strip brackets if present.
        var strippedVector = vector.replace(/^\(/, "").replace(/\)$/, "");
        // Remove version prefix if present.
        var version = strippedVector.split("#");
        if (version.length > 2) {
            throw new RangeError("Wrong number of version prefixes. Please ensure that your vector contains either 0 "
                + "or 1 version prefix delimiter ('#')."); // Too many version prefix delimiters.
        }
        if (version.length === 2 && version[0] !== "CVSS2") {
            throw new RangeError("Bad version prefix. Ensure that the CVSS vector version prefix in use (if any) is "
                + "'CVSS2#' if the vector is in CVSS v2.0 format.");
        }
        strippedVector = version.length === 2 ? version[1] : strippedVector;
        // Get scoring engine ready.
        var cvss = new cvss2_scoring_engine_1.Cvss2ScoringEngine();
        // Split along slashes.
        var segments = strippedVector.split("/");
        for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
            var segment = segments_1[_i];
            // Split segment.
            var sections = segment.split(":");
            // Validate segment.
            if (sections.length != 2) {
                throw new RangeError("Invalid CVSS v2 vector segment: \"" + segment + "\"");
            }
            // Parse segment.
            switch (sections[0].toUpperCase()) {
                case "AV":
                    cvss.accessVector = Cvss2VectorParser.parseAccessVector(sections[1]);
                    break;
                case "AC":
                    cvss.accessComplexity = Cvss2VectorParser.parseAccessComplexity(sections[1]);
                    break;
                case "AU":
                    cvss.authentication = Cvss2VectorParser.parseAuthentication(sections[1]);
                    break;
                case "C":
                    cvss.confidentialityImpact = Cvss2VectorParser.parseImpact(sections[1]);
                    break;
                case "I":
                    cvss.integrityImpact = Cvss2VectorParser.parseImpact(sections[1]);
                    break;
                case "A":
                    cvss.availabilityImpact = Cvss2VectorParser.parseImpact(sections[1]);
                    break;
                case "E":
                    cvss.exploitability = Cvss2VectorParser.parseExploitability(sections[1]);
                    break;
                case "RL":
                    cvss.remediationLevel = Cvss2VectorParser.parseRemediationLevel(sections[1]);
                    break;
                case "RC":
                    cvss.reportConfidence = Cvss2VectorParser.parseReportConfidence(sections[1]);
                    break;
                case "CDP":
                    cvss.collateralDamagePotential = Cvss2VectorParser.parseCollateralDamagePotential(sections[1]);
                    break;
                case "TD":
                    cvss.targetDistribution = Cvss2VectorParser.parseTargetDistribution(sections[1]);
                    break;
                case "CR":
                    cvss.confidentialityRequirement = Cvss2VectorParser.parseImpactSubscore(sections[1]);
                    break;
                case "IR":
                    cvss.integrityRequirement = Cvss2VectorParser.parseImpactSubscore(sections[1]);
                    break;
                case "AR":
                    cvss.availabilityRequirement = Cvss2VectorParser.parseImpactSubscore(sections[1]);
                    break;
                default:
                    throw new RangeError("Invalid CVSS v2 vector key: \"" + sections[1] + "\"");
            }
        }
        // Return scoring engine.
        return cvss;
    };
    /**
     * @inheritdoc
     */
    Cvss2VectorParser.prototype.parse = function (vector) {
        // Return computed score.
        return this.generateScoringEngine(vector).computeScore();
    };
    return Cvss2VectorParser;
}());
exports.Cvss2VectorParser = Cvss2VectorParser;
