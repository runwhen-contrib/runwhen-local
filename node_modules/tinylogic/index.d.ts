export type Parser = (str: string, check: (name: string) => boolean) => boolean;
export type MakeParser = (queryPattern: RegExp) => Parser;

export const makeParser: MakeParser;
export const parser: Parser;
