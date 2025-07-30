/**
 * An enumeration of possible attack vectors associated with a vulnerability.
 *
 * @public
 */
export enum AttackVector {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes that the vulnerability can be exploited with network access (i.e. remotely).
     */
    NETWORK,

    /**
     * Denotes that the vulnerability can only be exploited with adjacent network access.
     */
    ADJACENT_NETWORK,

    /**
     * Denotes that the vulnerability can only be exploited with local system access.
     */
    LOCAL,

    /**
     * Denotes that the vulnerability can only be exploited with physical system access.
     */
    PHYSICAL
}

/**
 * An enumeration of possible attack complexities associated with a vulnerability.
 *
 * @public
 */
export enum AttackComplexity {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes low attack complexity.
     */
    LOW,

    /**
     * Denotes high attack complexity.
     */
    HIGH
}

/**
 * An enumeration of possible privilege requirements associated with a vulnerability.
 *
 * @public
 */
export enum PrivilegesRequired {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes that a no privileges are required to exploit the vulnerability.
     */
    NONE,

    /**
     * Denotes that a regular user privileges are required to exploit the vulnerability.
     */
    LOW,

    /**
     * Denotes that a administrator privileges are required to exploit the vulnerability.
     */
    HIGH
}

/**
 * An enumeration of possible user interaction requirements associated with a vulnerability.
 *
 * @public
 */
export enum UserInteraction {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes that no user interaction is required to exploite the vulnerability.
     */
    NONE,

    /**
     * Denotes that some user interaction is required to exploite the vulnerability.
     */
    REQUIRED
}

/**
 * An enumeration of scopes associated with a vulnerability.
 *
 * @public
 */
export enum Scope {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes that the vulnerability cannot affect adjacent systems.
     */
    UNCHANGED,

    /**
     * Denotes that the vulnerability can affect adjacent systems.
     */
    CHANGED
}

/**
 * An enumeration of possible impact magnitudes associated with a vulnerability.
 *
 * @public
 */
export enum Impact {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes no impact.
     */
    NONE,

    /**
     * Denotes low impact.
     */
    LOW,

    /**
     * Denotes high impact.
     */
    HIGH
}

/**
 * An enumeration of possible exploit code maturity levels associated with a vulnerability.
 *
 * @public
 */
export enum ExploitCodeMaturity {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes that it is unproven that an exploit for the vulnerability exists.
     */
    UNPROVEN_THAT_EXPLOIT_EXISTS,

    /**
     * Denotes that proof of concept code for exploiting the vulnerability exists.
     */
    PROOF_OF_CONCEPT_CODE,

    /**
     * Denotes that a functional exploit for the vulnerability exists.
     */
    FUNCTIONAL_EXPLOIT_EXISTS,

    /**
     * Denotes that a weaponised exploit for the vulnerability is readily available.
     */
    HIGH
}

/**
 * An enumeration of possible remediation levels associated with a vulnerability.
 *
 * @public
 */
export enum RemediationLevel {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes that an official fix has been released by the vendor for the vulnerability.
     */
    OFFICIAL_FIX,

    /**
     * Denotes that an temporary fix has been released for the vulnerability.
     */
    TEMPORARY_FIX,

    /**
     * Denotes that a workaround (e.g. configuration change) is available for the vulnerability.
     */
    WORKAROUND,

    /**
     * Denotes that there is currently no known remediation for the vulnerability.
     */
    UNAVAILABLE
}

/**
 * An enumeration of possible report confidence levels associated with a vulnerability.
 *
 * @public
 */
export enum ReportConfidence {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes that the existence of the vulnerability is unknown.
     */
    UNKNOWN,

    /**
     * Denotes that the existence of the vulnerability reasonably certain.
     */
    REASONABLE,

    /**
     * Denotes that the existence of the vulnerability is confirmed.
     */
    CONFIRMED
}

/**
 * An enumeration of possible security requirements associated with a vulnerability.
 *
 * @public
 */
export enum SecurityRequirement {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes an low requirement.
     */
    LOW,

    /**
     * Denotes a medium requirement.
     */
    MEDIUM,

    /**
     * Denotes a high requirement.
     */
    HIGH
}

/**
 * An object containing all enums bundled for export.
 */
export const enums = {
    AttackVector,
    AttackComplexity,
    PrivilegesRequired,
    UserInteraction,
    Scope,
    Impact,
    ExploitCodeMaturity,
    RemediationLevel,
    ReportConfidence,
    SecurityRequirement,
};
