/**
 * An enumeration of possible access vectors associated with a vulnerability.
 *
 * @public
 */
export enum AccessVector {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes that the vulnerability can only be exploited with local system access.
     */
    LOCAL,

    /**
     * Denotes that the vulnerability can only be exploited with adjacent network access.
     */
    ADJACENT_NETWORK,

    /**
     * Denotes that the vulnerability can be exploited with network access (i.e. remotely).
     */
    NETWORK
}

/**
 * An enumeration of possible access complexities associated with a vulnerability.
 *
 * @public
 */
export enum AccessComplexity {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes low access complexity.
     */
    LOW,

    /**
     * Denotes medium access complexity.
     */
    MEDIUM,

    /**
     * Denotes high access complexity.
     */
    HIGH
}

/**
 * An enumeration of possible authentication requirements associated with a vulnerability.
 *
 * @public
 */
export enum Authentication {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes that multiple authenticated accounts are required to exploit the vulnerability.
     */
    MULTIPLE,

    /**
     * Denotes that a single authenticated account is required to exploit the vulnerability.
     */
    SINGLE,

    /**
     * Denotes that a no authenticated account is required to exploit the vulnerability.
     */
    NONE
}

/**
 * An enumeration of possible collateral damage potentials associated with a vulnerability.
 *
 * @public
 */
export enum CollateralDamagePotential {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes that there is no potential for collateral damage stemming from the vulnerability.
     */
    NONE,

    /**
     * Denotes that there is low potential for collateral damage stemming from the vulnerability.
     */
    LOW,

    /**
     * Denotes that there is low-medium potential for collateral damage stemming from the vulnerability.
     */
    LOW_MEDIUM,

    /**
     * Denotes that there is medium-high potential for collateral damage stemming from the vulnerability.
     */
    MEDIUM_HIGH,

    /**
     * Denotes that there is high potential for collateral damage stemming from the vulnerability.
     */
    HIGH
}

/**
 * An enumeration of possible exploitability levels associated with a vulnerability.
 *
 * @public
 */
export enum Exploitability {

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
 * An enumeration of possible impact subscores associated with a vulnerability.
 *
 * @public
 */
export enum ImpactSubscore {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes low impact.
     */
    LOW,

    /**
     * Denotes medium impact.
     */
    MEDIUM,

    /**
     * Denotes high impact.
     */
    HIGH
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
     * Denotes partial impact.
     */
    PARTIAL,

    /**
     * Denotes complete impact.
     */
    COMPLETE
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
     * Denotes that the existence of the vulnerability is unconfirmed.
     */
    UNCONFIRMED,

    /**
     * Denotes that the existence of the vulnerability is confirmed, but has not been successfully reproduced elsewhere
     * (i.e. corroborated).
     */
    UNCORROBORATED,

    /**
     * Denotes that the existence of the vulnerability is definitively confirmed.
     */
    CONFIRMED
}

/**
 * An enumeration of possible target distribution levels associated with a vulnerability.
 *
 * @public
 */
export enum TargetDistribution {

    /**
     * Denotes an undefined value.
     */
    NOT_DEFINED,

    /**
     * Denotes that no vulnerable targets currently exist.
     */
    NONE,

    /**
     * Denotes that few vulnerable targets currently exist.
     */
    LOW,

    /**
     * Denotes that a significant number vulnerable targets currently exist.
     */
    MEDIUM,

    /**
     * Denotes that vulnerable targets are widespread.
     */
    HIGH
}

/**
 * An object containing all enums bundled for export.
 */
export const enums = {
    AccessVector,
    AccessComplexity,
    Authentication,
    CollateralDamagePotential,
    Exploitability,
    ImpactSubscore,
    Impact,
    RemediationLevel,
    ReportConfidence,
    TargetDistribution,
};
