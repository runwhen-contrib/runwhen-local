/**
 * An enumeration of possible attack vectors associated with a vulnerability.
 *
 * @public
 */
export declare enum AttackVector {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes that the vulnerability can be exploited with network access (i.e. remotely).
     */
    NETWORK = 1,
    /**
     * Denotes that the vulnerability can only be exploited with adjacent network access.
     */
    ADJACENT_NETWORK = 2,
    /**
     * Denotes that the vulnerability can only be exploited with local system access.
     */
    LOCAL = 3,
    /**
     * Denotes that the vulnerability can only be exploited with physical system access.
     */
    PHYSICAL = 4
}
/**
 * An enumeration of possible attack complexities associated with a vulnerability.
 *
 * @public
 */
export declare enum AttackComplexity {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes low attack complexity.
     */
    LOW = 1,
    /**
     * Denotes high attack complexity.
     */
    HIGH = 2
}
/**
 * An enumeration of possible privilege requirements associated with a vulnerability.
 *
 * @public
 */
export declare enum PrivilegesRequired {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes that a no privileges are required to exploit the vulnerability.
     */
    NONE = 1,
    /**
     * Denotes that a regular user privileges are required to exploit the vulnerability.
     */
    LOW = 2,
    /**
     * Denotes that a administrator privileges are required to exploit the vulnerability.
     */
    HIGH = 3
}
/**
 * An enumeration of possible user interaction requirements associated with a vulnerability.
 *
 * @public
 */
export declare enum UserInteraction {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes that no user interaction is required to exploite the vulnerability.
     */
    NONE = 1,
    /**
     * Denotes that some user interaction is required to exploite the vulnerability.
     */
    REQUIRED = 2
}
/**
 * An enumeration of scopes associated with a vulnerability.
 *
 * @public
 */
export declare enum Scope {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes that the vulnerability cannot affect adjacent systems.
     */
    UNCHANGED = 1,
    /**
     * Denotes that the vulnerability can affect adjacent systems.
     */
    CHANGED = 2
}
/**
 * An enumeration of possible impact magnitudes associated with a vulnerability.
 *
 * @public
 */
export declare enum Impact {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes no impact.
     */
    NONE = 1,
    /**
     * Denotes low impact.
     */
    LOW = 2,
    /**
     * Denotes high impact.
     */
    HIGH = 3
}
/**
 * An enumeration of possible exploit code maturity levels associated with a vulnerability.
 *
 * @public
 */
export declare enum ExploitCodeMaturity {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes that it is unproven that an exploit for the vulnerability exists.
     */
    UNPROVEN_THAT_EXPLOIT_EXISTS = 1,
    /**
     * Denotes that proof of concept code for exploiting the vulnerability exists.
     */
    PROOF_OF_CONCEPT_CODE = 2,
    /**
     * Denotes that a functional exploit for the vulnerability exists.
     */
    FUNCTIONAL_EXPLOIT_EXISTS = 3,
    /**
     * Denotes that a weaponised exploit for the vulnerability is readily available.
     */
    HIGH = 4
}
/**
 * An enumeration of possible remediation levels associated with a vulnerability.
 *
 * @public
 */
export declare enum RemediationLevel {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes that an official fix has been released by the vendor for the vulnerability.
     */
    OFFICIAL_FIX = 1,
    /**
     * Denotes that an temporary fix has been released for the vulnerability.
     */
    TEMPORARY_FIX = 2,
    /**
     * Denotes that a workaround (e.g. configuration change) is available for the vulnerability.
     */
    WORKAROUND = 3,
    /**
     * Denotes that there is currently no known remediation for the vulnerability.
     */
    UNAVAILABLE = 4
}
/**
 * An enumeration of possible report confidence levels associated with a vulnerability.
 *
 * @public
 */
export declare enum ReportConfidence {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes that the existence of the vulnerability is unknown.
     */
    UNKNOWN = 1,
    /**
     * Denotes that the existence of the vulnerability reasonably certain.
     */
    REASONABLE = 2,
    /**
     * Denotes that the existence of the vulnerability is confirmed.
     */
    CONFIRMED = 3
}
/**
 * An enumeration of possible security requirements associated with a vulnerability.
 *
 * @public
 */
export declare enum SecurityRequirement {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes an low requirement.
     */
    LOW = 1,
    /**
     * Denotes a medium requirement.
     */
    MEDIUM = 2,
    /**
     * Denotes a high requirement.
     */
    HIGH = 3
}
/**
 * An object containing all enums bundled for export.
 */
export declare const enums: {
    AttackVector: typeof AttackVector;
    AttackComplexity: typeof AttackComplexity;
    PrivilegesRequired: typeof PrivilegesRequired;
    UserInteraction: typeof UserInteraction;
    Scope: typeof Scope;
    Impact: typeof Impact;
    ExploitCodeMaturity: typeof ExploitCodeMaturity;
    RemediationLevel: typeof RemediationLevel;
    ReportConfidence: typeof ReportConfidence;
    SecurityRequirement: typeof SecurityRequirement;
};
