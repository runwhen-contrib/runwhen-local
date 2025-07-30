import { Project } from './Project';
import { Report } from './Report';
import { Resolver, ResolveOptions, MinimalResolveOptions } from './Resolver';
import { Descriptor, Locator, Package } from './types';
export declare const IMPORTED_PATTERNS: Array<[RegExp, (version: string, ...args: Array<string>) => string]>;
export declare class LegacyMigrationResolver implements Resolver {
    private readonly resolver;
    private resolutions;
    constructor(resolver: Resolver);
    setup(project: Project, { report }: {
        report: Report;
    }): Promise<void>;
    supportsDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions): boolean;
    supportsLocator(locator: Locator, opts: MinimalResolveOptions): boolean;
    shouldPersistResolution(locator: Locator, opts: MinimalResolveOptions): never;
    bindDescriptor(descriptor: Descriptor, fromLocator: Locator, opts: MinimalResolveOptions): Descriptor;
    getResolutionDependencies(descriptor: Descriptor, opts: MinimalResolveOptions): {};
    getCandidates(descriptor: Descriptor, dependencies: Record<string, Package>, opts: ResolveOptions): Promise<Locator[]>;
    getSatisfying(descriptor: Descriptor, dependencies: Record<string, Package>, locators: Array<Locator>, opts: ResolveOptions): Promise<{
        locators: Locator[];
        sorted: boolean;
    }>;
    resolve(locator: Locator, opts: ResolveOptions): Promise<never>;
}
