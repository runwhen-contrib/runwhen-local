"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockfileResolver = void 0;
const tslib_1 = require("tslib");
const structUtils = tslib_1.__importStar(require("./structUtils"));
class LockfileResolver {
    constructor(resolver) {
        this.resolver = resolver;
    }
    supportsDescriptor(descriptor, opts) {
        const resolution = opts.project.storedResolutions.get(descriptor.descriptorHash);
        if (resolution)
            return true;
        // If the descriptor matches a package that's already been used, we can just use it even if we never resolved the range before
        // Ex: foo depends on bar@^1.0.0 that we resolved to foo@1.1.0, then we add a package qux that depends on foo@1.1.0 (without the caret)
        if (opts.project.originalPackages.has(structUtils.convertDescriptorToLocator(descriptor).locatorHash))
            return true;
        return false;
    }
    supportsLocator(locator, opts) {
        if (opts.project.originalPackages.has(locator.locatorHash) && !opts.project.lockfileNeedsRefresh)
            return true;
        return false;
    }
    shouldPersistResolution(locator, opts) {
        throw new Error(`The shouldPersistResolution method shouldn't be called on the lockfile resolver, which would always answer yes`);
    }
    bindDescriptor(descriptor, fromLocator, opts) {
        return descriptor;
    }
    getResolutionDependencies(descriptor, opts) {
        return this.resolver.getResolutionDependencies(descriptor, opts);
    }
    async getCandidates(descriptor, dependencies, opts) {
        const resolution = opts.project.storedResolutions.get(descriptor.descriptorHash);
        if (resolution) {
            const resolvedPkg = opts.project.originalPackages.get(resolution);
            if (resolvedPkg) {
                return [resolvedPkg];
            }
        }
        const originalPkg = opts.project.originalPackages.get(structUtils.convertDescriptorToLocator(descriptor).locatorHash);
        if (originalPkg)
            return [originalPkg];
        throw new Error(`Resolution expected from the lockfile data`);
    }
    async getSatisfying(descriptor, dependencies, locators, opts) {
        const [locator] = await this.getCandidates(descriptor, dependencies, opts);
        return {
            locators: locators.filter(candidate => candidate.locatorHash === locator.locatorHash),
            sorted: false,
        };
    }
    async resolve(locator, opts) {
        const pkg = opts.project.originalPackages.get(locator.locatorHash);
        if (!pkg)
            throw new Error(`The lockfile resolver isn't meant to resolve packages - they should already have been stored into a cache`);
        return pkg;
    }
}
exports.LockfileResolver = LockfileResolver;
