import type { EnsureCommentConfig, EnsureCommentRemovalConfig } from './types';
export declare function ensureComment(commentConfig: EnsureCommentConfig): Promise<boolean>;
export declare function ensureCommentRemoval(config: EnsureCommentRemovalConfig): Promise<void>;
