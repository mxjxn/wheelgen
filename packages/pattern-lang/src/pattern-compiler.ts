import type { PatternNode } from './types';
import { PatternExpander } from './expander';

/**
 * Compiles advanced pattern syntax (with $, mir(), seq(), etc.) 
 * down to basic character sequences for the controls UI
 */
export class PatternCompiler {
  private expander = new PatternExpander();

  /**
   * Compile a PatternNode AST to a basic character sequence
   * Examples:
   * - $Vx -> Vx
   * - mir($d) -> d (reversed)
   * - seq($dh, 3) -> dhdhdh
   */
  compilePattern(pattern: PatternNode): string {
    try {
      // Handle solid ring special case
      if (pattern.type === 'symbol' && pattern.char === '-') {
        return '-';
      }
      
      // Expand the pattern to get the actual character sequence
      const expandedItems = this.expander.expand(pattern);
      
      // Convert expanded items to character string
      let result = '';
      for (const item of expandedItems) {
        const char = item.rotated ? item.char.toUpperCase() : item.char.toLowerCase();
        // GrammarItem doesn't have count, so we just repeat the character once
        result += char;
      }
      
      return result;
    } catch (error) {
      console.warn('Pattern compilation failed:', error);
      return '';
    }
  }

  /**
   * Compile a pattern string to basic character sequence
   * Handles both document format ($Vx) and basic format (Vx)
   */
  compilePatternString(patternString: string): string {
    if (!patternString || patternString.trim() === '') {
      return '';
    }

    // Handle solid ring
    if (patternString.trim() === '-') {
      return '-';
    }

    // If it's already a basic pattern (no $ prefix), return as-is
    if (!patternString.startsWith('$')) {
      return patternString;
    }

    // Parse the pattern and compile it
    try {
      // Import parser dynamically to avoid circular dependencies
      const { Parser } = require('./parser');
      const parser = new Parser(patternString);
      const result = parser.parse();
      
      if (result.success && result.ast) {
        return this.compilePattern(result.ast);
      }
    } catch (error) {
      console.warn('Pattern string compilation failed:', error);
    }

    // Fallback: remove $ prefix and return
    return patternString.startsWith('$') ? patternString.slice(1) : patternString;
  }
}

// Export singleton instance
export const patternCompiler = new PatternCompiler();
