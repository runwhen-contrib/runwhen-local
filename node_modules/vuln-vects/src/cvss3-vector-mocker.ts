import {
    AttackComplexity,
    AttackVector,
    ExploitCodeMaturity,
    Impact,
    PrivilegesRequired,
    RemediationLevel,
    ReportConfidence,
    Scope,
    SecurityRequirement,
    UserInteraction,
} from "./cvss3-enums";
import { CvssVectorMocker } from "./cvss-vector-mocker";
import { Cvss3ScoringEngine } from "./cvss3-scoring-engine";


/**
 * A mocking service for generating random CVSS v2 vectors.
 *
 * @public
 */
export class Cvss3VectorMocker extends CvssVectorMocker {

    /**
     * Gets a random CVSS v3.x attack vector.
     *
     * @returns a random CVSS v3.x attack vector
     */
    private static getRandomAttackVector(): AttackVector {
        return CvssVectorMocker.takeRandom([
            AttackVector.PHYSICAL,
            AttackVector.LOCAL,
            AttackVector.ADJACENT_NETWORK,
            AttackVector.NETWORK,
        ]);
    }

    /**
     * Gets a random CVSS v3.x attack complexity.
     *
     * @returns a random CVSS v3.x attack complexity
     */
    private static getRandomAttackComplexity(): AttackComplexity {
        return CvssVectorMocker.takeRandom([
            AttackComplexity.LOW,
            AttackComplexity.HIGH,
        ]);
    }

    /**
     * Gets a random CVSS v3.x privileges required.
     *
     * @returns a random CVSS v3.x privileges required
     */
    private static getRandomPrivilegesRequired(): PrivilegesRequired {
        return CvssVectorMocker.takeRandom([
            PrivilegesRequired.NONE,
            PrivilegesRequired.LOW,
            PrivilegesRequired.HIGH,
        ]);
    }

    /**
     * Gets a random CVSS v3.x user interaction.
     *
     * @returns a random CVSS v3.x user interaction
     */
    private static getRandomUserInteraction(): UserInteraction {
        return CvssVectorMocker.takeRandom([
            UserInteraction.NONE,
            UserInteraction.REQUIRED,
        ]);
    }

    /**
     * Gets a random CVSS v3.x scope.
     *
     * @returns a random CVSS v3.x scope
     */
    private static getRandomScope(): Scope {
        return CvssVectorMocker.takeRandom([
            Scope.UNCHANGED,
            Scope.CHANGED,
        ]);
    }

    /**
     * Gets a random CVSS v3.x impact
     *
     * @returns a random CVSS v3.x impact
     */
    private static getRandomImpact(): Impact {
        return CvssVectorMocker.takeRandom([
            Impact.NONE,
            Impact.LOW,
            Impact.HIGH,
        ]);
    }

    /**
     * Gets a random CVSS v3.x exploit code maturity.
     *
     * @returns a random CVSS v3.x exploit code maturity.
     */
    private static getRandomExploitCodeMaturity(): ExploitCodeMaturity {
        return CvssVectorMocker.takeRandom([
            ExploitCodeMaturity.NOT_DEFINED,
            ExploitCodeMaturity.UNPROVEN_THAT_EXPLOIT_EXISTS,
            ExploitCodeMaturity.PROOF_OF_CONCEPT_CODE,
            ExploitCodeMaturity.FUNCTIONAL_EXPLOIT_EXISTS,
            ExploitCodeMaturity.HIGH,
        ]);
    }

    /**
     * Gets a random CVSS v3.x remediation level.
     *
     * @returns a random CVSS v3.x remediation level
     */
    private static getRandomRemediationLevel(): RemediationLevel {
        return CvssVectorMocker.takeRandom([
            RemediationLevel.NOT_DEFINED,
            RemediationLevel.OFFICIAL_FIX,
            RemediationLevel.TEMPORARY_FIX,
            RemediationLevel.WORKAROUND,
            RemediationLevel.UNAVAILABLE,
        ]);
    }

    /**
     * Gets a random CVSS v3.x report confidence.
     *
     * @returns a random CVSS v3.x report confidence
     */
    private static getRandomReportConfidence(): ReportConfidence {
        return CvssVectorMocker.takeRandom([
            ReportConfidence.NOT_DEFINED,
            ReportConfidence.UNKNOWN,
            ReportConfidence.REASONABLE,
            ReportConfidence.CONFIRMED,
        ]);
    }

    /**
     * Gets a random CVSS v3.x security requirement.
     *
     * @returns a random CVSS v3.x security requirement
     */
    private static getRandomSecurityRequirement(): SecurityRequirement {
        return CvssVectorMocker.takeRandom([
            SecurityRequirement.NOT_DEFINED,
            SecurityRequirement.LOW,
            SecurityRequirement.MEDIUM,
            SecurityRequirement.HIGH,
        ]);
    }

    /**
     * Generates and returns a randomly-initialized CVSS v2 scoring engine.
     *
     * @returns a randomly-initialized CVSS v2 scoring engine
     */
    public generate(): Cvss3ScoringEngine {

        // Base metrics must be included
        const scoringEngine = new Cvss3ScoringEngine();
        scoringEngine.attackVector = Cvss3VectorMocker.getRandomAttackVector();
        scoringEngine.attackComplexity = Cvss3VectorMocker.getRandomAttackComplexity();
        scoringEngine.privilegesRequired = Cvss3VectorMocker.getRandomPrivilegesRequired();
        scoringEngine.userInteraction = Cvss3VectorMocker.getRandomUserInteraction();
        scoringEngine.scope = Cvss3VectorMocker.getRandomScope();
        scoringEngine.confidentialityImpact = Cvss3VectorMocker.getRandomImpact();
        scoringEngine.integrityImpact = Cvss3VectorMocker.getRandomImpact();
        scoringEngine.availabilityImpact = Cvss3VectorMocker.getRandomImpact();

        // If requested, include temporal metrics.
        if (this.includeTemporal) {
            scoringEngine.exploitCodeMaturity = Cvss3VectorMocker.getRandomExploitCodeMaturity();
            scoringEngine.remediationLevel = Cvss3VectorMocker.getRandomRemediationLevel();
            scoringEngine.reportConfidence = Cvss3VectorMocker.getRandomReportConfidence();
        }

        // If requsted, include environmental metrics.
        if (this.includeEnvironmental) {
            scoringEngine.modifiedAttackVector = Cvss3VectorMocker.getRandomAttackVector();
            scoringEngine.modifiedAttackComplexity = Cvss3VectorMocker.getRandomAttackComplexity();
            scoringEngine.modifiedPrivilegesRequired = Cvss3VectorMocker.getRandomPrivilegesRequired();
            scoringEngine.modifiedUserInteraction = Cvss3VectorMocker.getRandomUserInteraction();
            scoringEngine.modifiedScope = Cvss3VectorMocker.getRandomScope();
            scoringEngine.modifiedConfidentialityImpact = Cvss3VectorMocker.getRandomImpact();
            scoringEngine.modifiedIntegrityImpact = Cvss3VectorMocker.getRandomImpact();
            scoringEngine.modifiedAvailabilityImpact = Cvss3VectorMocker.getRandomImpact();
            scoringEngine.confidentialityRequirement = Cvss3VectorMocker.getRandomSecurityRequirement();
            scoringEngine.integrityRequirement = Cvss3VectorMocker.getRandomSecurityRequirement();
            scoringEngine.availabilityRequirement = Cvss3VectorMocker.getRandomSecurityRequirement();
        }

        // Return ramdomly-initialized scoring engine.
        return scoringEngine;
    }
}