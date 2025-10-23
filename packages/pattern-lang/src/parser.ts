import type { Token, PatternNode, ParseResult, ParseError } from './types';
import { Lexer } from './lexer';

export class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(input: string) {
    const lexer = new Lexer(input);
    this.tokens = lexer.tokenize();
  }

  parse(): ParseResult {
    try {
      const ast = this.parsePattern();
      
      // Check for element count suffix
      if (this.currentToken().type === 'COLON') {
        this.advance(); // consume ':'
        const countToken = this.expectToken('NUMBER');
        const count = parseInt(countToken.value, 10);
        
        return {
          success: true,
          ast: {
            type: 'elementCount',
            pattern: ast,
            count
          }
        };
      }

      return {
        success: true,
        ast
      };
    } catch (error) {
      return {
        success: false,
        error: error as ParseError
      };
    }
  }

  private parsePattern(): PatternNode {
    const token = this.currentToken();
    
    if (token.type === 'DOLLAR') {
      return this.parseSequence();
    }
    
    if (token.type === 'IDENTIFIER') {
      return this.parseCommand();
    }
    
    if (token.type === 'SYMBOL') {
      return this.parseSymbol();
    }
    
    throw this.createError(`Unexpected token: ${token.value}`, token);
  }

  private parseSequence(): PatternNode {
    this.expectToken('DOLLAR');
    
    const patterns: PatternNode[] = [];
    
    while (this.currentToken().type !== 'EOF' && 
           this.currentToken().type !== 'COLON' &&
           this.currentToken().type !== 'RPAREN' &&
           this.currentToken().type !== 'COMMA') {
      
      if (this.currentToken().type === 'SYMBOL') {
        patterns.push(this.parseSymbol());
      } else if (this.currentToken().type === 'IDENTIFIER') {
        patterns.push(this.parseCommand());
      } else {
        break;
      }
    }
    
    if (patterns.length === 0) {
      throw this.createError('Empty sequence after $', this.currentToken());
    }
    
    return {
      type: 'sequence',
      patterns
    };
  }

  private parseSymbol(): PatternNode {
    const token = this.expectToken('SYMBOL');
    const symbolString = token.value;
    
    // Parse individual characters from the symbol string
    const symbols: PatternNode[] = [];
    let i = 0;
    
    while (i < symbolString.length) {
      const char = symbolString[i];
      const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
      const baseChar = char.toLowerCase();
      
      // Check if it's a valid symbol
      if ('dhlvx'.includes(baseChar)) {
        // Check for count suffix (number after the character)
        let count = 1;
        let j = i + 1;
        while (j < symbolString.length && /\d/.test(symbolString[j])) {
          j++;
        }
        
        if (j > i + 1) {
          count = parseInt(symbolString.substring(i + 1, j), 10);
        }
        
        symbols.push({
          type: 'symbol',
          char: baseChar,
          rotated: isUpper,
          count
        });
        
        i = j;
      } else {
        i++;
      }
    }
    
    // If we parsed multiple symbols, return a sequence
    if (symbols.length > 1) {
      return {
        type: 'sequence',
        patterns: symbols
      };
    } else if (symbols.length === 1) {
      return symbols[0];
    } else {
      // Fallback for unknown symbols
      return {
        type: 'symbol',
        char: symbolString.toLowerCase(),
        rotated: false
      };
    }
  }

  private parseCommand(): PatternNode {
    const commandToken = this.expectToken('IDENTIFIER');
    const commandName = commandToken.value.toLowerCase();
    
    this.expectToken('LPAREN');
    
    const args: PatternNode[] = [];
    
    while (this.currentToken().type !== 'RPAREN') {
      args.push(this.parseArgument());
      
      if (this.currentToken().type === 'COMMA') {
        this.advance();
      } else if (this.currentToken().type !== 'RPAREN') {
        throw this.createError('Expected comma or closing parenthesis', this.currentToken());
      }
    }
    
    this.expectToken('RPAREN');
    
    return {
      type: 'command',
      name: commandName,
      args
    };
  }

  private parseArgument(): PatternNode {
    const token = this.currentToken();
    
    // Handle $ prefix for sequences in arguments
    if (token.type === 'DOLLAR') {
      return this.parseSequence();
    }
    
    // Handle @ prefix for variable references
    if (token.type === 'AT') {
      this.advance(); // consume '@'
      const nameToken = this.expectToken('IDENTIFIER');
      return {
        type: 'variableReference',
        name: nameToken.value
      };
    }
    
    // Handle identifiers (could be commands or symbols)
    if (token.type === 'IDENTIFIER') {
      // Check if it's a command by looking ahead for '('
      const nextToken = this.tokens[this.position + 1];
      if (nextToken && nextToken.type === 'LPAREN') {
        return this.parseCommand();
      } else {
        // Treat as symbol
        return this.parseSymbol();
      }
    }
    
    // Handle symbols
    if (token.type === 'SYMBOL') {
      return this.parseSymbol();
    }
    
    // Handle numbers (for repeat counts)
    if (token.type === 'NUMBER') {
      const numberToken = this.advance();
      return {
        type: 'symbol',
        char: 'x', // Use 'x' as placeholder for numbers
        rotated: false,
        count: parseInt(numberToken.value, 10)
      };
    }
    
    throw this.createError(`Unexpected token in argument: ${token.value}`, token);
  }

  private currentToken(): Token {
    return this.tokens[this.position] || this.tokens[this.tokens.length - 1];
  }

  private advance(): Token {
    if (this.position < this.tokens.length) {
      this.position++;
    }
    return this.tokens[this.position - 1];
  }

  private expectToken(expectedType: Token['type']): Token {
    const token = this.currentToken();
    if (token.type !== expectedType) {
      throw this.createError(`Expected ${expectedType}, got ${token.type}`, token);
    }
    return this.advance();
  }

  private createError(message: string, token: Token): ParseError {
    return {
      message,
      position: token.position,
      line: token.line,
      column: token.column
    };
  }
}
