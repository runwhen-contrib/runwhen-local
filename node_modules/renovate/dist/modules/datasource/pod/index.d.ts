import { GithubHttp } from '../../../util/http/github';
import { Datasource } from '../datasource';
import type { GetReleasesConfig, ReleaseResult } from '../types';
export declare class PodDatasource extends Datasource {
    static readonly id = "pod";
    readonly defaultRegistryUrls: string[];
    readonly registryStrategy = "hunt";
    githubHttp: GithubHttp;
    constructor();
    private requestCDN;
    private requestGithub;
    private getReleasesFromGithub;
    private getReleasesFromCDN;
    getReleases({ packageName, registryUrl, }: GetReleasesConfig): Promise<ReleaseResult | null>;
}
