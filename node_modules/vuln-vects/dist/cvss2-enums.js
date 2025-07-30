"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An enumeration of possible access vectors associated with a vulnerability.
 *
 * @public
 */
var AccessVector;
(function (AccessVector) {
    /**
     * Denotes an undefined value.
     */
    AccessVector[AccessVector["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes that the vulnerability can only be exploited with local system access.
     */
    AccessVector[AccessVector["LOCAL"] = 1] = "LOCAL";
    /**
     * Denotes that the vulnerability can only be exploited with adjacent network access.
     */
    AccessVector[AccessVector["ADJACENT_NETWORK"] = 2] = "ADJACENT_NETWORK";
    /**
     * Denotes that the vulnerability can be exploited with network access (i.e. remotely).
     */
    AccessVector[AccessVector["NETWORK"] = 3] = "NETWORK";
})(AccessVector = exports.AccessVector || (exports.AccessVector = {}));
/**
 * An enumeration of possible access complexities associated with a vulnerability.
 *
 * @public
 */
var AccessComplexity;
(function (AccessComplexity) {
    /**
     * Denotes an undefined value.
     */
    AccessComplexity[AccessComplexity["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes low access complexity.
     */
    AccessComplexity[AccessComplexity["LOW"] = 1] = "LOW";
    /**
     * Denotes medium access complexity.
     */
    AccessComplexity[AccessComplexity["MEDIUM"] = 2] = "MEDIUM";
    /**
     * Denotes high access complexity.
     */
    AccessComplexity[AccessComplexity["HIGH"] = 3] = "HIGH";
})(AccessComplexity = exports.AccessComplexity || (exports.AccessComplexity = {}));
/**
 * An enumeration of possible authentication requirements associated with a vulnerability.
 *
 * @public
 */
var Authentication;
(function (Authentication) {
    /**
     * Denotes an undefined value.
     */
    Authentication[Authentication["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes that multiple authenticated accounts are required to exploit the vulnerability.
     */
    Authentication[Authentication["MULTIPLE"] = 1] = "MULTIPLE";
    /**
     * Denotes that a single authenticated account is required to exploit the vulnerability.
     */
    Authentication[Authentication["SINGLE"] = 2] = "SINGLE";
    /**
     * Denotes that a no authenticated account is required to exploit the vulnerability.
     */
    Authentication[Authentication["NONE"] = 3] = "NONE";
})(Authentication = exports.Authentication || (exports.Authentication = {}));
/**
 * An enumeration of possible collateral damage potentials associated with a vulnerability.
 *
 * @public
 */
var CollateralDamagePotential;
(function (CollateralDamagePotential) {
    /**
     * Denotes an undefined value.
     */
    CollateralDamagePotential[CollateralDamagePotential["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes that there is no potential for collateral damage stemming from the vulnerability.
     */
    CollateralDamagePotential[CollateralDamagePotential["NONE"] = 1] = "NONE";
    /**
     * Denotes that there is low potential for collateral damage stemming from the vulnerability.
     */
    CollateralDamagePotential[CollateralDamagePotential["LOW"] = 2] = "LOW";
    /**
     * Denotes that there is low-medium potential for collateral damage stemming from the vulnerability.
     */
    CollateralDamagePotential[CollateralDamagePotential["LOW_MEDIUM"] = 3] = "LOW_MEDIUM";
    /**
     * Denotes that there is medium-high potential for collateral damage stemming from the vulnerability.
     */
    CollateralDamagePotential[CollateralDamagePotential["MEDIUM_HIGH"] = 4] = "MEDIUM_HIGH";
    /**
     * Denotes that there is high potential for collateral damage stemming from the vulnerability.
     */
    CollateralDamagePotential[CollateralDamagePotential["HIGH"] = 5] = "HIGH";
})(CollateralDamagePotential = exports.CollateralDamagePotential || (exports.CollateralDamagePotential = {}));
/**
 * An enumeration of possible exploitability levels associated with a vulnerability.
 *
 * @public
 */
var Exploitability;
(function (Exploitability) {
    /**
     * Denotes an undefined value.
     */
    Exploitability[Exploitability["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes that it is unproven that an exploit for the vulnerability exists.
     */
    Exploitability[Exploitability["UNPROVEN_THAT_EXPLOIT_EXISTS"] = 1] = "UNPROVEN_THAT_EXPLOIT_EXISTS";
    /**
     * Denotes that proof of concept code for exploiting the vulnerability exists.
     */
    Exploitability[Exploitability["PROOF_OF_CONCEPT_CODE"] = 2] = "PROOF_OF_CONCEPT_CODE";
    /**
     * Denotes that a functional exploit for the vulnerability exists.
     */
    Exploitability[Exploitability["FUNCTIONAL_EXPLOIT_EXISTS"] = 3] = "FUNCTIONAL_EXPLOIT_EXISTS";
    /**
     * Denotes that a weaponised exploit for the vulnerability is readily available.
     */
    Exploitability[Exploitability["HIGH"] = 4] = "HIGH";
})(Exploitability = exports.Exploitability || (exports.Exploitability = {}));
/**
 * An enumeration of possible impact subscores associated with a vulnerability.
 *
 * @public
 */
var ImpactSubscore;
(function (ImpactSubscore) {
    /**
     * Denotes an undefined value.
     */
    ImpactSubscore[ImpactSubscore["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes low impact.
     */
    ImpactSubscore[ImpactSubscore["LOW"] = 1] = "LOW";
    /**
     * Denotes medium impact.
     */
    ImpactSubscore[ImpactSubscore["MEDIUM"] = 2] = "MEDIUM";
    /**
     * Denotes high impact.
     */
    ImpactSubscore[ImpactSubscore["HIGH"] = 3] = "HIGH";
})(ImpactSubscore = exports.ImpactSubscore || (exports.ImpactSubscore = {}));
/**
 * An enumeration of possible impact magnitudes associated with a vulnerability.
 *
 * @public
 */
var Impact;
(function (Impact) {
    /**
     * Denotes an undefined value.
     */
    Impact[Impact["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes no impact.
     */
    Impact[Impact["NONE"] = 1] = "NONE";
    /**
     * Denotes partial impact.
     */
    Impact[Impact["PARTIAL"] = 2] = "PARTIAL";
    /**
     * Denotes complete impact.
     */
    Impact[Impact["COMPLETE"] = 3] = "COMPLETE";
})(Impact = exports.Impact || (exports.Impact = {}));
/**
 * An enumeration of possible remediation levels associated with a vulnerability.
 *
 * @public
 */
var RemediationLevel;
(function (RemediationLevel) {
    /**
     * Denotes an undefined value.
     */
    RemediationLevel[RemediationLevel["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes that an official fix has been released by the vendor for the vulnerability.
     */
    RemediationLevel[RemediationLevel["OFFICIAL_FIX"] = 1] = "OFFICIAL_FIX";
    /**
     * Denotes that an temporary fix has been released for the vulnerability.
     */
    RemediationLevel[RemediationLevel["TEMPORARY_FIX"] = 2] = "TEMPORARY_FIX";
    /**
     * Denotes that a workaround (e.g. configuration change) is available for the vulnerability.
     */
    RemediationLevel[RemediationLevel["WORKAROUND"] = 3] = "WORKAROUND";
    /**
     * Denotes that there is currently no known remediation for the vulnerability.
     */
    RemediationLevel[RemediationLevel["UNAVAILABLE"] = 4] = "UNAVAILABLE";
})(RemediationLevel = exports.RemediationLevel || (exports.RemediationLevel = {}));
/**
 * An enumeration of possible report confidence levels associated with a vulnerability.
 *
 * @public
 */
var ReportConfidence;
(function (ReportConfidence) {
    /**
     * Denotes an undefined value.
     */
    ReportConfidence[ReportConfidence["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes that the existence of the vulnerability is unconfirmed.
     */
    ReportConfidence[ReportConfidence["UNCONFIRMED"] = 1] = "UNCONFIRMED";
    /**
     * Denotes that the existence of the vulnerability is confirmed, but has not been successfully reproduced elsewhere
     * (i.e. corroborated).
     */
    ReportConfidence[ReportConfidence["UNCORROBORATED"] = 2] = "UNCORROBORATED";
    /**
     * Denotes that the existence of the vulnerability is definitively confirmed.
     */
    ReportConfidence[ReportConfidence["CONFIRMED"] = 3] = "CONFIRMED";
})(ReportConfidence = exports.ReportConfidence || (exports.ReportConfidence = {}));
/**
 * An enumeration of possible target distribution levels associated with a vulnerability.
 *
 * @public
 */
var TargetDistribution;
(function (TargetDistribution) {
    /**
     * Denotes an undefined value.
     */
    TargetDistribution[TargetDistribution["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes that no vulnerable targets currently exist.
     */
    TargetDistribution[TargetDistribution["NONE"] = 1] = "NONE";
    /**
     * Denotes that few vulnerable targets currently exist.
     */
    TargetDistribution[TargetDistribution["LOW"] = 2] = "LOW";
    /**
     * Denotes that a significant number vulnerable targets currently exist.
     */
    TargetDistribution[TargetDistribution["MEDIUM"] = 3] = "MEDIUM";
    /**
     * Denotes that vulnerable targets are widespread.
     */
    TargetDistribution[TargetDistribution["HIGH"] = 4] = "HIGH";
})(TargetDistribution = exports.TargetDistribution || (exports.TargetDistribution = {}));
/**
 * An object containing all enums bundled for export.
 */
exports.enums = {
    AccessVector: AccessVector,
    AccessComplexity: AccessComplexity,
    Authentication: Authentication,
    CollateralDamagePotential: CollateralDamagePotential,
    Exploitability: Exploitability,
    ImpactSubscore: ImpactSubscore,
    Impact: Impact,
    RemediationLevel: RemediationLevel,
    ReportConfidence: ReportConfidence,
    TargetDistribution: TargetDistribution,
};
