import type { PatternNode } from './types';
/**
 * Compiles advanced pattern syntax (with $, mir(), seq(), etc.)
 * down to basic character sequences for the controls UI
 */
export declare class PatternCompiler {
    private expander;
    /**
     * Compile a PatternNode AST to a basic character sequence
     * Examples:
     * - $Vx -> Vx
     * - mir($d) -> d (reversed)
     * - seq($dh, 3) -> dhdhdh
     */
    compilePattern(pattern: PatternNode): string;
    /**
     * Compile a pattern string to basic character sequence
     * Handles both document format ($Vx) and basic format (Vx)
     */
    compilePatternString(patternString: string): string;
}
export declare const patternCompiler: PatternCompiler;
