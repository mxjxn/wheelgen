import { Parser } from './parser';
import { PatternExpander, patternToGrammarString } from './expander';
import { DocumentParser } from './document-parser';
import { patternCompiler } from './pattern-compiler';
export { Parser, PatternExpander, patternToGrammarString, DocumentParser, patternCompiler };
export function parsePattern(input) {
    const parser = new Parser(input);
    const parseResult = parser.parse();
    if (!parseResult.success || !parseResult.ast) {
        return parseResult;
    }
    try {
        const expander = new PatternExpander();
        const expanded = expander.expand(parseResult.ast);
        return {
            success: true,
            ast: parseResult.ast,
            expanded
        };
    }
    catch (error) {
        return {
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                position: 0,
                line: 1,
                column: 1
            }
        };
    }
}
export function parseDocument(input) {
    const parser = new DocumentParser(input);
    return parser.parse();
}
// Command definitions for help/suggestions
export const COMMANDS = [
    {
        name: 'seq',
        minArgs: 3,
        description: 'Sequence patterns together, repeat n times',
        example: 'seq($d, $h, $l, 3) → dhldhldhl'
    },
    {
        name: 'mir',
        minArgs: 1,
        maxArgs: 1,
        description: 'Mirror/reverse pattern',
        example: 'mir($dhlv) → vlhd'
    },
    {
        name: 'space',
        minArgs: 3,
        description: 'Add spacing between patterns',
        example: 'space($dhl, 2) → dxxhxxl'
    }
];
// Validate if a pattern uses the new syntax
export function isPatternLanguage(input) {
    return input.includes('$') ||
        input.includes('seq(') ||
        input.includes('mir(') ||
        input.includes('space(') ||
        input.includes(':');
}
