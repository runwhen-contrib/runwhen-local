import type { UpdateArtifact, UpdateArtifactsResult } from '../types';
export declare function updateArtifacts({ packageFileName, updatedDeps, newPackageFileContent, config, }: UpdateArtifact): Promise<UpdateArtifactsResult[] | null>;
