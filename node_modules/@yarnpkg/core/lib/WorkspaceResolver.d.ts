import { PortablePath } from '@yarnpkg/fslib';
import { Resolver, ResolveOptions, MinimalResolveOptions } from './Resolver';
import { Descriptor, Locator, Package } from './types';
import { LinkType } from './types';
export declare class WorkspaceResolver implements Resolver {
    static protocol: string;
    supportsDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions): boolean;
    supportsLocator(locator: Locator, opts: MinimalResolveOptions): boolean;
    shouldPersistResolution(locator: Locator, opts: MinimalResolveOptions): boolean;
    bindDescriptor(descriptor: Descriptor, fromLocator: Locator, opts: MinimalResolveOptions): Descriptor;
    getResolutionDependencies(descriptor: Descriptor, opts: MinimalResolveOptions): {};
    getCandidates(descriptor: Descriptor, dependencies: unknown, opts: ResolveOptions): Promise<Locator[]>;
    getSatisfying(descriptor: Descriptor, dependencies: Record<string, Package>, locators: Array<Locator>, opts: ResolveOptions): Promise<{
        locators: Locator[];
        sorted: boolean;
    }>;
    resolve(locator: Locator, opts: ResolveOptions): Promise<{
        version: string;
        languageName: string;
        linkType: LinkType;
        conditions: null;
        dependencies: Map<import("./types").IdentHash, Descriptor>;
        peerDependencies: Map<import("./types").IdentHash, Descriptor>;
        dependenciesMeta: Map<string, Map<string | null, import("./Manifest").DependencyMeta>>;
        peerDependenciesMeta: Map<string, import("./Manifest").PeerDependencyMeta>;
        bin: Map<string, PortablePath>;
        locatorHash: import("./types").LocatorHash;
        reference: string;
        identHash: import("./types").IdentHash;
        scope: string | null;
        name: string;
    }>;
}
