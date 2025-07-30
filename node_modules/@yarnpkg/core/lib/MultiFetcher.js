"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiFetcher = void 0;
const tslib_1 = require("tslib");
const MessageName_1 = require("./MessageName");
const Report_1 = require("./Report");
const structUtils = tslib_1.__importStar(require("./structUtils"));
class MultiFetcher {
    constructor(fetchers) {
        this.fetchers = fetchers;
    }
    supports(locator, opts) {
        if (!this.tryFetcher(locator, opts))
            return false;
        return true;
    }
    getLocalPath(locator, opts) {
        const fetcher = this.getFetcher(locator, opts);
        return fetcher.getLocalPath(locator, opts);
    }
    async fetch(locator, opts) {
        const fetcher = this.getFetcher(locator, opts);
        return await fetcher.fetch(locator, opts);
    }
    tryFetcher(locator, opts) {
        const fetcher = this.fetchers.find(fetcher => fetcher.supports(locator, opts));
        if (!fetcher)
            return null;
        return fetcher;
    }
    getFetcher(locator, opts) {
        const fetcher = this.fetchers.find(fetcher => fetcher.supports(locator, opts));
        if (!fetcher)
            throw new Report_1.ReportError(MessageName_1.MessageName.FETCHER_NOT_FOUND, `${structUtils.prettyLocator(opts.project.configuration, locator)} isn't supported by any available fetcher`);
        return fetcher;
    }
}
exports.MultiFetcher = MultiFetcher;
