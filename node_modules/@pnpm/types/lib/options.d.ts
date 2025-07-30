import { DependenciesField } from './misc';
import { PackageManifest, ProjectManifest } from './package';
export declare type LogBase = {
    level: 'debug' | 'error';
} | {
    level: 'info' | 'warn';
    prefix: string;
    message: string;
};
export declare type IncludedDependencies = {
    [dependenciesField in DependenciesField]: boolean;
};
export interface ReadPackageHook {
    (pkg: PackageManifest, dir?: string): PackageManifest | Promise<PackageManifest>;
    (pkg: ProjectManifest, dir?: string): ProjectManifest | Promise<ProjectManifest>;
}
