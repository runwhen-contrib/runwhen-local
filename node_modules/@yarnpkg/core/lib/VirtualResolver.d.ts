import { Resolver, ResolveOptions, MinimalResolveOptions } from './Resolver';
import { Descriptor, Locator } from './types';
export declare class VirtualResolver implements Resolver {
    static protocol: string;
    static isVirtualDescriptor(descriptor: Descriptor): boolean;
    static isVirtualLocator(locator: Locator): boolean;
    supportsDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions): boolean;
    supportsLocator(locator: Locator, opts: MinimalResolveOptions): boolean;
    shouldPersistResolution(locator: Locator, opts: MinimalResolveOptions): boolean;
    bindDescriptor(descriptor: Descriptor, locator: Locator, opts: MinimalResolveOptions): never;
    getResolutionDependencies(descriptor: Descriptor, opts: MinimalResolveOptions): never;
    getCandidates(descriptor: Descriptor, dependencies: unknown, opts: ResolveOptions): Promise<never>;
    getSatisfying(descriptor: Descriptor, dependencies: unknown, candidates: Array<Locator>, opts: ResolveOptions): Promise<never>;
    resolve(locator: Locator, opts: ResolveOptions): Promise<never>;
}
