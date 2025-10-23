import type { GrammarItem } from '@wheelgen/types';
export type TokenType = 'DOLLAR' | 'LPAREN' | 'RPAREN' | 'COMMA' | 'COLON' | 'IDENTIFIER' | 'NUMBER' | 'SYMBOL' | 'EOF';
export interface Token {
    type: TokenType;
    value: string;
    position: number;
    line: number;
    column: number;
}
export type PatternNode = {
    type: 'symbol';
    char: string;
    rotated: boolean;
    count?: number;
} | {
    type: 'sequence';
    patterns: PatternNode[];
    count?: number;
} | {
    type: 'command';
    name: string;
    args: PatternNode[];
    count?: number;
} | {
    type: 'elementCount';
    pattern: PatternNode;
    count: number;
};
export interface ParseResult {
    success: boolean;
    ast?: PatternNode;
    error?: ParseError;
    expanded?: GrammarItem[];
}
export interface ParseError {
    message: string;
    position: number;
    line: number;
    column: number;
    suggestion?: string;
}
export interface CommandDefinition {
    name: string;
    minArgs: number;
    maxArgs?: number;
    description: string;
    example: string;
}
