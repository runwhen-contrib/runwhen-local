import type { CommitMessageJSON } from '../../../types';
/**
 * @see https://git-scm.com/docs/git-commit#_discussion
 *
 * [optional prefix]: <suject>
 * [optional body]
 * [optional footer]
 */
export declare abstract class CommitMessage {
    private static readonly SEPARATOR;
    private static readonly EXTRA_WHITESPACES;
    private _body;
    private _footer;
    private _subject;
    static formatPrefix(prefix: string): string;
    toJSON(): CommitMessageJSON;
    toString(): string;
    get title(): string;
    set body(value: string);
    set footer(value: string);
    set subject(value: string);
    formatSubject(): string;
    protected abstract get prefix(): string;
    protected normalizeInput(value: string | null | undefined): string;
}
