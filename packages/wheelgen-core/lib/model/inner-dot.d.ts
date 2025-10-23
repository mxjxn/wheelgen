import type p5 from 'p5';
export interface InnerDotState {
    visible: boolean;
    radius: number;
    color1Index: number;
    color2Index: number;
    gradientStop: number;
    maxRadius: number;
    color1Opacity: number;
    color2Opacity: number;
}
export declare function drawInnerDot(p: p5, palette: p5.Color[], innerDot: InnerDotState, progress?: number): void;
