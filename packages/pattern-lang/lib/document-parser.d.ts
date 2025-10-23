import type { DocumentParseResult } from './types';
export declare class DocumentParser {
    private input;
    private position;
    private line;
    private column;
    private variables;
    constructor(input: string);
    parse(): DocumentParseResult;
    private parseRingsSection;
    private parseDotSection;
    private parseGuidesSection;
    private parseVariablesSection;
    private parseRingDefinition;
    private parsePaletteSection;
    private parseColorExpression;
}
