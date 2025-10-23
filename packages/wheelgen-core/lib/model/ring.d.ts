import type p5 from 'p5';
export declare class Ring {
    radius: number;
    baseColor: p5.Color;
    ringIndex: number;
    visible: boolean;
    grammarString: string;
    private solidRingData?;
    private isSolid;
    private _pattern;
    private shapeOptions;
    private particles;
    strokeColors: Record<string, number>;
    constructor(radius: number, baseColor: p5.Color, ringIndex: number);
    display(p: p5, progress?: number): void;
    updateColor(newColor: p5.Color, p?: p5): void;
    get isSolidRing(): boolean;
    getShapeOptionsFor(symbol: string): Record<string, {
        min: number;
        max: number;
        value: number;
    }>;
    getAvailableSymbols(): string[];
    get pattern(): {
        char: "d" | "h" | "l" | "v" | "x";
        rotated: boolean;
    }[];
    updateParticles(p: p5): void;
    applyChanges(p: p5): void;
    setPattern(p: p5, grammarString: string): void;
    private getDefaultShapeOptions;
    private regenerateParticles;
    getStrokeColor(strokeType: string, palette: p5.Color[], p: p5): p5.Color;
    updateParticlesForStrokeType(strokeType: string, p: p5): void;
}
