import type { CommitMessageJSON } from '../../../types';
import { CommitMessage } from './commit-message';
export interface CustomCommitMessageJSON extends CommitMessageJSON {
    prefix?: string;
}
export declare class CustomCommitMessage extends CommitMessage {
    private _prefix;
    get prefix(): string;
    set prefix(value: string);
    toJSON(): CustomCommitMessageJSON;
}
