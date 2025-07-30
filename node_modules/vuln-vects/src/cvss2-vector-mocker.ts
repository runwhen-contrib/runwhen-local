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
    TargetDistribution,
} from "./cvss2-enums";
import { CvssVectorMocker } from "./cvss-vector-mocker";
import { Cvss2ScoringEngine } from "./cvss2-scoring-engine";


/**
 * A mocking service for generating random CVSS v2 vectors.
 *
 * @public
 */
export class Cvss2VectorMocker extends CvssVectorMocker {

    /**
     * Gets a random CVSS v2 access vector.
     *
     * @returns a random CVSS v2 access vector
     */
    private static getRandomAccessVector(): AccessVector {
        return CvssVectorMocker.takeRandom([
            AccessVector.LOCAL,
            AccessVector.ADJACENT_NETWORK,
            AccessVector.NETWORK,
        ]);
    }

    /**
     * Gets a random CVSS v2 access complexity.
     *
     * @returns a random CVSS v2 access complexity
     */
    private static getRandomAccessComplexity(): AccessComplexity {
        return CvssVectorMocker.takeRandom([
            AccessComplexity.LOW,
            AccessComplexity.MEDIUM,
            AccessComplexity.HIGH,
        ]);
    }

    /**
     * Gets a random CVSS v2 authentication.
     *
     * @returns a random CVSS v2 authentication
     */
    private static getRandomAuthentication(): Authentication {
        return CvssVectorMocker.takeRandom([
            Authentication.MULTIPLE,
            Authentication.SINGLE,
            Authentication.NONE,
        ]);
    }

    /**
     * Gets a random CVSS v2 collateral damage potential.
     *
     * @returns a random CVSS v2 collateral damage potential
     */
    private static getRandomCollateralDamagePotential(): CollateralDamagePotential {
        return CvssVectorMocker.takeRandom([
            CollateralDamagePotential.NOT_DEFINED,
            CollateralDamagePotential.NONE,
            CollateralDamagePotential.LOW,
            CollateralDamagePotential.LOW_MEDIUM,
            CollateralDamagePotential.MEDIUM_HIGH,
            CollateralDamagePotential.HIGH,
        ]);
    }

    /**
     * Gets a random CVSS v2 exploitability.
     *
     * @returns a random CVSS v2 exploitability
     */
    private static getRandomExploitability(): Exploitability {
        return CvssVectorMocker.takeRandom([
            Exploitability.NOT_DEFINED,
            Exploitability.UNPROVEN_THAT_EXPLOIT_EXISTS,
            Exploitability.PROOF_OF_CONCEPT_CODE,
            Exploitability.FUNCTIONAL_EXPLOIT_EXISTS,
            Exploitability.HIGH,
        ]);
    }

    /**
     * Gets a random CVSS v2 impact subscore.
     *
     * @returns a random CVSS v2 impact subscore
     */
    private static getRandomImpactSubscore(): ImpactSubscore {
        return CvssVectorMocker.takeRandom([
            ImpactSubscore.NOT_DEFINED,
            ImpactSubscore.LOW,
            ImpactSubscore.MEDIUM,
            ImpactSubscore.HIGH,
        ]);
    }

    /**
     * Gets a random CVSS v2 impact.
     *
     * @returns a random CVSS v2 impact
     */
    private static getRandomImpact(): Impact {
        return CvssVectorMocker.takeRandom([
            Impact.NONE,
            Impact.PARTIAL,
            Impact.COMPLETE,
        ]);
    }

    /**
     * Gets a random CVSS v2 remediation level.
     *
     * @returns a random CVSS v2 remediation level
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
     * Gets a random CVSS v2 report confidence.
     *
     * @returns a random CVSS v2 report confidence
     */
    private static getRandomReportConfidence(): ReportConfidence {
        return CvssVectorMocker.takeRandom([
            ReportConfidence.NOT_DEFINED,
            ReportConfidence.UNCONFIRMED,
            ReportConfidence.UNCORROBORATED,
            ReportConfidence.CONFIRMED,
        ]);
    }

    /**
     * Gets a random CVSS v2 target distribution.
     *
     * @returns a random CVSS v2 target distribution
     */
    private static getRandomTargetDistribution(): TargetDistribution {
        return CvssVectorMocker.takeRandom([
            TargetDistribution.NOT_DEFINED,
            TargetDistribution.NONE,
            TargetDistribution.LOW,
            TargetDistribution.MEDIUM,
            TargetDistribution.HIGH,
        ]);
    }

    /**
     * Generates and returns a randomly-initialized CVSS v2 scoring engine.
     *
     * @returns a randomly-initialized CVSS v2 scoring engine
     */
    public generate(): Cvss2ScoringEngine {

        // Base metrics must be included
        const scoringEngine = new Cvss2ScoringEngine();
        scoringEngine.accessVector = Cvss2VectorMocker.getRandomAccessVector();
        scoringEngine.accessComplexity = Cvss2VectorMocker.getRandomAccessComplexity();
        scoringEngine.authentication = Cvss2VectorMocker.getRandomAuthentication();
        scoringEngine.confidentialityImpact = Cvss2VectorMocker.getRandomImpact();
        scoringEngine.integrityImpact = Cvss2VectorMocker.getRandomImpact();
        scoringEngine.availabilityImpact = Cvss2VectorMocker.getRandomImpact();

        // If requested, include temporal metrics.
        if (this.includeTemporal) {
            scoringEngine.exploitability = Cvss2VectorMocker.getRandomExploitability();
            scoringEngine.remediationLevel = Cvss2VectorMocker.getRandomRemediationLevel();
            scoringEngine.reportConfidence = Cvss2VectorMocker.getRandomReportConfidence();
        }

        // If requsted, include environmental metrics.
        if (this.includeEnvironmental) {
            scoringEngine.collateralDamagePotential = Cvss2VectorMocker.getRandomCollateralDamagePotential();
            scoringEngine.targetDistribution = Cvss2VectorMocker.getRandomTargetDistribution();
            scoringEngine.confidentialityRequirement = Cvss2VectorMocker.getRandomImpactSubscore();
            scoringEngine.integrityRequirement = Cvss2VectorMocker.getRandomImpactSubscore();
            scoringEngine.availabilityRequirement = Cvss2VectorMocker.getRandomImpactSubscore();
        }

        // Return ramdomly-initialized scoring engine.
        return scoringEngine;
    }
}