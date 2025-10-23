import type p5 from 'p5';
/**
 * Direct RGB palette system that eliminates HSB conversion issues
 */
export declare class DirectRgbPalette {
    private p;
    private colors;
    constructor(p: p5);
    /**
     * Generate a palette using direct RGB values to avoid conversion issues
     */
    private generateDirectRgbPalette;
    /**
     * Get all colors in the palette
     */
    getColors(): p5.Color[];
    /**
     * Get a specific color by index
     */
    getColor(index: number): p5.Color;
    /**
     * Get RGB string for UI display (no conversion needed)
     */
    getColorRgbString(index: number): string;
    /**
     * Generate a new random palette using direct RGB values
     */
    generateNewPalette(): void;
    /**
     * Convert HSB to RGB manually to avoid p5 conversion precision issues
     */
    private hsbToRgb;
    /**
     * Test color consistency
     */
    testConsistency(): void;
}
/**
 * Create a direct RGB palette instance
 */
export declare function createDirectRgbPalette(p: p5): DirectRgbPalette;
