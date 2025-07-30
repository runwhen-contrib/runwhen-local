"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualFetcher = void 0;
const tslib_1 = require("tslib");
const fslib_1 = require("@yarnpkg/fslib");
const structUtils = tslib_1.__importStar(require("./structUtils"));
class VirtualFetcher {
    supports(locator) {
        if (!locator.reference.startsWith(`virtual:`))
            return false;
        return true;
    }
    getLocalPath(locator, opts) {
        const splitPoint = locator.reference.indexOf(`#`);
        if (splitPoint === -1)
            throw new Error(`Invalid virtual package reference`);
        const nextReference = locator.reference.slice(splitPoint + 1);
        const nextLocator = structUtils.makeLocator(locator, nextReference);
        return opts.fetcher.getLocalPath(nextLocator, opts);
    }
    async fetch(locator, opts) {
        const splitPoint = locator.reference.indexOf(`#`);
        if (splitPoint === -1)
            throw new Error(`Invalid virtual package reference`);
        const nextReference = locator.reference.slice(splitPoint + 1);
        const nextLocator = structUtils.makeLocator(locator, nextReference);
        const parentFetch = await opts.fetcher.fetch(nextLocator, opts);
        return await this.ensureVirtualLink(locator, parentFetch, opts);
    }
    getLocatorFilename(locator) {
        return structUtils.slugifyLocator(locator);
    }
    async ensureVirtualLink(locator, sourceFetch, opts) {
        const to = sourceFetch.packageFs.getRealPath();
        const virtualFolder = opts.project.configuration.get(`virtualFolder`);
        const virtualName = this.getLocatorFilename(locator);
        const virtualPath = fslib_1.VirtualFS.makeVirtualPath(virtualFolder, virtualName, to);
        // We then use an alias to tell anyone that asks us that we're operating within the virtual folder, while still using the same old fs
        const aliasFs = new fslib_1.AliasFS(virtualPath, { baseFs: sourceFetch.packageFs, pathUtils: fslib_1.ppath });
        return { ...sourceFetch, packageFs: aliasFs };
    }
}
exports.VirtualFetcher = VirtualFetcher;
