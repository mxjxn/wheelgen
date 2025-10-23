import type { GrammarItem } from '@wheelgen/types';

// Token types for lexer
export type TokenType = 
  | 'DOLLAR'      // $
  | 'AT'          // @
  | 'LPAREN'      // (
  | 'RPAREN'      // )
  | 'COMMA'       // ,
  | 'COLON'       // :
  | 'EQUALS'      // =
  | 'LBRACKET'    // [
  | 'RBRACKET'    // ]
  | 'IDENTIFIER'  // seq, mir, space, triadic, complementary, etc.
  | 'NUMBER'      // 1, 2, 3, etc.
  | 'SYMBOL'      // d, h, l, v, x, D, H, L, V
  | 'STRING'      // "color name" or 'color name'
  | 'EOF';        // end of input

export interface Token {
  type: TokenType;
  value: string;
  position: number;
  line: number;
  column: number;
}

// AST node types
export type PatternNode = 
  | { type: 'symbol', char: string, rotated: boolean, count?: number }
  | { type: 'sequence', patterns: PatternNode[], count?: number }
  | { type: 'command', name: string, args: PatternNode[], count?: number }
  | { type: 'elementCount', pattern: PatternNode, count: number }
  | { type: 'variableReference', name: string };

// Color AST node types
export type ColorNode = 
  | { type: 'colorFunction', name: string, params: Record<string, number> }
  | { type: 'colorRgb', r: number, g: number, b: number }
  | { type: 'colorHsb', h: number, s: number, b: number }
  | { type: 'colorReference', name: string };

export type PaletteDefinition = {
  [name: string]: ColorNode;
};

// Parse result with error information
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

// Command definitions
export interface CommandDefinition {
  name: string;
  minArgs: number;
  maxArgs?: number;
  description: string;
  example: string;
}

// Document AST types
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
  colors?: string[]; // References to palette like ['A', 'B', 'C']
}

export interface DotDefinition {
  size?: number;
  color?: string;
  visible?: boolean;
}

export interface GuidesDefinition {
  // Future grid controls
}

export interface VariableDefinition {
  name: string;
  pattern: PatternNode;
}

// Document parse result
export interface DocumentParseResult {
  success: boolean;
  ast?: DocumentAST;
  error?: ParseError;
}
