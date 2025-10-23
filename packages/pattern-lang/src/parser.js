import { Lexer } from './lexer';
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
                patterns.push(this.parseCommand());
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
        const token = this.expectToken('SYMBOL');
        const char = token.value.toLowerCase();
        const rotated = char !== token.value;
        // Check for count suffix
        let count;
        if (this.currentToken().type === 'NUMBER') {
            const countToken = this.advance();
            count = parseInt(countToken.value, 10);
        }
        return {
            type: 'symbol',
            char,
            rotated,
            count
        };
    }
    parseCommand() {
        const commandToken = this.expectToken('IDENTIFIER');
        const commandName = commandToken.value.toLowerCase();
        this.expectToken('LPAREN');
        const args = [];
        while (this.currentToken().type !== 'RPAREN') {
            args.push(this.parsePattern());
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
