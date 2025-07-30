import { PortablePath } from '@yarnpkg/fslib';
export declare function getDefaultGlobalFolder(): PortablePath;
export declare function getHomeFolder(): PortablePath;
export declare function isFolderInside(target: PortablePath, parent: PortablePath): boolean;
