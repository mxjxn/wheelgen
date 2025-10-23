import type p5 from 'p5';
export interface DiamondDrawOptions {
    w: number;
    h: number;
    offsets: number[];
    saturations: {
        startAlpha: number;
        endAlpha: number;
    }[];
    colors?: p5.Color[];
    baseColor: p5.Color;
    strokeWidth?: number;
    segments?: number;
    length?: number;
    size?: number;
    rotation?: number;
    progress?: number;
}
export declare function drawCalligraphyDiamond(p: p5, options: DiamondDrawOptions): void;
