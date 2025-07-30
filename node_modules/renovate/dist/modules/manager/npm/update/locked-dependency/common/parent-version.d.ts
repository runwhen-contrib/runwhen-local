/**
 * Finds the first stable version of parentName after parentStartingVersion which either:
 * - depends on targetDepName@targetVersion or a range which it satisfies, OR
 * - removes the dependency targetDepName altogether, OR
 * - depends on any version of targetDepName higher than targetVersion
 */
export declare function findFirstParentVersion(parentName: string, parentStartingVersion: string, targetDepName: string, targetVersion: string): Promise<string | null>;
