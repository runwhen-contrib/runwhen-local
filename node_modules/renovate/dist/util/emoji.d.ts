import type { RenovateConfig } from '../config/types';
export declare function setEmojiConfig(config: RenovateConfig): void;
export declare function emojify(text: string): string;
export declare function stripHexCode(input: string): string;
export declare function unemojify(text: string): string;
export declare function stripEmojis(input: string): string;
