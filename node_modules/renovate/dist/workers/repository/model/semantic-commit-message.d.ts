import type { CommitMessageJSON } from '../../../types';
import { CommitMessage } from './commit-message';
export interface SemanticCommitMessageJSON extends CommitMessageJSON {
    scope?: string;
    type?: string;
}
/**
 * @see https://www.conventionalcommits.org/en/v1.0.0/#summary
 *
 * <type>[optional scope]: <description>
 * [optional body]
 * [optional footer]
 */
export declare class SemanticCommitMessage extends CommitMessage {
    private static readonly REGEXP;
    private _scope;
    private _type;
    static is(value: unknown): value is SemanticCommitMessage;
    static fromString(value: string): SemanticCommitMessage | undefined;
    toJSON(): SemanticCommitMessageJSON;
    set scope(value: string);
    set type(value: string);
    protected get prefix(): string;
}
