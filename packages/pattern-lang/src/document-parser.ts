import type { DocumentAST, DocumentParseResult, RingDefinition, DotDefinition, VariableDefinition, PatternNode, ParseError, ColorNode, PaletteDefinition } from './types';
import { Parser } from './parser';

export class DocumentParser {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private variables: Map<string, PatternNode> = new Map();

  constructor(input: string) {
    this.input = input;
  }

  parse(): DocumentParseResult {
    try {
      const ast: DocumentAST = {
        rings: [],
        dot: undefined,
        guides: undefined,
        variables: []
      };

      // Parse each line
      const lines = this.input.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        this.line = i + 1;
        this.column = 1;
        
        // Skip empty lines and comments
        if (line === '' || line.startsWith(';;')) {
          continue;
        }

        // Parse sections
        if (line === 'rings:') {
          // Parse rings section
          const ringsResult = this.parseRingsSection(lines, i + 1);
          if (!ringsResult.success) {
            return ringsResult;
          }
          ast.rings = ringsResult.rings || [];
          i = ringsResult.nextLine || i;
        } else if (line === 'dot:') {
          // Parse dot section
          const dotResult = this.parseDotSection(lines, i + 1);
          if (!dotResult.success) {
            return dotResult;
          }
          ast.dot = dotResult.dot;
          i = dotResult.nextLine || i;
        } else if (line === 'guides:') {
          // Parse guides section
          const guidesResult = this.parseGuidesSection(lines, i + 1);
          if (!guidesResult.success) {
            return guidesResult;
          }
          ast.guides = guidesResult.guides;
          i = guidesResult.nextLine || i;
        } else if (line === 'variables:') {
          // Parse variables section
          const variablesResult = this.parseVariablesSection(lines, i + 1);
          if (!variablesResult.success) {
            return variablesResult;
          }
          ast.variables = variablesResult.variables || [];
          i = variablesResult.nextLine || i;
        } else if (line === 'palette:') {
          // Parse palette section
          const paletteResult = this.parsePaletteSection(lines, i + 1);
          if (!paletteResult.success) {
            return paletteResult;
          }
          ast.palette = paletteResult.palette;
          i = paletteResult.nextLine || i;
        } else {
          // Try to parse as a ring definition (backward compatibility)
          const ringResult = this.parseRingDefinition(line);
          if (ringResult.success && ringResult.ring) {
            ast.rings.push(ringResult.ring);
          }
        }
      }

      return {
        success: true,
        ast
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          position: this.position,
          line: this.line,
          column: this.column
        }
      };
    }
  }

  private parseRingsSection(lines: string[], startLine: number): { success: boolean; rings?: RingDefinition[]; nextLine?: number; error?: ParseError } {
    const rings: RingDefinition[] = [];
    let i = startLine;

    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Stop at next section
      if (line === 'dot:' || line === 'guides:' || line === 'variables:' || line === '') {
        break;
      }

      // Skip comments
      if (line.startsWith(';;')) {
        i++;
        continue;
      }

      // Parse ring definition: O(radius, count): pattern
      const ringMatch = line.match(/^O\((\d+(?:\.\d+)?),\s*(\d+)\):\s*(.+)$/);
      if (ringMatch) {
        const radius = parseFloat(ringMatch[1]);
        const elementCount = parseInt(ringMatch[2], 10);
        const patternStr = ringMatch[3];

        // Parse the pattern
        const patternParser = new Parser(patternStr);
        const patternResult = patternParser.parse();
        
        if (!patternResult.success) {
          return {
            success: false,
            error: patternResult.error
          };
        }

        rings.push({
          radius,
          elementCount,
          pattern: patternResult.ast!
        });
      } else {
        return {
          success: false,
          error: {
            message: `Invalid ring definition: ${line}`,
            position: 0,
            line: i + 1,
            column: 1
          }
        };
      }

      i++;
    }

    return {
      success: true,
      rings,
      nextLine: i - 1
    };
  }

  private parseDotSection(lines: string[], startLine: number): { success: boolean; dot?: DotDefinition; nextLine?: number; error?: ParseError } {
    const dot: DotDefinition = {};
    let i = startLine;

    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Stop at next section
      if (line === 'rings:' || line === 'guides:' || line === 'variables:' || line === '') {
        break;
      }

      // Skip comments
      if (line.startsWith(';;')) {
        i++;
        continue;
      }

      // Parse dot properties: key: value
      const propMatch = line.match(/^(\w+):\s*(.+)$/);
      if (propMatch) {
        const key = propMatch[1];
        const value = propMatch[2];

        switch (key) {
          case 'size':
            dot.size = parseFloat(value);
            break;
          case 'color':
            dot.color = value;
            break;
          case 'visible':
            dot.visible = value.toLowerCase() === 'true';
            break;
        }
      }

      i++;
    }

    return {
      success: true,
      dot,
      nextLine: i - 1
    };
  }

  private parseGuidesSection(lines: string[], startLine: number): { success: boolean; guides?: any; nextLine?: number; error?: ParseError } {
    let i = startLine;

    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Stop at next section
      if (line === 'rings:' || line === 'dot:' || line === 'variables:' || line === '') {
        break;
      }

      // Skip comments
      if (line.startsWith(';;')) {
        i++;
        continue;
      }

      // Future guides parsing
      i++;
    }

    return {
      success: true,
      guides: {},
      nextLine: i - 1
    };
  }

  private parseVariablesSection(lines: string[], startLine: number): { success: boolean; variables?: VariableDefinition[]; nextLine?: number; error?: ParseError } {
    const variables: VariableDefinition[] = [];
    let i = startLine;

    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Stop at next section
      if (line === 'rings:' || line === 'dot:' || line === 'guides:' || line === '') {
        break;
      }

      // Skip comments
      if (line.startsWith(';;')) {
        i++;
        continue;
      }

      // Parse variable definition: @name = pattern
      const varMatch = line.match(/^@(\w+)\s*=\s*(.+)$/);
      if (varMatch) {
        const name = varMatch[1];
        const patternStr = varMatch[2];

        // Parse the pattern
        const patternParser = new Parser(patternStr);
        const patternResult = patternParser.parse();
        
        if (!patternResult.success) {
          return {
            success: false,
            error: patternResult.error
          };
        }

        variables.push({
          name,
          pattern: patternResult.ast!
        });

        // Store in variables map for future reference
        this.variables.set(name, patternResult.ast!);
      } else {
        return {
          success: false,
          error: {
            message: `Invalid variable definition: ${line}`,
            position: 0,
            line: i + 1,
            column: 1
          }
        };
      }

      i++;
    }

    return {
      success: true,
      variables,
      nextLine: i - 1
    };
  }

  private parseRingDefinition(line: string): { success: boolean; ring?: RingDefinition; error?: ParseError } {
    // Try to parse as O(radius, count): pattern
    const ringMatch = line.match(/^O\((\d+(?:\.\d+)?),\s*(\d+)\):\s*(.+)$/);
    if (ringMatch) {
      const radius = parseFloat(ringMatch[1]);
      const elementCount = parseInt(ringMatch[2], 10);
      const patternStr = ringMatch[3];

      // Parse the pattern
      const patternParser = new Parser(patternStr);
      const patternResult = patternParser.parse();
      
      if (!patternResult.success) {
        return {
          success: false,
          error: patternResult.error
        };
      }

      return {
        success: true,
        ring: {
          radius,
          elementCount,
          pattern: patternResult.ast!
        }
      };
    }

    return {
      success: false,
      error: {
        message: `Invalid ring definition: ${line}`,
        position: 0,
        line: 1,
        column: 1
      }
    };
  }

  private parsePaletteSection(lines: string[], startLine: number): { success: boolean; palette?: PaletteDefinition; nextLine?: number; error?: ParseError } {
    const palette: PaletteDefinition = {};
    let i = startLine;

    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Stop at next section
      if (line === 'rings:' || line === 'dot:' || line === 'guides:' || line === 'variables:' || line === '') {
        break;
      }

      // Skip comments
      if (line.startsWith(';;')) {
        i++;
        continue;
      }

      // Parse color variable definition: A = triadic(...)
      const colorMatch = line.match(/^([A-Z])\s*=\s*(.+)$/);
      if (colorMatch) {
        const name = colorMatch[1];
        const colorExpression = colorMatch[2];

        // Parse the color expression
        const colorNode = this.parseColorExpression(colorExpression);
        if (colorNode) {
          palette[name] = colorNode;
        } else {
          return {
            success: false,
            error: {
              message: `Invalid color expression: ${colorExpression}`,
              position: 0,
              line: i + 1,
              column: 1
            }
          };
        }
      } else {
        return {
          success: false,
          error: {
            message: `Invalid palette definition: ${line}`,
            position: 0,
            line: i + 1,
            column: 1
          }
        };
      }

      i++;
    }

    return {
      success: true,
      palette,
      nextLine: i - 1
    };
  }

  private parseColorExpression(expression: string): ColorNode | null {
    const trimmed = expression.trim();
    
    // Parse color function calls like triadic(baseHue: 180, saturation: 85)
    const funcMatch = trimmed.match(/^(\w+)\((.*)\)$/);
    if (funcMatch) {
      const funcName = funcMatch[1].toLowerCase();
      const paramsStr = funcMatch[2];
      
      // Parse parameters
      const params: Record<string, number> = {};
      if (paramsStr.trim()) {
        const paramPairs = paramsStr.split(',');
        for (const pair of paramPairs) {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              params[key] = numValue;
            }
          }
        }
      }
      
      return {
        type: 'colorFunction',
        name: funcName,
        params
      };
    }
    
    // Parse RGB colors like rgb(255, 128, 64)
    const rgbMatch = trimmed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgbMatch) {
      return {
        type: 'colorRgb',
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10)
      };
    }
    
    // Parse HSB colors like hsb(180, 85, 90)
    const hsbMatch = trimmed.match(/^hsb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (hsbMatch) {
      return {
        type: 'colorHsb',
        h: parseInt(hsbMatch[1], 10),
        s: parseInt(hsbMatch[2], 10),
        b: parseInt(hsbMatch[3], 10)
      };
    }
    
    return null;
  }
}
