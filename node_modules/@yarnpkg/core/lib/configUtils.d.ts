export declare const RESOLVED_RC_FILE: unique symbol;
export declare function resolveRcFiles(rcFiles: Array<[string, unknown]>): [string, Record<string, unknown>, symbol] | null;
export declare function getValue(value: unknown): unknown;
export declare function getValueByTree(valueBase: unknown): unknown;
export declare function getSource(value: unknown): string | null;
