import { Datasource } from '../datasource';
import type { GetReleasesConfig } from '../types';
import type { RawRefs } from './types';
export declare abstract class GitDatasource extends Datasource {
    static id: string;
    constructor(id: string);
    getRawRefs({ packageName, }: GetReleasesConfig): Promise<RawRefs[] | null>;
}
