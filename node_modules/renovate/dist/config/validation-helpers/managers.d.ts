import type { ValidationMessage } from '../types';
import type { CheckManagerArgs } from './types';
/**
 * Only if type condition or context condition violated then errors array will be mutated to store metadata
 */
export declare function check({ resolvedRule, currentPath, }: CheckManagerArgs): ValidationMessage[];
