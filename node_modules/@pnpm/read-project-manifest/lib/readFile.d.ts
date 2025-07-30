import { ProjectManifest } from '@pnpm/types';
export declare function readJson5File(filePath: string): Promise<{
    data: any;
    text: string;
}>;
export declare function readJsonFile(filePath: string): Promise<{
    data: ProjectManifest;
    text: string;
}>;
