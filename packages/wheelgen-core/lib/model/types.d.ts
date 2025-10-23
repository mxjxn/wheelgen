import type p5 from 'p5';
export type StrokeName = 'd' | 'h' | 'l' | 'v' | 'solid' | 'x';
export interface RangeParam {
    min: number;
    max: number;
    value: number;
}
export type RangeParamMap = Record<string, RangeParam>;
export interface StrokeOptionsBase {
    strokeWidth: RangeParam;
    rotation: RangeParam;
    size: RangeParam;
}
export interface DiamondOptions extends StrokeOptionsBase {
    length: RangeParam;
}
export interface HookOptions extends StrokeOptionsBase {
    curveIntensity: RangeParam;
}
export interface LStrokeOptions extends StrokeOptionsBase {
    upwardLength: RangeParam;
}
export interface SolidRingOptions {
    ringOpacity: RangeParam;
}
export type AnyStrokeOptions = DiamondOptions | HookOptions | LStrokeOptions | StrokeOptionsBase;
export interface ParticleGeometry {
    w: number;
    h: number;
}
export interface DrawOptionsCommon {
    w: number;
    h: number;
    progress: number;
}
export type P5 = p5;
export interface SolidRingData {
    radius: number;
    width: number;
    saturations: number[];
    baseColor: p5.Color;
    ringOpacity: number;
}
export type DrawShapeFn = (p: p5, options: any) => void;
