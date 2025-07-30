import type { ExtractionResult } from './types';
export declare const sourceExtractionRegex: RegExp;
export declare function extractTerragruntProvider(startingLine: number, lines: string[], moduleName: string): ExtractionResult;
