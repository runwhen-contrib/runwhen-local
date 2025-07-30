import type { CodeFormat } from './code-format';
export declare class JSONWriter {
    private readonly indentationType;
    private readonly indentationSize;
    constructor(codeFormat?: CodeFormat);
    write(json: unknown, newLineAtTheEnd?: boolean): string;
    private get indentation();
}
