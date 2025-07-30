import type { RenovateConfig } from '../../../config/types';
export declare function getIncludedFiles(fileList: string[], includePaths: string[]): string[];
export declare function filterIgnoredFiles(fileList: string[], ignorePaths: string[]): string[];
export declare function getFilteredFileList(config: RenovateConfig, fileList: string[]): string[];
export declare function getMatchingFiles(config: RenovateConfig, allFiles: string[]): string[];
