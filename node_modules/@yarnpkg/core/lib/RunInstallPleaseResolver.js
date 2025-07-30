"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunInstallPleaseResolver = void 0;
const MessageName_1 = require("./MessageName");
const Report_1 = require("./Report");
class RunInstallPleaseResolver {
    constructor(resolver) {
        this.resolver = resolver;
    }
    supportsDescriptor(descriptor, opts) {
        return this.resolver.supportsDescriptor(descriptor, opts);
    }
    supportsLocator(locator, opts) {
        return this.resolver.supportsLocator(locator, opts);
    }
    shouldPersistResolution(locator, opts) {
        return this.resolver.shouldPersistResolution(locator, opts);
    }
    bindDescriptor(descriptor, fromLocator, opts) {
        return this.resolver.bindDescriptor(descriptor, fromLocator, opts);
    }
    getResolutionDependencies(descriptor, opts) {
        return this.resolver.getResolutionDependencies(descriptor, opts);
    }
    async getCandidates(descriptor, dependencies, opts) {
        throw new Report_1.ReportError(MessageName_1.MessageName.MISSING_LOCKFILE_ENTRY, `This package doesn't seem to be present in your lockfile; run "yarn install" to update the lockfile`);
    }
    async getSatisfying(descriptor, dependencies, locators, opts) {
        throw new Report_1.ReportError(MessageName_1.MessageName.MISSING_LOCKFILE_ENTRY, `This package doesn't seem to be present in your lockfile; run "yarn install" to update the lockfile`);
    }
    async resolve(locator, opts) {
        throw new Report_1.ReportError(MessageName_1.MessageName.MISSING_LOCKFILE_ENTRY, `This package doesn't seem to be present in your lockfile; run "yarn install" to update the lockfile`);
    }
}
exports.RunInstallPleaseResolver = RunInstallPleaseResolver;
