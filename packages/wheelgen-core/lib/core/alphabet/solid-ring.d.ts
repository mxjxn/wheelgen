import type p5 from 'p5';
export interface SolidRingDrawOptions {
    radius: number;
    width: number;
    saturations: number[];
    colors?: p5.Color[];
    baseColor: p5.Color;
    ringOpacity?: number;
    progress?: number;
    strokeWidth?: number;
}
export declare function drawSolidRing(p: p5, options: SolidRingDrawOptions): void;
