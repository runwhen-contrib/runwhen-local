import { CvssScore } from "./cvss-score";
import { Cvss3ScoringEngine } from "./cvss3-scoring-engine";
import { CvssVectorParser } from "./cvss-vector-parser";
import {
    AttackVector,
    AttackComplexity,
    PrivilegesRequired,
    UserInteraction,
    Scope,
    Impact,
    ExploitCodeMaturity,
    RemediationLevel,
    ReportConfidence,
    SecurityRequirement
} from "./cvss3-enums";


/**
 * Implements a service offering CVSS v3 vector parsing.
 *
 * @remarks
 * Consumers should be aware that {@link parse} will raise an exception if an invalid CVSS v3 vector string is passed.
 * This includes strings containing incorrect keys/values and those that are missing required entries.
 *
 * @public
 */
export class Cvss3VectorParser implements CvssVectorParser {

    /**
     * Converts an attack vector, represented as a string, into an enum value.
     *
     * @param attackVectorString the string to convert
     * @returns the converted enum value
     */
    private static parseAttackVector(attackVectorString: string): AttackVector {
        switch (attackVectorString) {
            case "L":
                return AttackVector.LOCAL;
            case "A":
                return AttackVector.ADJACENT_NETWORK;
            case "N":
                return AttackVector.NETWORK;
            case "P":
                return AttackVector.PHYSICAL;
        }
        throw new RangeError("Invalid CVSS v3 attack vector value: \"" + attackVectorString + "\"");
    }

    /**
     * Converts an attack complexity, represented as a string, into an enum value.
     *
     * @param attackComplexityString the string to convert
     * @returns the converted enum value
     */
    private static parseAttackComplexity(attackComplexityString: string): AttackComplexity {
        switch (attackComplexityString) {
            case "H":
                return AttackComplexity.HIGH;
            case "L":
                return AttackComplexity.LOW;
        }
        throw new RangeError("Invalid CVSS v3 attack complexity value: \"" + attackComplexityString + "\"");
    }

    /**
     * Converts a privileges requirement, represented as a string, into an enum value.
     *
     * @param privilegesRequiredString the string to convert
     * @returns the converted enum value
     */
    private static parsePrivilegesRequired(privilegesRequiredString: string): PrivilegesRequired {
        switch (privilegesRequiredString) {
            case "H":
                return PrivilegesRequired.HIGH;
            case "L":
                return PrivilegesRequired.LOW;
            case "N":
                return PrivilegesRequired.NONE;
        }
        throw new RangeError("Invalid CVSS v3 privileges required value: \"" + privilegesRequiredString + "\"");
    }

    /**
     * Converts a user interaction level, represented as a string, into an enum value.
     *
     * @param userInteractionString the string to convert
     * @returns the converted enum value
     */
    private static parseUserInteraction(userInteractionString: string): UserInteraction {
        switch (userInteractionString) {
            case "R":
                return UserInteraction.REQUIRED;
            case "N":
                return UserInteraction.NONE;
        }
        throw new RangeError("Invalid CVSS v3 user interaction value: \"" + userInteractionString + "\"");
    }

    /**
     * Converts a scope, represented as a string, into an enum value.
     *
     * @param scopeString the string to convert
     * @returns the converted enum value
     */
    private static parseScope(scopeString: string): Scope {
        switch (scopeString) {
            case "C":
                return Scope.CHANGED;
            case "U":
                return Scope.UNCHANGED;
        }
        throw new RangeError("Invalid CVSS v3 scope value: \"" + scopeString + "\"");
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
            case "L":
                return Impact.LOW;
            case "H":
                return Impact.HIGH;
        }
        throw new RangeError("Invalid CVSS v3 impact value: \"" + impactString + "\"");
    }

    /**
     * Converts an exploit code maturity level, represented as a string, into an enum value.
     *
     * @param exploitCodeMaturityString the string to convert
     * @returns the converted enum value
     */
    private static parseExploitCodeMaturity(exploitCodeMaturityString: string): ExploitCodeMaturity {
        switch (exploitCodeMaturityString) {
            case "X":
                return ExploitCodeMaturity.NOT_DEFINED;
            case "U":
                return ExploitCodeMaturity.UNPROVEN_THAT_EXPLOIT_EXISTS;
            case "P":
                return ExploitCodeMaturity.PROOF_OF_CONCEPT_CODE;
            case "F":
                return ExploitCodeMaturity.FUNCTIONAL_EXPLOIT_EXISTS;
            case "H":
                return ExploitCodeMaturity.HIGH;
        }
        throw new RangeError("Invalid CVSS v3 exploit code maturity value: \"" + exploitCodeMaturityString + "\"");
    }

    /**
     * Converts a remediation level, represented as a string, into an enum value.
     *
     * @param remediationLevelString the string to convert
     * @returns the converted enum value
     */
    private static parseRemediationLevel(remediationLevelString: string): RemediationLevel {
        switch (remediationLevelString) {
            case "X":
                return RemediationLevel.NOT_DEFINED;
            case "O":
                return RemediationLevel.OFFICIAL_FIX;
            case "T":
                return RemediationLevel.TEMPORARY_FIX;
            case "W":
                return RemediationLevel.WORKAROUND;
            case "U":
                return RemediationLevel.UNAVAILABLE;
        }
        throw new RangeError("Invalid CVSS v3 remediation level value: \"" + remediationLevelString + "\"");
    }

    /**
     * Converts a report confidence level, represented as a string, into an enum value.
     *
     * @param reportConfidenceString the string to convert
     * @returns the converted enum value
     */
    private static parseReportConfidence(reportConfidenceString: string): ReportConfidence {
        switch (reportConfidenceString) {
            case "X":
                return ReportConfidence.NOT_DEFINED;
            case "U":
                return ReportConfidence.UNKNOWN;
            case "R":
                return ReportConfidence.REASONABLE;
            case "C":
                return ReportConfidence.CONFIRMED;
        }
        throw new RangeError("Invalid CVSS v3 report confidence value: \"" + reportConfidenceString + "\"");
    }

    /**
     * Converts a modified attack vector, represented as a string, into an enum value.
     *
     * @param modifiedAttackVectorString the string to convert
     * @returns the converted enum value
     */
    private static parseModifiedAttackVector(modifiedAttackVectorString: string): AttackVector {
        switch (modifiedAttackVectorString) {
            case "X":
                return AttackVector.NOT_DEFINED;
            case "L":
                return AttackVector.LOCAL;
            case "A":
                return AttackVector.ADJACENT_NETWORK;
            case "N":
                return AttackVector.NETWORK;
            case "P":
                return AttackVector.PHYSICAL;
        }
        throw new RangeError("Invalid CVSS v3 modified attack vector value: \"" + modifiedAttackVectorString + "\"");
    }

    /**
     * Converts a modified attack complexity, represented as a string, into an enum value.
     *
     * @param modifiedAttackVectorString the string to convert
     * @returns the converted enum value
     */
    private static parseModifiedAttackComplexity(modifiedAttackComplexityString: string): AttackComplexity {
        switch (modifiedAttackComplexityString) {
            case "X":
                return AttackComplexity.NOT_DEFINED;
            case "H":
                return AttackComplexity.HIGH;
            case "L":
                return AttackComplexity.LOW;
        }
        throw new RangeError("Invalid CVSS v3 modified attack complexity value: \"" + modifiedAttackComplexityString + "\"");
    }

    /**
     * Converts a modified privileges requirement, represented as a string, into an enum value.
     *
     * @param modifiedPrivilegesRequiredString the string to convert
     * @returns the converted enum value
     */
    private static parseModifiedPrivilegesRequired(modifiedPrivilegesRequiredString: string): PrivilegesRequired {
        switch (modifiedPrivilegesRequiredString) {
            case "X":
                return PrivilegesRequired.NOT_DEFINED;
            case "H":
                return PrivilegesRequired.HIGH;
            case "L":
                return PrivilegesRequired.LOW;
            case "N":
                return PrivilegesRequired.NONE;
        }
        throw new RangeError("Invalid CVSS v3 privileges required value: \"" + modifiedPrivilegesRequiredString + "\"");
    }

    /**
     * Converts a modified user interaction level, represented as a string, into an enum value.
     *
     * @param modifiedUserInteractionString the string to convert
     * @returns the converted enum value
     */
    private static parseModifiedUserInteraction(modifiedUserInteractionString: string): UserInteraction {
        switch (modifiedUserInteractionString) {
            case "X":
                return UserInteraction.NOT_DEFINED;
            case "R":
                return UserInteraction.REQUIRED;
            case "N":
                return UserInteraction.NONE;
        }
        throw new RangeError("Invalid CVSS v3 modified user interaction value: \"" + modifiedUserInteractionString + "\"");
    }

    /**
     * Converts a modified scope, represented as a string, into an enum value.
     *
     * @param scopeString the string to convert
     * @returns the converted enum value
     */
    private static parseModifiedScope(modifiedScopeString: string): Scope {
        switch (modifiedScopeString) {
            case "X":
                return Scope.NOT_DEFINED;
            case "C":
                return Scope.CHANGED;
            case "U":
                return Scope.UNCHANGED;
        }
        throw new RangeError("Invalid CVSS v3 modified scope value: \"" + modifiedScopeString + "\"");
    }

    /**
     * Converts a modified impact magnitude, represented as a string, into an enum value.
     *
     * @param impactString the string to convert
     * @returns the converted enum value
     */
    private static parseModifiedImpact(modifiedImpactString: string): Impact {
        switch (modifiedImpactString) {
            case "X":
                return Impact.NOT_DEFINED;
            case "N":
                return Impact.NONE;
            case "L":
                return Impact.LOW;
            case "H":
                return Impact.HIGH;
        }
        throw new RangeError("Invalid CVSS v3 impact value: \"" + modifiedImpactString + "\"");
    }

    /**
     * Converts a security requirement, represented as a string, into an enum value.
     *
     * @param securityRequirementString the string to convert
     * @returns the converted enum value
     */
    private static parseSecurityRequirement(securityRequirementString: string): SecurityRequirement {
        switch (securityRequirementString) {
            case "X":
                return SecurityRequirement.NOT_DEFINED;
            case "L":
                return SecurityRequirement.LOW;
            case "M":
                return SecurityRequirement.MEDIUM;
            case "H":
                return SecurityRequirement.HIGH;
        }
        throw new RangeError("Invalid CVSS v3 security requirement value: \"" + securityRequirementString + "\"");
    }

    /**
     * Generates and returns a version-specific (CVSS v3.x) scoring engine loaded with a vector.
     *
     * @param vector the vector to load in to the scoring engine
     * @returns the loaded scoring engine
     */
    public generateScoringEngine(vector: string): Cvss3ScoringEngine {

        // Variable to hold vector with version prefix stripped.
        let strippedVector = vector;

        // Validate version prefix if present.
        let versionCheck = /^CVSS:(\d)\.(\d)\//.exec(strippedVector);
        if (versionCheck !== null) {
            if(versionCheck[1] !== "3" || (['0', '1'].indexOf(versionCheck[2]) === -1)) {
                throw RangeError("Bad version prefix. Ensure that the CVSS vector version prefix in use (if any) is "
                    + "'CVSS:3.0/' or 'CVSS:3.1/' if the vector is in either of these formats.");
            }
            strippedVector = strippedVector.replace(versionCheck[0], ""); // Strip vector.
        }

        // Get scoring engine ready.
        let cvss = new Cvss3ScoringEngine();

        // Split along slashes.
        let segments = strippedVector.split("/");
        for (let segment of segments) {

            // Split segment.
            let sections = segment.split(":");

            // Validate segment.
            if (sections.length != 2) {
                throw new RangeError("Invalid CVSS v3 vector segment: \"" + segment + "\"");
            }

            // Parse segment.
            switch(sections[0].toUpperCase()) {
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
    }

    /**
     * @inheritDoc
     */
    public parse (vector: string): CvssScore {

        // Return computed score.
        return this.generateScoringEngine(vector).computeScore();
    }
}