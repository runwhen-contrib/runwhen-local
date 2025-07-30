"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualResolver = void 0;
class VirtualResolver {
    static isVirtualDescriptor(descriptor) {
        if (!descriptor.range.startsWith(VirtualResolver.protocol))
            return false;
        return true;
    }
    static isVirtualLocator(locator) {
        if (!locator.reference.startsWith(VirtualResolver.protocol))
            return false;
        return true;
    }
    supportsDescriptor(descriptor, opts) {
        return VirtualResolver.isVirtualDescriptor(descriptor);
    }
    supportsLocator(locator, opts) {
        return VirtualResolver.isVirtualLocator(locator);
    }
    shouldPersistResolution(locator, opts) {
        return false;
    }
    bindDescriptor(descriptor, locator, opts) {
        // It's unsupported because packages inside the dependency tree should
        // only become virtual AFTER they have all been resolved, by which point
        // you shouldn't need to call `bindDescriptor` anymore.
        throw new Error(`Assertion failed: calling "bindDescriptor" on a virtual descriptor is unsupported`);
    }
    getResolutionDependencies(descriptor, opts) {
        // It's unsupported because packages inside the dependency tree should
        // only become virtual AFTER they have all been resolved, by which point
        // you shouldn't need to call `bindDescriptor` anymore.
        throw new Error(`Assertion failed: calling "getResolutionDependencies" on a virtual descriptor is unsupported`);
    }
    async getCandidates(descriptor, dependencies, opts) {
        // It's unsupported because packages inside the dependency tree should
        // only become virtual AFTER they have all been resolved, by which point
        // you shouldn't need to call `getCandidates` anymore.
        throw new Error(`Assertion failed: calling "getCandidates" on a virtual descriptor is unsupported`);
    }
    async getSatisfying(descriptor, dependencies, candidates, opts) {
        // It's unsupported because packages inside the dependency tree should
        // only become virtual AFTER they have all been resolved, by which point
        // you shouldn't need to call `getSatisfying` anymore.
        throw new Error(`Assertion failed: calling "getSatisfying" on a virtual descriptor is unsupported`);
    }
    async resolve(locator, opts) {
        // It's unsupported because packages inside the dependency tree should
        // only become virtual AFTER they have all been resolved, by which point
        // you shouldn't need to call `resolve` anymore.
        throw new Error(`Assertion failed: calling "resolve" on a virtual locator is unsupported`);
    }
}
exports.VirtualResolver = VirtualResolver;
VirtualResolver.protocol = `virtual:`;
