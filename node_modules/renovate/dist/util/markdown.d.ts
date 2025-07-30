import github from 'remark-github';
export declare function sanitizeMarkdown(markdown: string): string;
/**
 *
 * @param content content to process
 * @param options github options
 * @returns linkified content
 */
export declare function linkify(content: string, options: github.RemarkGithubOptions): Promise<string>;
