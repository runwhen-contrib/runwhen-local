import type { GitLabMergeRequest, UpdateMergeRequest } from './types';
export declare function getMR(repository: string, iid: number): Promise<GitLabMergeRequest>;
export declare function updateMR(repository: string, iid: number, data: UpdateMergeRequest): Promise<void>;
