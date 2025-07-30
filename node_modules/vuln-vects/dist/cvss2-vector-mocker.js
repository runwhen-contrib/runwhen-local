"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var cvss2_enums_1 = require("./cvss2-enums");
var cvss_vector_mocker_1 = require("./cvss-vector-mocker");
var cvss2_scoring_engine_1 = require("./cvss2-scoring-engine");
/**
 * A mocking service for generating random CVSS v2 vectors.
 *
 * @public
 */
var Cvss2VectorMocker = /** @class */ (function (_super) {
    __extends(Cvss2VectorMocker, _super);
    function Cvss2VectorMocker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets a random CVSS v2 access vector.
     *
     * @returns a random CVSS v2 access vector
     */
    Cvss2VectorMocker.getRandomAccessVector = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss2_enums_1.AccessVector.LOCAL,
            cvss2_enums_1.AccessVector.ADJACENT_NETWORK,
            cvss2_enums_1.AccessVector.NETWORK,
        ]);
    };
    /**
     * Gets a random CVSS v2 access complexity.
     *
     * @returns a random CVSS v2 access complexity
     */
    Cvss2VectorMocker.getRandomAccessComplexity = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss2_enums_1.AccessComplexity.LOW,
            cvss2_enums_1.AccessComplexity.MEDIUM,
            cvss2_enums_1.AccessComplexity.HIGH,
        ]);
    };
    /**
     * Gets a random CVSS v2 authentication.
     *
     * @returns a random CVSS v2 authentication
     */
    Cvss2VectorMocker.getRandomAuthentication = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss2_enums_1.Authentication.MULTIPLE,
            cvss2_enums_1.Authentication.SINGLE,
            cvss2_enums_1.Authentication.NONE,
        ]);
    };
    /**
     * Gets a random CVSS v2 collateral damage potential.
     *
     * @returns a random CVSS v2 collateral damage potential
     */
    Cvss2VectorMocker.getRandomCollateralDamagePotential = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss2_enums_1.CollateralDamagePotential.NOT_DEFINED,
            cvss2_enums_1.CollateralDamagePotential.NONE,
            cvss2_enums_1.CollateralDamagePotential.LOW,
            cvss2_enums_1.CollateralDamagePotential.LOW_MEDIUM,
            cvss2_enums_1.CollateralDamagePotential.MEDIUM_HIGH,
            cvss2_enums_1.CollateralDamagePotential.HIGH,
        ]);
    };
    /**
     * Gets a random CVSS v2 exploitability.
     *
     * @returns a random CVSS v2 exploitability
     */
    Cvss2VectorMocker.getRandomExploitability = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss2_enums_1.Exploitability.NOT_DEFINED,
            cvss2_enums_1.Exploitability.UNPROVEN_THAT_EXPLOIT_EXISTS,
            cvss2_enums_1.Exploitability.PROOF_OF_CONCEPT_CODE,
            cvss2_enums_1.Exploitability.FUNCTIONAL_EXPLOIT_EXISTS,
            cvss2_enums_1.Exploitability.HIGH,
        ]);
    };
    /**
     * Gets a random CVSS v2 impact subscore.
     *
     * @returns a random CVSS v2 impact subscore
     */
    Cvss2VectorMocker.getRandomImpactSubscore = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss2_enums_1.ImpactSubscore.NOT_DEFINED,
            cvss2_enums_1.ImpactSubscore.LOW,
            cvss2_enums_1.ImpactSubscore.MEDIUM,
            cvss2_enums_1.ImpactSubscore.HIGH,
        ]);
    };
    /**
     * Gets a random CVSS v2 impact.
     *
     * @returns a random CVSS v2 impact
     */
    Cvss2VectorMocker.getRandomImpact = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss2_enums_1.Impact.NONE,
            cvss2_enums_1.Impact.PARTIAL,
            cvss2_enums_1.Impact.COMPLETE,
        ]);
    };
    /**
     * Gets a random CVSS v2 remediation level.
     *
     * @returns a random CVSS v2 remediation level
     */
    Cvss2VectorMocker.getRandomRemediationLevel = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss2_enums_1.RemediationLevel.NOT_DEFINED,
            cvss2_enums_1.RemediationLevel.OFFICIAL_FIX,
            cvss2_enums_1.RemediationLevel.TEMPORARY_FIX,
            cvss2_enums_1.RemediationLevel.WORKAROUND,
            cvss2_enums_1.RemediationLevel.UNAVAILABLE,
        ]);
    };
    /**
     * Gets a random CVSS v2 report confidence.
     *
     * @returns a random CVSS v2 report confidence
     */
    Cvss2VectorMocker.getRandomReportConfidence = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss2_enums_1.ReportConfidence.NOT_DEFINED,
            cvss2_enums_1.ReportConfidence.UNCONFIRMED,
            cvss2_enums_1.ReportConfidence.UNCORROBORATED,
            cvss2_enums_1.ReportConfidence.CONFIRMED,
        ]);
    };
    /**
     * Gets a random CVSS v2 target distribution.
     *
     * @returns a random CVSS v2 target distribution
     */
    Cvss2VectorMocker.getRandomTargetDistribution = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss2_enums_1.TargetDistribution.NOT_DEFINED,
            cvss2_enums_1.TargetDistribution.NONE,
            cvss2_enums_1.TargetDistribution.LOW,
            cvss2_enums_1.TargetDistribution.MEDIUM,
            cvss2_enums_1.TargetDistribution.HIGH,
        ]);
    };
    /**
     * Generates and returns a randomly-initialized CVSS v2 scoring engine.
     *
     * @returns a randomly-initialized CVSS v2 scoring engine
     */
    Cvss2VectorMocker.prototype.generate = function () {
        // Base metrics must be included
        var scoringEngine = new cvss2_scoring_engine_1.Cvss2ScoringEngine();
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
    };
    return Cvss2VectorMocker;
}(cvss_vector_mocker_1.CvssVectorMocker));
exports.Cvss2VectorMocker = Cvss2VectorMocker;
