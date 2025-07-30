/**
 * An enumeration of possible access vectors associated with a vulnerability.
 *
 * @public
 */
export declare enum AccessVector {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes that the vulnerability can only be exploited with local system access.
     */
    LOCAL = 1,
    /**
     * Denotes that the vulnerability can only be exploited with adjacent network access.
     */
    ADJACENT_NETWORK = 2,
    /**
     * Denotes that the vulnerability can be exploited with network access (i.e. remotely).
     */
    NETWORK = 3
}
/**
 * An enumeration of possible access complexities associated with a vulnerability.
 *
 * @public
 */
export declare enum AccessComplexity {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes low access complexity.
     */
    LOW = 1,
    /**
     * Denotes medium access complexity.
     */
    MEDIUM = 2,
    /**
     * Denotes high access complexity.
     */
    HIGH = 3
}
/**
 * An enumeration of possible authentication requirements associated with a vulnerability.
 *
 * @public
 */
export declare enum Authentication {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes that multiple authenticated accounts are required to exploit the vulnerability.
     */
    MULTIPLE = 1,
    /**
     * Denotes that a single authenticated account is required to exploit the vulnerability.
     */
    SINGLE = 2,
    /**
     * Denotes that a no authenticated account is required to exploit the vulnerability.
     */
    NONE = 3
}
/**
 * An enumeration of possible collateral damage potentials associated with a vulnerability.
 *
 * @public
 */
export declare enum CollateralDamagePotential {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes that there is no potential for collateral damage stemming from the vulnerability.
     */
    NONE = 1,
    /**
     * Denotes that there is low potential for collateral damage stemming from the vulnerability.
     */
    LOW = 2,
    /**
     * Denotes that there is low-medium potential for collateral damage stemming from the vulnerability.
     */
    LOW_MEDIUM = 3,
    /**
     * Denotes that there is medium-high potential for collateral damage stemming from the vulnerability.
     */
    MEDIUM_HIGH = 4,
    /**
     * Denotes that there is high potential for collateral damage stemming from the vulnerability.
     */
    HIGH = 5
}
/**
 * An enumeration of possible exploitability levels associated with a vulnerability.
 *
 * @public
 */
export declare enum Exploitability {
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
 * An enumeration of possible impact subscores associated with a vulnerability.
 *
 * @public
 */
export declare enum ImpactSubscore {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes low impact.
     */
    LOW = 1,
    /**
     * Denotes medium impact.
     */
    MEDIUM = 2,
    /**
     * Denotes high impact.
     */
    HIGH = 3
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
     * Denotes partial impact.
     */
    PARTIAL = 2,
    /**
     * Denotes complete impact.
     */
    COMPLETE = 3
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
     * Denotes that the existence of the vulnerability is unconfirmed.
     */
    UNCONFIRMED = 1,
    /**
     * Denotes that the existence of the vulnerability is confirmed, but has not been successfully reproduced elsewhere
     * (i.e. corroborated).
     */
    UNCORROBORATED = 2,
    /**
     * Denotes that the existence of the vulnerability is definitively confirmed.
     */
    CONFIRMED = 3
}
/**
 * An enumeration of possible target distribution levels associated with a vulnerability.
 *
 * @public
 */
export declare enum TargetDistribution {
    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED = 0,
    /**
     * Denotes that no vulnerable targets currently exist.
     */
    NONE = 1,
    /**
     * Denotes that few vulnerable targets currently exist.
     */
    LOW = 2,
    /**
     * Denotes that a significant number vulnerable targets currently exist.
     */
    MEDIUM = 3,
    /**
     * Denotes that vulnerable targets are widespread.
     */
    HIGH = 4
}
/**
 * An object containing all enums bundled for export.
 */
export declare const enums: {
    AccessVector: typeof AccessVector;
    AccessComplexity: typeof AccessComplexity;
    Authentication: typeof Authentication;
    CollateralDamagePotential: typeof CollateralDamagePotential;
    Exploitability: typeof Exploitability;
    ImpactSubscore: typeof ImpactSubscore;
    Impact: typeof Impact;
    RemediationLevel: typeof RemediationLevel;
    ReportConfidence: typeof ReportConfidence;
    TargetDistribution: typeof TargetDistribution;
};
