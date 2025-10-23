import type p5 from 'p5';
/**
 * Pixel-based alphabet drawing functions
 *
 * These functions use the PixelStrokeRenderer to generate high-performance
 * stroke textures instead of drawing multiple line segments per particle.
 *
 * Performance Benefits:
 * - Single draw call per stroke instead of 7+ line segments
 * - Pre-computed textures cached for reuse
 * - Better texture simulation with actual pixel manipulation
 * - Significant performance improvement (potentially 10x+ faster)
 */
export interface PixelDiamondDrawOptions {
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
    strokeCount?: number;
    colorBleed?: number;
    segments?: number;
    length?: number;
    size?: number;
    rotation?: number;
    progress?: number;
}
export declare function drawPixelDiamond(p: p5, options: PixelDiamondDrawOptions): void;
export interface PixelHorizontalHookDrawOptions {
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
    strokeCount?: number;
    colorBleed?: number;
    segments?: number;
    size?: number;
    rotation?: number;
    progress?: number;
}
export declare function drawPixelHorizontalHook(p: p5, options: PixelHorizontalHookDrawOptions): void;
export interface PixelLStrokeDrawOptions {
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
    strokeCount?: number;
    colorBleed?: number;
    segments?: number;
    upwardLength?: number;
    size?: number;
    rotation?: number;
    progress?: number;
}
export declare function drawPixelLStroke(p: p5, options: PixelLStrokeDrawOptions): void;
export interface PixelVerticalHookDrawOptions {
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
    strokeCount?: number;
    colorBleed?: number;
    segments?: number;
    size?: number;
    rotation?: number;
    progress?: number;
}
export declare function drawPixelVerticalHook(p: p5, options: PixelVerticalHookDrawOptions): void;
export interface PixelSolidRingDrawOptions {
    radius: number;
    width: number;
    saturations: {
        startAlpha: number;
        endAlpha: number;
    }[];
    colors?: p5.Color[];
    baseColor: p5.Color;
    ringOpacity?: number;
    strokeWidth?: number;
    strokeCount?: number;
    colorBleed?: number;
    progress?: number;
}
export declare function drawPixelSolidRing(p: p5, options: PixelSolidRingDrawOptions): void;
