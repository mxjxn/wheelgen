import type p5 from 'p5';
export interface LStrokeDrawOptions {
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
    upwardLength?: number;
    size?: number;
    rotation?: number;
    progress?: number;
}
export declare function drawCalligraphyLStroke(p: p5, options: LStrokeDrawOptions): void;
