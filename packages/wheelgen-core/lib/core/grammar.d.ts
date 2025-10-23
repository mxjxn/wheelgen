import { drawCalligraphyDiamond } from './alphabet/diamond';
import { drawCalligraphyHorizontalHook } from './alphabet/h-hook';
import { drawCalligraphyHook } from './alphabet/v-hook';
import { drawCalligraphyLStroke } from './alphabet/l-stroke';
import { drawSolidRing } from './alphabet/solid-ring';
export type SymbolKey = 'd' | 'h' | 'l' | 'v' | 'x' | '-' | 'solid';
export interface GrammarItem {
    char: 'd' | 'h' | 'l' | 'v' | 'x';
    rotated: boolean;
}
export declare const strokeNames: Record<string, string>;
export declare const alphabet: {
    d: typeof drawCalligraphyDiamond;
    h: typeof drawCalligraphyHorizontalHook;
    l: typeof drawCalligraphyLStroke;
    v: typeof drawCalligraphyHook;
    solid: typeof drawSolidRing;
};
export declare function parseGrammar(grammarString: string): GrammarItem[];
