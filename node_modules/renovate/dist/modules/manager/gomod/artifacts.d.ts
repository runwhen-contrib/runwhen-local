import type { UpdateArtifact, UpdateArtifactsResult } from '../types';
export declare function updateArtifacts({ packageFileName: goModFileName, updatedDeps, newPackageFileContent: newGoModContent, config, }: UpdateArtifact): Promise<UpdateArtifactsResult[] | null>;
