import type { PackageJson } from 'type-fest';
import type { PackageLockOrEntry, ParentDependency } from './types';
export declare function findDepConstraints(packageJson: PackageJson, lockEntry: PackageLockOrEntry, depName: string, currentVersion: string, newVersion: string, parentDepName?: string): ParentDependency[];
