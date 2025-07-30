import type { PackageDependency } from '../../types';
import type { GradleManagerData } from '../types';
export declare function parseCatalog(packageFile: string, content: string): PackageDependency<GradleManagerData>[];
