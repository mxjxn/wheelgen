import type { PatternNode } from './types';
import type { GrammarItem } from '@wheelgen/types';
export declare class PatternExpander {
    expand(ast: PatternNode): GrammarItem[];
    private expandNode;
    private expandSymbol;
    private expandSequence;
    private expandCommand;
    private expandSeqCommand;
    private expandMirCommand;
    private expandSpaceCommand;
    private expandElementCount;
}
