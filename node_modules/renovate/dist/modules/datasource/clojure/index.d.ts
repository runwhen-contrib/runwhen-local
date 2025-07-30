import { MavenDatasource } from '../maven';
export declare class ClojureDatasource extends MavenDatasource {
    static readonly id = "clojure";
    constructor();
    readonly registryStrategy = "merge";
    readonly defaultRegistryUrls: string[];
}
