import type { DistroInfo, DistroInfoRecordWithVersion } from '../distro';
export declare class RollingReleasesData {
    private ltsToVer;
    private verToLts;
    private timestamp;
    private distroInfo;
    constructor(distroInfo: DistroInfo);
    getVersionByLts(input: string): string;
    getLtsByVersion(input: string): string;
    has(version: string): boolean;
    schedule(version: string): DistroInfoRecordWithVersion | undefined;
    private build;
}
