import type { UpdateDependencyConfig } from '../types';
export default function updateDependency({ fileContent, upgrade, }: UpdateDependencyConfig): Promise<string | null>;
