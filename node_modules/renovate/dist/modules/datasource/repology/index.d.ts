import { Datasource } from '../datasource';
import type { GetReleasesConfig, ReleaseResult } from '../types';
import type { RepologyPackage } from './types';
export declare class RepologyDatasource extends Datasource {
    static readonly id = "repology";
    readonly defaultRegistryUrls: string[];
    readonly registryStrategy = "hunt";
    constructor();
    private queryPackages;
    private queryPackagesViaResolver;
    private queryPackagesViaAPI;
    queryPackage(registryUrl: string, repoName: string, pkgName: string): Promise<RepologyPackage[] | undefined>;
    getReleases({ packageName, registryUrl, }: GetReleasesConfig): Promise<ReleaseResult | null>;
}
