import type { ParseResult, DocumentParseResult } from './types';
export declare function parsePattern(input: string): ParseResult;
export declare function parseDocument(input: string): DocumentParseResult;
export declare const COMMANDS: readonly [{
    readonly name: "seq";
    readonly minArgs: 3;
    readonly description: "Sequence patterns together, repeat n times";
    readonly example: "seq($d, $h, $l, 3) → dhldhldhl";
}, {
    readonly name: "mir";
    readonly minArgs: 1;
    readonly maxArgs: 1;
    readonly description: "Mirror/reverse pattern";
    readonly example: "mir($dhlv) → vlhd";
}, {
    readonly name: "space";
    readonly minArgs: 3;
    readonly description: "Add spacing between patterns";
    readonly example: "space($dhl, 2) → dxxhxxl";
}];
export declare function isPatternLanguage(input: string): boolean;
