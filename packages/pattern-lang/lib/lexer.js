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
                tokens.push({
                    type: 'NUMBER',
                    value: number,
                    position: this.position - number.length,
                    line: this.line,
                    column: this.column - number.length
                });
                continue;
            }
            // Identifiers (commands)
            if (/[a-zA-Z]/.test(char)) {
                const identifier = this.readIdentifier();
                // Check if it's a command or color function
                if (['seq', 'mir', 'space', 'triadic', 'complementary', 'tetradic', 'analogous', 'rgb', 'hsb'].includes(identifier.toLowerCase())) {
                    tokens.push({
                        type: 'IDENTIFIER',
                        value: identifier,
                        position: this.position - identifier.length,
                        line: this.line,
                        column: this.column - identifier.length
                    });
                }
                else if (identifier.length === 1) {
                    // Single character symbols
                    tokens.push({
                        type: 'SYMBOL',
                        value: identifier,
                        position: this.position - identifier.length,
                        line: this.line,
                        column: this.column - identifier.length
                    });
                }
                else {
                    // Multi-character identifiers (variable names, etc.)
                    tokens.push({
                        type: 'IDENTIFIER',
                        value: identifier,
                        position: this.position - identifier.length,
                        line: this.line,
                        column: this.column - identifier.length
                    });
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
    readString() {
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
