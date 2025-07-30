import type { RenovateConfig } from '../../config/types';
export default function handleError(config: RenovateConfig, err: Error): Promise<string>;
