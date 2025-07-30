import type { PackageLockDependency, PackageLockOrEntry } from './types';
export declare function getLockedDependencies(entry: PackageLockOrEntry, depName: string, currentVersion: string | null, bundled?: boolean): PackageLockDependency[];
