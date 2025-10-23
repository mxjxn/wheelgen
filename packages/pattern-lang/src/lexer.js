export class Lexer {
    constructor(input) {
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.input = input;
    }
    tokenize() {
        const tokens = [];
        while (this.position < this.input.length) {
            const char = this.input[this.position];
            // Skip whitespace
            if (/\s/.test(char)) {
                if (char === '\n') {
                    this.line++;
                    this.column = 1;
                }
                else {
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
            // Numbers
            if (/\d/.test(char)) {
                const number = this.readNumber();
                tokens.push(this.createToken('NUMBER', number));
                continue;
            }
            // Identifiers (commands)
            if (/[a-zA-Z]/.test(char)) {
                const identifier = this.readIdentifier();
                // Check if it's a command
                if (['seq', 'mir', 'space'].includes(identifier.toLowerCase())) {
                    tokens.push(this.createToken('IDENTIFIER', identifier));
                }
                else {
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
    createToken(type, value) {
        const token = {
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
    readNumber() {
        let number = '';
        while (this.position < this.input.length && /\d/.test(this.input[this.position])) {
            number += this.input[this.position];
            this.position++;
            this.column++;
        }
        return number;
    }
    readIdentifier() {
        let identifier = '';
        while (this.position < this.input.length && /[a-zA-Z0-9]/.test(this.input[this.position])) {
            identifier += this.input[this.position];
            this.position++;
            this.column++;
        }
        return identifier;
    }
}
