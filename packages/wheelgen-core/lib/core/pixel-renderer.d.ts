import type p5 from 'p5';
/**
 * Pixel-based stroke rendering system for improved performance
 *
 * This system addresses the computational bottlenecks in the current particle-based
 * rendering by pre-generating stroke textures and using single draw calls instead
 * of multiple line segments per particle.
 *
 * Performance Benefits:
 * - Single draw call per stroke instead of 7+ line segments
 * - Pre-computed textures cached for reuse
 * - Better texture simulation with actual pixel manipulation
 * - Significant performance improvement (potentially 10x+ faster)
 */
export interface PixelStrokeOptions {
    w: number;
    h: number;
    strokeWidth: number;
    strokeCount: number;
    colorBleed: number;
    baseColor: p5.Color;
    strokeType: 'd' | 'h' | 'l' | 'v' | '-';
    segments?: number;
    curveIntensity?: number;
    upwardLength?: number;
    length?: number;
    size?: number;
    rotation?: number;
}
export interface StrokeTexture {
    image: p5.Image;
    width: number;
    height: number;
    strokeCount: number;
    strokeWidth: number;
    colorBleed: number;
}
export declare class PixelStrokeRenderer {
    private strokeTextures;
    private maxCacheSize;
    private cacheHits;
    private cacheMisses;
    /**
     * Generate a unique cache key for stroke parameters
     */
    private getTextureKey;
    /**
     * Generate stroke texture based on stroke type
     */
    private generateStrokeTexture;
    /**
     * Generate diamond stroke texture
     */
    private generateDiamondTexture;
    /**
     * Generate horizontal hook stroke texture
     */
    private generateHorizontalHookTexture;
    /**
     * Generate L-stroke texture
     */
    private generateLStrokeTexture;
    /**
     * Generate vertical hook stroke texture
     */
    private generateVerticalHookTexture;
    /**
     * Generate solid ring stroke texture
     */
    private generateSolidRingTexture;
    /**
     * Draw a line using pixel manipulation
     */
    private drawPixelLine;
    /**
     * Draw a circle using pixel manipulation
     */
    private drawPixelCircle;
    /**
     * Render a stroke using cached texture
     */
    renderStroke(p: p5, options: PixelStrokeOptions, x: number, y: number, progress?: number): void;
    /**
     * Clear texture cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        hits: number;
        misses: number;
        hitRate: number;
    };
}
export declare function getPixelRenderer(): PixelStrokeRenderer;
export declare function clearPixelRendererCache(): void;
