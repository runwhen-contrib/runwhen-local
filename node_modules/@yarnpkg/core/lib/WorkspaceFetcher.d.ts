import { CwdFS, PortablePath } from '@yarnpkg/fslib';
import { Fetcher, FetchOptions } from './Fetcher';
import { Locator } from './types';
export declare class WorkspaceFetcher implements Fetcher {
    supports(locator: Locator): boolean;
    getLocalPath(locator: Locator, opts: FetchOptions): PortablePath;
    fetch(locator: Locator, opts: FetchOptions): Promise<{
        packageFs: CwdFS;
        prefixPath: PortablePath;
        localPath: PortablePath;
    }>;
    getWorkspace(locator: Locator, opts: FetchOptions): import("./Workspace").Workspace;
}
