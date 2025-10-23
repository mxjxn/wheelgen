import type { Token, TokenType } from './types';

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (this.position < this.input.length) {
      const char = this.input[this.position];
      
      // Skip whitespace
      if (/\s/.test(char)) {
        if (char === '\n') {
          this.line++;
          this.column = 1;
        } else {
          this.column++;
        }
        this.position++;
        continue;
      }

      // Single character tokens
      if (char === '$') {
        tokens.push(this.createToken('DOLLAR', '$'));
        continue;
      }
      
      if (char === '@') {
        tokens.push(this.createToken('AT', '@'));
        continue;
      }
      
      if (char === '(') {
        tokens.push(this.createToken('LPAREN', '('));
        continue;
      }
      
      if (char === ')') {
        tokens.push(this.createToken('RPAREN', ')'));
        continue;
      }
      
      if (char === ',') {
        tokens.push(this.createToken('COMMA', ','));
        continue;
      }
      
      if (char === ':') {
        tokens.push(this.createToken('COLON', ':'));
        continue;
      }
      
      if (char === '=') {
        tokens.push(this.createToken('EQUALS', '='));
        continue;
      }
      
      if (char === '[') {
        tokens.push(this.createToken('LBRACKET', '['));
        continue;
      }
      
      if (char === ']') {
        tokens.push(this.createToken('RBRACKET', ']'));
        continue;
      }
      
      if (char === '"' || char === "'") {
        const string = this.readString();
        tokens.push(this.createToken('STRING', string));
        continue;
      }

      // Numbers
      if (/\d/.test(char)) {
        const number = this.readNumber();
        tokens.push(this.createToken('NUMBER', number));
        continue;
      }

      // Identifiers (commands)
      if (/[a-zA-Z]/.test(char)) {
        const identifier = this.readIdentifier();
        
        // Check if it's a command or color function
        if (['seq', 'mir', 'space', 'triadic', 'complementary', 'tetradic', 'analogous', 'rgb', 'hsb'].includes(identifier.toLowerCase())) {
          tokens.push(this.createToken('IDENTIFIER', identifier));
        } else {
          // Single character symbols
          tokens.push(this.createToken('SYMBOL', identifier));
        }
        continue;
      }

      // Unknown character
      this.position++;
      this.column++;
    }

    tokens.push(this.createToken('EOF', ''));
    return tokens;
  }

  private createToken(type: TokenType, value: string): Token {
    const token: Token = {
      type,
      value,
      position: this.position,
      line: this.line,
      column: this.column
    };
    
    this.position++;
    this.column++;
    
    return token;
  }

  private readNumber(): string {
    let number = '';
    while (this.position < this.input.length && /\d/.test(this.input[this.position])) {
      number += this.input[this.position];
      this.position++;
      this.column++;
    }
    return number;
  }

  private readIdentifier(): string {
    let identifier = '';
    while (this.position < this.input.length && /[a-zA-Z0-9]/.test(this.input[this.position])) {
      identifier += this.input[this.position];
      this.position++;
      this.column++;
    }
    return identifier;
  }

  private readString(): string {
    const quote = this.input[this.position];
    this.position++;
    this.column++;
    
    let string = '';
    while (this.position < this.input.length && this.input[this.position] !== quote) {
      string += this.input[this.position];
      this.position++;
      this.column++;
    }
    
    // Consume the closing quote
    if (this.position < this.input.length) {
      this.position++;
      this.column++;
    }
    
    return string;
  }
}
