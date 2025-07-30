import { ProjectManifest } from './package';
export interface Project {
    dir: string;
    manifest: ProjectManifest;
    writeProjectManifest: (manifest: ProjectManifest, force?: boolean | undefined) => Promise<void>;
}
export declare type ProjectsGraph = Record<string, {
    dependencies: string[];
    package: Project;
}>;
