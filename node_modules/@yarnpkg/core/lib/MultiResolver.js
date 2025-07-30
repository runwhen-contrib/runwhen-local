"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiResolver = void 0;
const tslib_1 = require("tslib");
const structUtils = tslib_1.__importStar(require("./structUtils"));
class MultiResolver {
    constructor(resolvers) {
        this.resolvers = resolvers.filter(resolver => resolver);
    }
    supportsDescriptor(descriptor, opts) {
        const resolver = this.tryResolverByDescriptor(descriptor, opts);
        return !!resolver;
    }
    supportsLocator(locator, opts) {
        const resolver = this.tryResolverByLocator(locator, opts);
        return !!resolver;
    }
    shouldPersistResolution(locator, opts) {
        const resolver = this.getResolverByLocator(locator, opts);
        return resolver.shouldPersistResolution(locator, opts);
    }
    bindDescriptor(descriptor, fromLocator, opts) {
        const resolver = this.getResolverByDescriptor(descriptor, opts);
        return resolver.bindDescriptor(descriptor, fromLocator, opts);
    }
    getResolutionDependencies(descriptor, opts) {
        const resolver = this.getResolverByDescriptor(descriptor, opts);
        return resolver.getResolutionDependencies(descriptor, opts);
    }
    async getCandidates(descriptor, dependencies, opts) {
        const resolver = this.getResolverByDescriptor(descriptor, opts);
        return await resolver.getCandidates(descriptor, dependencies, opts);
    }
    async getSatisfying(descriptor, dependencies, locators, opts) {
        const resolver = this.getResolverByDescriptor(descriptor, opts);
        return resolver.getSatisfying(descriptor, dependencies, locators, opts);
    }
    async resolve(locator, opts) {
        const resolver = this.getResolverByLocator(locator, opts);
        return await resolver.resolve(locator, opts);
    }
    tryResolverByDescriptor(descriptor, opts) {
        const resolver = this.resolvers.find(resolver => resolver.supportsDescriptor(descriptor, opts));
        if (!resolver)
            return null;
        return resolver;
    }
    getResolverByDescriptor(descriptor, opts) {
        const resolver = this.resolvers.find(resolver => resolver.supportsDescriptor(descriptor, opts));
        if (!resolver)
            throw new Error(`${structUtils.prettyDescriptor(opts.project.configuration, descriptor)} isn't supported by any available resolver`);
        return resolver;
    }
    tryResolverByLocator(locator, opts) {
        const resolver = this.resolvers.find(resolver => resolver.supportsLocator(locator, opts));
        if (!resolver)
            return null;
        return resolver;
    }
    getResolverByLocator(locator, opts) {
        const resolver = this.resolvers.find(resolver => resolver.supportsLocator(locator, opts));
        if (!resolver)
            throw new Error(`${structUtils.prettyLocator(opts.project.configuration, locator)} isn't supported by any available resolver`);
        return resolver;
    }
}
exports.MultiResolver = MultiResolver;
