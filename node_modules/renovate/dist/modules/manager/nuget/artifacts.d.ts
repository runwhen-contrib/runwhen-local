import type { UpdateArtifact, UpdateArtifactsResult } from '../types';
export declare function updateArtifacts({ packageFileName, newPackageFileContent, config, updatedDeps, }: UpdateArtifact): Promise<UpdateArtifactsResult[] | null>;
