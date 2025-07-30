import * as semver from 'semver';
import type { NewValueConfig } from '../types';
export declare function getMajor(version: string): null | number;
export declare function getMinor(version: string): null | number;
export declare function getPatch(version: string): null | number;
export declare function fixParsedRange(range: string): any;
export declare function replaceRange({ currentValue, newVersion, }: NewValueConfig): string;
export declare function widenRange({ currentValue, currentVersion, newVersion }: NewValueConfig, options: semver.Options): string | null;
export declare function bumpRange({ currentValue, currentVersion, newVersion }: NewValueConfig, options: semver.Options): string | null;
