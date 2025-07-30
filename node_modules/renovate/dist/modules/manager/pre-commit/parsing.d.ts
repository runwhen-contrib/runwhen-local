import type { PreCommitConfig, PreCommitDependency } from './types';
/**
 * Type guard to determine whether the file matches pre-commit configuration format
 * Example original yaml:
 *
 *   repos
 *   - repo: https://github.com/user/repo
 *     rev: v1.0.0
 */
export declare function matchesPrecommitConfigHeuristic(data: unknown): data is PreCommitConfig;
/**
 * Type guard to determine whether a given repo definition defines a pre-commit Git hook dependency.
 * Example original yaml portion
 *
 *   - repo: https://github.com/user/repo
 *     rev: v1.0.0
 */
export declare function matchesPrecommitDependencyHeuristic(data: unknown): data is PreCommitDependency;
