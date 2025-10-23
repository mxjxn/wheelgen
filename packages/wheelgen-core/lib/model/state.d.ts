import type p5 from 'p5';
import { Ring } from './ring';
export interface GlobalsState {
    randomness: number;
    strokeCount: number;
    colorBleed: number;
}
export interface AppState {
    rings: Ring[];
    palette: p5.Color[];
    innerDot: {
        visible: boolean;
        radius: number;
        color1Index: number;
        color2Index: number;
        gradientStop: number;
        maxRadius: number;
    };
    globals: GlobalsState;
    guidesVisible: boolean;
    hasChanges: boolean;
}
export declare const state: AppState;
export declare function initializeArtwork(p: p5): void;
export declare function setPalette(p: p5): void;
export declare function markChanges(): void;
export declare function clearChanges(): void;
