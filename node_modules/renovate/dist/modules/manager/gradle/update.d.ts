import type { UpdateDependencyConfig } from '../types';
import type { GradleManagerData } from './types';
export declare function updateDependency({ fileContent, upgrade, }: UpdateDependencyConfig<GradleManagerData>): string | null;
