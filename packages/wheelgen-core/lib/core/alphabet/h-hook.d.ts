import type p5 from 'p5';
export interface HorizontalHookDrawOptions {
    w: number;
    h: number;
    offsets: number[];
    saturations: {
        startAlpha: number;
        endAlpha: number;
    }[];
    colors?: p5.Color[];
    baseColor: p5.Color;
    curveIntensity?: number;
    strokeWidth?: number;
    segments?: number;
    size?: number;
    rotation?: number;
    progress?: number;
}
export declare function drawCalligraphyHorizontalHook(p: p5, options: HorizontalHookDrawOptions): void;
