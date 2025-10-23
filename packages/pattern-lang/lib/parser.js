import { Lexer } from './lexer.js';
export class Parser {
    constructor(input) {
        this.position = 0;
        const lexer = new Lexer(input);
        this.tokens = lexer.tokenize();
    }
    parse() {
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
        }
        catch (error) {
            return {
                success: false,
                error: error
            };
        }
    }
    parsePattern() {
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
    parseSequence() {
        this.expectToken('DOLLAR');
        const patterns = [];
        while (this.currentToken().type !== 'EOF' &&
            this.currentToken().type !== 'COLON' &&
            this.currentToken().type !== 'RPAREN' &&
            this.currentToken().type !== 'COMMA') {
            if (this.currentToken().type === 'SYMBOL') {
                patterns.push(this.parseSymbol());
            }
            else if (this.currentToken().type === 'IDENTIFIER') {
                // In sequence context, treat IDENTIFIERs as symbols
                patterns.push(this.parseSymbol());
            }
            else {
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
    parseSymbol() {
        const token = this.currentToken();
        // Handle both SYMBOL and IDENTIFIER tokens
        if (token.type !== 'SYMBOL' && token.type !== 'IDENTIFIER') {
            throw this.createError(`Expected SYMBOL or IDENTIFIER, got ${token.type}`, token);
        }
        this.advance(); // consume the token
        const symbolString = token.value;
        // Parse individual characters from the symbol string
        const symbols = [];
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
            }
            else {
                i++;
            }
        }
        // If we parsed multiple symbols, return a sequence
        if (symbols.length > 1) {
            return {
                type: 'sequence',
                patterns: symbols
            };
        }
        else if (symbols.length === 1) {
            return symbols[0];
        }
        else {
            // Fallback for unknown symbols
            return {
                type: 'symbol',
                char: symbolString.toLowerCase(),
                rotated: false
            };
        }
    }
    parseCommand() {
        const commandToken = this.expectToken('IDENTIFIER');
        const commandName = commandToken.value.toLowerCase();
        this.expectToken('LPAREN');
        const args = [];
        while (this.currentToken().type !== 'RPAREN') {
            args.push(this.parseArgument());
            if (this.currentToken().type === 'COMMA') {
                this.advance();
            }
            else if (this.currentToken().type !== 'RPAREN') {
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
    parseArgument() {
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
            }
            else {
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
    currentToken() {
        return this.tokens[this.position] || this.tokens[this.tokens.length - 1];
    }
    advance() {
        if (this.position < this.tokens.length) {
            this.position++;
        }
        return this.tokens[this.position - 1];
    }
    expectToken(expectedType) {
        const token = this.currentToken();
        if (token.type !== expectedType) {
            throw this.createError(`Expected ${expectedType}, got ${token.type}`, token);
        }
        return this.advance();
    }
    createError(message, token) {
        return {
            message,
            position: token.position,
            line: token.line,
            column: token.column
        };
    }
}
