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
var cvss3_enums_1 = require("./cvss3-enums");
var cvss_vector_mocker_1 = require("./cvss-vector-mocker");
var cvss3_scoring_engine_1 = require("./cvss3-scoring-engine");
/**
 * A mocking service for generating random CVSS v2 vectors.
 *
 * @public
 */
var Cvss3VectorMocker = /** @class */ (function (_super) {
    __extends(Cvss3VectorMocker, _super);
    function Cvss3VectorMocker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Gets a random CVSS v3.x attack vector.
     *
     * @returns a random CVSS v3.x attack vector
     */
    Cvss3VectorMocker.getRandomAttackVector = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss3_enums_1.AttackVector.PHYSICAL,
            cvss3_enums_1.AttackVector.LOCAL,
            cvss3_enums_1.AttackVector.ADJACENT_NETWORK,
            cvss3_enums_1.AttackVector.NETWORK,
        ]);
    };
    /**
     * Gets a random CVSS v3.x attack complexity.
     *
     * @returns a random CVSS v3.x attack complexity
     */
    Cvss3VectorMocker.getRandomAttackComplexity = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss3_enums_1.AttackComplexity.LOW,
            cvss3_enums_1.AttackComplexity.HIGH,
        ]);
    };
    /**
     * Gets a random CVSS v3.x privileges required.
     *
     * @returns a random CVSS v3.x privileges required
     */
    Cvss3VectorMocker.getRandomPrivilegesRequired = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss3_enums_1.PrivilegesRequired.NONE,
            cvss3_enums_1.PrivilegesRequired.LOW,
            cvss3_enums_1.PrivilegesRequired.HIGH,
        ]);
    };
    /**
     * Gets a random CVSS v3.x user interaction.
     *
     * @returns a random CVSS v3.x user interaction
     */
    Cvss3VectorMocker.getRandomUserInteraction = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss3_enums_1.UserInteraction.NONE,
            cvss3_enums_1.UserInteraction.REQUIRED,
        ]);
    };
    /**
     * Gets a random CVSS v3.x scope.
     *
     * @returns a random CVSS v3.x scope
     */
    Cvss3VectorMocker.getRandomScope = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss3_enums_1.Scope.UNCHANGED,
            cvss3_enums_1.Scope.CHANGED,
        ]);
    };
    /**
     * Gets a random CVSS v3.x impact
     *
     * @returns a random CVSS v3.x impact
     */
    Cvss3VectorMocker.getRandomImpact = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss3_enums_1.Impact.NONE,
            cvss3_enums_1.Impact.LOW,
            cvss3_enums_1.Impact.HIGH,
        ]);
    };
    /**
     * Gets a random CVSS v3.x exploit code maturity.
     *
     * @returns a random CVSS v3.x exploit code maturity.
     */
    Cvss3VectorMocker.getRandomExploitCodeMaturity = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss3_enums_1.ExploitCodeMaturity.NOT_DEFINED,
            cvss3_enums_1.ExploitCodeMaturity.UNPROVEN_THAT_EXPLOIT_EXISTS,
            cvss3_enums_1.ExploitCodeMaturity.PROOF_OF_CONCEPT_CODE,
            cvss3_enums_1.ExploitCodeMaturity.FUNCTIONAL_EXPLOIT_EXISTS,
            cvss3_enums_1.ExploitCodeMaturity.HIGH,
        ]);
    };
    /**
     * Gets a random CVSS v3.x remediation level.
     *
     * @returns a random CVSS v3.x remediation level
     */
    Cvss3VectorMocker.getRandomRemediationLevel = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss3_enums_1.RemediationLevel.NOT_DEFINED,
            cvss3_enums_1.RemediationLevel.OFFICIAL_FIX,
            cvss3_enums_1.RemediationLevel.TEMPORARY_FIX,
            cvss3_enums_1.RemediationLevel.WORKAROUND,
            cvss3_enums_1.RemediationLevel.UNAVAILABLE,
        ]);
    };
    /**
     * Gets a random CVSS v3.x report confidence.
     *
     * @returns a random CVSS v3.x report confidence
     */
    Cvss3VectorMocker.getRandomReportConfidence = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss3_enums_1.ReportConfidence.NOT_DEFINED,
            cvss3_enums_1.ReportConfidence.UNKNOWN,
            cvss3_enums_1.ReportConfidence.REASONABLE,
            cvss3_enums_1.ReportConfidence.CONFIRMED,
        ]);
    };
    /**
     * Gets a random CVSS v3.x security requirement.
     *
     * @returns a random CVSS v3.x security requirement
     */
    Cvss3VectorMocker.getRandomSecurityRequirement = function () {
        return cvss_vector_mocker_1.CvssVectorMocker.takeRandom([
            cvss3_enums_1.SecurityRequirement.NOT_DEFINED,
            cvss3_enums_1.SecurityRequirement.LOW,
            cvss3_enums_1.SecurityRequirement.MEDIUM,
            cvss3_enums_1.SecurityRequirement.HIGH,
        ]);
    };
    /**
     * Generates and returns a randomly-initialized CVSS v2 scoring engine.
     *
     * @returns a randomly-initialized CVSS v2 scoring engine
     */
    Cvss3VectorMocker.prototype.generate = function () {
        // Base metrics must be included
        var scoringEngine = new cvss3_scoring_engine_1.Cvss3ScoringEngine();
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
    };
    return Cvss3VectorMocker;
}(cvss_vector_mocker_1.CvssVectorMocker));
exports.Cvss3VectorMocker = Cvss3VectorMocker;
