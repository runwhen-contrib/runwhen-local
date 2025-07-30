import type { RenovateConfig } from '../../../../config/types';
import type { PackageFile } from '../../../../modules/manager/types';
import type { BranchConfig } from '../../../types';
export declare function ensureOnboardingPr(config: RenovateConfig, packageFiles: Record<string, PackageFile[]> | null, branches: BranchConfig[]): Promise<void>;
