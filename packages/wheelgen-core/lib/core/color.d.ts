import type p5 from 'p5';
export declare function generatePalette(p: p5): p5.Color[];
/**
 * Generate palette using direct RGB values to avoid conversion precision loss
 */
export declare function generateDirectRgbPalette(p: p5): p5.Color[];
export declare function createHSBColor(p: p5, h: number, s: number, b: number): p5.Color;
export declare function colorToRgbString(p: p5, color: p5.Color): string;
export declare function batchConvertColorsToRgb(p: p5, colors: p5.Color[]): string[];
export declare function hsbToRgb(p: p5, h: number, s: number, b: number): string;
export declare function logColorInfo(p: p5, color: p5.Color, label: string): void;
export declare function logPaletteColors(p: p5, palette: p5.Color[]): void;
