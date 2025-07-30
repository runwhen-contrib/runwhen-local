import type { SimpleGitOptions } from 'simple-git';
import type { GitNoVerifyOption } from './types';
export declare function setNoVerify(value: GitNoVerifyOption[]): void;
export declare function getNoVerify(): GitNoVerifyOption[];
export declare function simpleGitConfig(): Partial<SimpleGitOptions>;
