import type p5 from 'p5';
import { DrawShapeFn } from './types';
export declare function clearLoggedGrammars(): void;
export declare function logRingStrokeData(p: p5): void;
export declare class Particle {
    radius: number;
    angle: number;
    drawShape: DrawShapeFn;
    isRotated: boolean;
    baseColor: p5.Color;
    ringIndex: number;
    strokeType?: string;
    private geometry;
    private shapeOptions;
    private offsets;
    private saturations;
    private colors;
    constructor(radius: number, angle: number, drawFunc: DrawShapeFn, baseColor: p5.Color, shapeOptions: Record<string, {
        min: number;
        max: number;
        value: number;
    }>, isRotated: boolean | undefined, ringIndex: number | undefined, p: p5, strokeType?: string);
    updateStrokeData(p: p5): void;
    private getRandomizedValue;
    private getOptions;
    display(p: p5, progress?: number): void;
}
