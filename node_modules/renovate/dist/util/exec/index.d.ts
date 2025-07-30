import type { ExecOptions, ExecResult } from './types';
export declare function exec(cmd: string | string[], opts?: ExecOptions): Promise<ExecResult>;
