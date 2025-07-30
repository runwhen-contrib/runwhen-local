import type { NpmrcRules } from './types';
export declare function getMatchHostFromNpmrcHost(input: string): string;
export declare function convertNpmrcToRules(npmrc: Record<string, any>): NpmrcRules;
export declare function setNpmrc(input?: string): void;
export declare function resolveRegistryUrl(packageName: string): string;
export declare function resolvePackageUrl(registryUrl: string, packageName: string): string;
