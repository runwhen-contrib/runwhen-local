import type { HostRule } from '../../../types';
export declare function findAllAuthenticatable({ hostType, }: {
    hostType: string;
}): HostRule[];
export declare function getAuthenticationHeaderValue(hostRule: HostRule): string;
