export declare class ExternalHostError extends Error {
    hostType: string | undefined;
    err: Error;
    packageName?: string;
    reason?: string;
    constructor(err: Error, hostType?: string);
}
