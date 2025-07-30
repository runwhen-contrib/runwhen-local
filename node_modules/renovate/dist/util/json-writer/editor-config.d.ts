import type { CodeFormat } from './code-format';
export declare class EditorConfig {
    static getCodeFormat(fileName: string): Promise<CodeFormat>;
    private static getIndentationType;
    private static getIndentationSize;
}
