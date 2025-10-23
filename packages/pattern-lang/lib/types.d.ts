import type { GrammarItem } from '@wheelgen/types';
export type TokenType = 'DOLLAR' | 'AT' | 'LPAREN' | 'RPAREN' | 'COMMA' | 'COLON' | 'EQUALS' | 'LBRACKET' | 'RBRACKET' | 'IDENTIFIER' | 'NUMBER' | 'SYMBOL' | 'STRING' | 'EOF';
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
} | {
    type: 'variableReference';
    name: string;
};
export type ColorNode = {
    type: 'colorFunction';
    name: string;
    params: Record<string, number>;
} | {
    type: 'colorRgb';
    r: number;
    g: number;
    b: number;
} | {
    type: 'colorHsb';
    h: number;
    s: number;
    b: number;
} | {
    type: 'colorReference';
    name: string;
};
export type PaletteDefinition = {
    [name: string]: ColorNode;
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
export interface DocumentAST {
    rings: RingDefinition[];
    dot?: DotDefinition;
    guides?: GuidesDefinition;
    variables?: VariableDefinition[];
    palette?: PaletteDefinition;
}
export interface RingDefinition {
    radius: number;
    elementCount: number;
    pattern: PatternNode;
    colors?: string[];
}
export interface DotDefinition {
    size?: number;
    color?: string;
    visible?: boolean;
}
export interface GuidesDefinition {
}
export interface VariableDefinition {
    name: string;
    pattern: PatternNode;
}
export interface DocumentParseResult {
    success: boolean;
    ast?: DocumentAST;
    error?: ParseError;
}
