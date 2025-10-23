import type { Token } from './types';
export declare class Lexer {
    private input;
    private position;
    private line;
    private column;
    constructor(input: string);
    tokenize(): Token[];
    private createToken;
    private readNumber;
    private readIdentifier;
    private readString;
}
