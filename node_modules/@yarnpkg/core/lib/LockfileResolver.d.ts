import { Resolver, ResolveOptions, MinimalResolveOptions } from './Resolver';
import { Descriptor, Locator, Package } from './types';
export declare class LockfileResolver implements Resolver {
    private readonly resolver;
    constructor(resolver: Resolver);
    supportsDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions): boolean;
    supportsLocator(locator: Locator, opts: MinimalResolveOptions): boolean;
    shouldPersistResolution(locator: Locator, opts: MinimalResolveOptions): boolean;
    bindDescriptor(descriptor: Descriptor, fromLocator: Locator, opts: MinimalResolveOptions): Descriptor;
    getResolutionDependencies(descriptor: Descriptor, opts: MinimalResolveOptions): Record<string, Descriptor>;
    getCandidates(descriptor: Descriptor, dependencies: unknown, opts: ResolveOptions): Promise<Package[]>;
    getSatisfying(descriptor: Descriptor, dependencies: Record<string, Package>, locators: Array<Locator>, opts: ResolveOptions): Promise<{
        locators: Locator[];
        sorted: boolean;
    }>;
    resolve(locator: Locator, opts: ResolveOptions): Promise<Package>;
}
