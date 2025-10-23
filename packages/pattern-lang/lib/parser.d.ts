import type { ParseResult } from './types';
export declare class Parser {
    private tokens;
    private position;
    constructor(input: string);
    parse(): ParseResult;
    private parsePattern;
    private parseSequence;
    private parseSymbol;
    private parseCommand;
    private parseArgument;
    private currentToken;
    private advance;
    private expectToken;
    private createError;
}
