import type p5 from 'p5';
/**
 * Simple palette system using direct RGB values to eliminate conversion issues
 */
export declare class SimplePalette {
    private p;
    private colors;
    constructor(p: p5);
    /**
     * Create simple, predictable colors using direct RGB values
     */
    private setupSimpleColors;
    /**
     * Get all colors in the palette
     */
    getColors(): p5.Color[];
    /**
     * Get a specific color by index
     */
    getColor(index: number): p5.Color;
    /**
     * Get color name for display
     */
    getColorName(index: number): string;
    /**
     * Get RGB string for UI display
     */
    getColorRgbString(index: number): string;
    /**
     * Test color consistency
     */
    testConsistency(): void;
}
/**
 * Create a simple palette instance
 */
export declare function createSimplePalette(p: p5): SimplePalette;
