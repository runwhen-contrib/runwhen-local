import { Fetcher, FetchOptions, MinimalFetchOptions } from './Fetcher';
import { Locator } from './types';
export declare class MultiFetcher implements Fetcher {
    private readonly fetchers;
    constructor(fetchers: Array<Fetcher>);
    supports(locator: Locator, opts: MinimalFetchOptions): boolean;
    getLocalPath(locator: Locator, opts: FetchOptions): import("@yarnpkg/fslib").PortablePath | null;
    fetch(locator: Locator, opts: FetchOptions): Promise<import("./Fetcher").FetchResult>;
    private tryFetcher;
    private getFetcher;
}
