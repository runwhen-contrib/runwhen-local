import type { RenovateConfig } from '../../../config/types';
import type { PackageFile } from '../../../modules/manager/types';
export declare function fetchUpdates(config: RenovateConfig, packageFiles: Record<string, PackageFile[]>): Promise<void>;
