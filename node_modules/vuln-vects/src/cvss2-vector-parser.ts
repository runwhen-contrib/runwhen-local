import { CvssScore } from "./cvss-score";
import { Cvss2ScoringEngine } from "./cvss2-scoring-engine";
import { CvssVectorParser } from "./cvss-vector-parser";
import {
    AccessComplexity,
    AccessVector,
    Authentication,
    CollateralDamagePotential,
    Exploitability,
    Impact,
    ImpactSubscore,
    RemediationLevel,
    ReportConfidence,
    TargetDistribution
} from "./cvss2-enums";


/**
 * Implements a service offering CVSS v2 vector parsing.
 *
 * @remarks
 * Consumers should be aware that {@link parse} will raise an exception if an invalid CVSS v2 vector string is passed.
 * This includes strings containing incorrect keys/values and those that are missing required entries.
 *
 * @public
 */
export class Cvss2VectorParser implements CvssVectorParser {

    /**
     * Converts an access vector, represented as a string, into an enum value.
     *
     * @param accessVectorString the string to convert
     * @returns the converted enum value
     */
    private static parseAccessVector (accessVectorString: string): AccessVector {
        switch (accessVectorString) {
            case "L":
                return AccessVector.LOCAL;
            case "A":
                return AccessVector.ADJACENT_NETWORK;
            case "N":
                return AccessVector.NETWORK;
        }
        throw new RangeError("Invalid CVSS v2 access vector value: \"" + accessVectorString + "\"");
    }

    /**
     * Converts an access complexity, represented as a string, into an enum value.
     *
     * @param accessComplexityString the string to convert
     * @returns the converted enum value
     */
    private static parseAccessComplexity (accessComplexityString: string): AccessComplexity {
        switch (accessComplexityString) {
            case "H":
                return AccessComplexity.HIGH;
            case "M":
                return AccessComplexity.MEDIUM;
            case "L":
                return AccessComplexity.LOW;
        }
        throw new RangeError("Invalid CVSS v2 access complexity value: \"" + accessComplexityString + "\"");
    }

    /**
     * Converts an authentication level, represented as a string, into an enum value.
     *
     * @param authenticationString the string to convert
     * @returns the converted enum value
     */
    private static parseAuthentication(authenticationString: string): Authentication {
        switch (authenticationString) {
            case "M":
                return Authentication.MULTIPLE;
            case "S":
                return Authentication.SINGLE;
            case "N":
                return Authentication.NONE;
        }
        throw new RangeError("Invalid CVSS v2 authentication value: \"" + authenticationString + "\"");
    }

    /**
     * Converts an impact magnitude, represented as a string, into an enum value.
     *
     * @param impactString the string to convert
     * @returns the converted enum value
     */
    private static parseImpact(impactString: string): Impact {
        switch (impactString) {
            case "N":
                return Impact.NONE;
            case "P":
                return Impact.PARTIAL;
            case "C":
                return Impact.COMPLETE;
        }
        throw new RangeError("Invalid CVSS v2 impact value: \"" + impactString + "\"");
    }

    /**
     * Converts an impact magnitude, represented as a string, into an enum value.
     *
     * @param impactString the string to convert
     * @returns the converted enum value
     */
    private static parseExploitability(exploitabilityString: string): Exploitability {
        switch (exploitabilityString) {
            case "ND":
                return Exploitability.NOT_DEFINED;
            case "U":
                return Exploitability.UNPROVEN_THAT_EXPLOIT_EXISTS;
            case "POC":
                return Exploitability.PROOF_OF_CONCEPT_CODE;
            case "F":
                return Exploitability.FUNCTIONAL_EXPLOIT_EXISTS;
            case "H":
                return Exploitability.HIGH;
        }
        throw new RangeError("Invalid CVSS v2 exploitability value: \"" + exploitabilityString + "\"");
    }

    /**
     * Converts a remediation level, represented as a string, into an enum value.
     *
     * @param remediationLevelString the string to convert
     * @returns the converted enum value
     */
    private static parseRemediationLevel(remediationLevelString: string): RemediationLevel {
        switch (remediationLevelString) {
            case "ND":
                return RemediationLevel.NOT_DEFINED;
            case "OF":
                return RemediationLevel.OFFICIAL_FIX;
            case "TF":
                return RemediationLevel.TEMPORARY_FIX;
            case "W":
                return RemediationLevel.WORKAROUND;
            case "U":
                return RemediationLevel.UNAVAILABLE;
        }
        throw new RangeError("Invalid CVSS v2 remediation level value: \"" + remediationLevelString + "\"");
    }

    /**
     * Converts a report confidence level, represented as a string, into an enum value.
     *
     * @param reportConfidenceString the string to convert
     * @returns the converted enum value
     */
    private static parseReportConfidence(reportConfidenceString: string): ReportConfidence {
        switch (reportConfidenceString) {
            case "ND":
                return ReportConfidence.NOT_DEFINED;
            case "UC":
                return ReportConfidence.UNCONFIRMED;
            case "UR":
                return ReportConfidence.UNCORROBORATED;
            case "C":
                return ReportConfidence.CONFIRMED;
        }
        throw new RangeError("Invalid CVSS v2 report confidence value: \"" + reportConfidenceString + "\"");
    }

    /**
     * Converts a collateral damage potential, represented as a string, into an enum value.
     *
     * @param collateralDamagePotentialString the string to convert
     * @returns the converted enum value
     */
    private static parseCollateralDamagePotential(collateralDamagePotentialString: string): CollateralDamagePotential {
        switch (collateralDamagePotentialString) {
            case "ND":
                return CollateralDamagePotential.NOT_DEFINED;
            case "N":
                return CollateralDamagePotential.NONE;
            case "L":
                return CollateralDamagePotential.LOW;
            case "LM":
                return CollateralDamagePotential.LOW_MEDIUM;
            case "MH":
                return CollateralDamagePotential.MEDIUM_HIGH;
            case "H":
                return CollateralDamagePotential.HIGH;
        }
        throw new RangeError("Invalid CVSS v2 collateral damage potential value: \""
            + collateralDamagePotentialString + "\"");
    }

    /**
     * Converts a target distribution, represented as a string, into an enum value.
     *
     * @param targetDistributionString the string to convert
     * @returns the converted enum value
     */
    private static parseTargetDistribution(targetDistributionString: string): TargetDistribution {
        switch (targetDistributionString) {
            case "ND":
                return TargetDistribution.NOT_DEFINED;
            case "N":
                return TargetDistribution.NONE;
            case "L":
                return TargetDistribution.LOW;
            case "M":
                return TargetDistribution.MEDIUM;
            case "H":
                return TargetDistribution.HIGH;
        }
        throw new RangeError("Invalid CVSS v2 target distribution value: \"" + targetDistributionString + "\"");
    }

    /**
     * Converts an impact subscore value, represented as a string, into an enum value.
     *
     * @param impactSubscoreString the string to convert
     * @returns the converted enum value
     */
    private static parseImpactSubscore(impactSubscoreString: string): ImpactSubscore {
        switch (impactSubscoreString) {
            case "ND":
                return ImpactSubscore.NOT_DEFINED;
            case "L":
                return ImpactSubscore.LOW;
            case "M":
                return ImpactSubscore.MEDIUM;
            case "H":
                return ImpactSubscore.HIGH;
        }
        throw new RangeError("Invalid CVSS v2 impact subscore value: \"" + impactSubscoreString + "\"");
    }

    /**
     * Generates and returns a version-specific (CVSS v2) scoring engine loaded with a vector.
     *
     * @param vector the vector to load in to the scoring engine
     * @returns the loaded scoring engine
     */
    public generateScoringEngine(vector: string): Cvss2ScoringEngine {

        // Variable to hold vector with version prefix stripped. Strip brackets if present.
        let strippedVector = vector.replace(/^\(/, "").replace(/\)$/, "");

        // Remove version prefix if present.
        let version = strippedVector.split("#");
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
        let cvss = new Cvss2ScoringEngine();

        // Split along slashes.
        let segments = strippedVector.split("/");
        for (let segment of segments) {

            // Split segment.
            let sections = segment.split(":");

            // Validate segment.
            if (sections.length != 2) {
                throw new RangeError("Invalid CVSS v2 vector segment: \"" + segment + "\"");
            }

            // Parse segment.
            switch(sections[0].toUpperCase()) {
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
    }

    /**
     * @inheritdoc
     */
    public parse (vector: string): CvssScore {

        // Return computed score.
        return this.generateScoringEngine(vector).computeScore();
    }
}