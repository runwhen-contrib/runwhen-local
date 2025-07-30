import { SourceData } from "@smithy/types";
export declare class MockSha256 {
    constructor(secret?: string | ArrayBuffer | ArrayBufferView);
    update(data?: SourceData): void;
    digest(): Promise<Uint8Array>;
    reset(): void;
}
export declare const region: () => Promise<string>;
export declare const endpoint: () => Promise<{
    protocol: string;
    path: string;
    hostname: string;
}>;
export declare const credentials: () => Promise<{
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
}>;
