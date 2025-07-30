"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An enumeration of possible attack vectors associated with a vulnerability.
 *
 * @public
 */
var AttackVector;
(function (AttackVector) {
    /**
     * Denotes an undefined value.
     */
    AttackVector[AttackVector["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes that the vulnerability can be exploited with network access (i.e. remotely).
     */
    AttackVector[AttackVector["NETWORK"] = 1] = "NETWORK";
    /**
     * Denotes that the vulnerability can only be exploited with adjacent network access.
     */
    AttackVector[AttackVector["ADJACENT_NETWORK"] = 2] = "ADJACENT_NETWORK";
    /**
     * Denotes that the vulnerability can only be exploited with local system access.
     */
    AttackVector[AttackVector["LOCAL"] = 3] = "LOCAL";
    /**
     * Denotes that the vulnerability can only be exploited with physical system access.
     */
    AttackVector[AttackVector["PHYSICAL"] = 4] = "PHYSICAL";
})(AttackVector = exports.AttackVector || (exports.AttackVector = {}));
/**
 * An enumeration of possible attack complexities associated with a vulnerability.
 *
 * @public
 */
var AttackComplexity;
(function (AttackComplexity) {
    /**
     * Denotes an undefined value.
     */
    AttackComplexity[AttackComplexity["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes low attack complexity.
     */
    AttackComplexity[AttackComplexity["LOW"] = 1] = "LOW";
    /**
     * Denotes high attack complexity.
     */
    AttackComplexity[AttackComplexity["HIGH"] = 2] = "HIGH";
})(AttackComplexity = exports.AttackComplexity || (exports.AttackComplexity = {}));
/**
 * An enumeration of possible privilege requirements associated with a vulnerability.
 *
 * @public
 */
var PrivilegesRequired;
(function (PrivilegesRequired) {
    /**
     * Denotes an undefined value.
     */
    PrivilegesRequired[PrivilegesRequired["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes that a no privileges are required to exploit the vulnerability.
     */
    PrivilegesRequired[PrivilegesRequired["NONE"] = 1] = "NONE";
    /**
     * Denotes that a regular user privileges are required to exploit the vulnerability.
     */
    PrivilegesRequired[PrivilegesRequired["LOW"] = 2] = "LOW";
    /**
     * Denotes that a administrator privileges are required to exploit the vulnerability.
     */
    PrivilegesRequired[PrivilegesRequired["HIGH"] = 3] = "HIGH";
})(PrivilegesRequired = exports.PrivilegesRequired || (exports.PrivilegesRequired = {}));
/**
 * An enumeration of possible user interaction requirements associated with a vulnerability.
 *
 * @public
 */
var UserInteraction;
(function (UserInteraction) {
    /**
     * Denotes an undefined value.
     */
    UserInteraction[UserInteraction["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes that no user interaction is required to exploite the vulnerability.
     */
    UserInteraction[UserInteraction["NONE"] = 1] = "NONE";
    /**
     * Denotes that some user interaction is required to exploite the vulnerability.
     */
    UserInteraction[UserInteraction["REQUIRED"] = 2] = "REQUIRED";
})(UserInteraction = exports.UserInteraction || (exports.UserInteraction = {}));
/**
 * An enumeration of scopes associated with a vulnerability.
 *
 * @public
 */
var Scope;
(function (Scope) {
    /**
     * Denotes an undefined value.
     */
    Scope[Scope["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes that the vulnerability cannot affect adjacent systems.
     */
    Scope[Scope["UNCHANGED"] = 1] = "UNCHANGED";
    /**
     * Denotes that the vulnerability can affect adjacent systems.
     */
    Scope[Scope["CHANGED"] = 2] = "CHANGED";
})(Scope = exports.Scope || (exports.Scope = {}));
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
     * Denotes low impact.
     */
    Impact[Impact["LOW"] = 2] = "LOW";
    /**
     * Denotes high impact.
     */
    Impact[Impact["HIGH"] = 3] = "HIGH";
})(Impact = exports.Impact || (exports.Impact = {}));
/**
 * An enumeration of possible exploit code maturity levels associated with a vulnerability.
 *
 * @public
 */
var ExploitCodeMaturity;
(function (ExploitCodeMaturity) {
    /**
     * Denotes an undefined value.
     */
    ExploitCodeMaturity[ExploitCodeMaturity["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes that it is unproven that an exploit for the vulnerability exists.
     */
    ExploitCodeMaturity[ExploitCodeMaturity["UNPROVEN_THAT_EXPLOIT_EXISTS"] = 1] = "UNPROVEN_THAT_EXPLOIT_EXISTS";
    /**
     * Denotes that proof of concept code for exploiting the vulnerability exists.
     */
    ExploitCodeMaturity[ExploitCodeMaturity["PROOF_OF_CONCEPT_CODE"] = 2] = "PROOF_OF_CONCEPT_CODE";
    /**
     * Denotes that a functional exploit for the vulnerability exists.
     */
    ExploitCodeMaturity[ExploitCodeMaturity["FUNCTIONAL_EXPLOIT_EXISTS"] = 3] = "FUNCTIONAL_EXPLOIT_EXISTS";
    /**
     * Denotes that a weaponised exploit for the vulnerability is readily available.
     */
    ExploitCodeMaturity[ExploitCodeMaturity["HIGH"] = 4] = "HIGH";
})(ExploitCodeMaturity = exports.ExploitCodeMaturity || (exports.ExploitCodeMaturity = {}));
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
     * Denotes that the existence of the vulnerability is unknown.
     */
    ReportConfidence[ReportConfidence["UNKNOWN"] = 1] = "UNKNOWN";
    /**
     * Denotes that the existence of the vulnerability reasonably certain.
     */
    ReportConfidence[ReportConfidence["REASONABLE"] = 2] = "REASONABLE";
    /**
     * Denotes that the existence of the vulnerability is confirmed.
     */
    ReportConfidence[ReportConfidence["CONFIRMED"] = 3] = "CONFIRMED";
})(ReportConfidence = exports.ReportConfidence || (exports.ReportConfidence = {}));
/**
 * An enumeration of possible security requirements associated with a vulnerability.
 *
 * @public
 */
var SecurityRequirement;
(function (SecurityRequirement) {
    /**
     * Denotes an undefined value.
     */
    SecurityRequirement[SecurityRequirement["NOT_DEFINED"] = 0] = "NOT_DEFINED";
    /**
     * Denotes an low requirement.
     */
    SecurityRequirement[SecurityRequirement["LOW"] = 1] = "LOW";
    /**
     * Denotes a medium requirement.
     */
    SecurityRequirement[SecurityRequirement["MEDIUM"] = 2] = "MEDIUM";
    /**
     * Denotes a high requirement.
     */
    SecurityRequirement[SecurityRequirement["HIGH"] = 3] = "HIGH";
})(SecurityRequirement = exports.SecurityRequirement || (exports.SecurityRequirement = {}));
/**
 * An object containing all enums bundled for export.
 */
exports.enums = {
    AttackVector: AttackVector,
    AttackComplexity: AttackComplexity,
    PrivilegesRequired: PrivilegesRequired,
    UserInteraction: UserInteraction,
    Scope: Scope,
    Impact: Impact,
    ExploitCodeMaturity: ExploitCodeMaturity,
    RemediationLevel: RemediationLevel,
    ReportConfidence: ReportConfidence,
    SecurityRequirement: SecurityRequirement,
};
