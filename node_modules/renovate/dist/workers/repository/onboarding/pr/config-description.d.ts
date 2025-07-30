import type { RenovateConfig } from '../../../../config/types';
import type { PackageFile } from '../../../../modules/manager/types';
export declare function getScheduleDesc(config: RenovateConfig): string[];
export declare function getConfigDesc(config: RenovateConfig, packageFiles?: Record<string, PackageFile[]>): string;
