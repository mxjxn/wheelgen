import type p5 from 'p5';
/**
 * Hybrid rendering system that intelligently switches between
 * pixel-based and traditional rendering based on performance needs
 * and visual quality requirements.
 */
export type RenderingMode = 'pixel' | 'vector' | 'hybrid' | 'auto';
export interface RenderingConfig {
    mode: RenderingMode;
    pixelThreshold: number;
    qualityLevel: 'fast' | 'balanced' | 'high';
    enableCaching: boolean;
    maxCacheSize: number;
}
export interface HybridDrawOptions {
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
    curveIntensity?: number;
    upwardLength?: number;
    length?: number;
    size?: number;
    rotation?: number;
    progress?: number;
    strokeType: 'd' | 'h' | 'l' | 'v' | '-';
}
export declare class HybridRenderer {
    private config;
    private performanceMetrics;
    constructor(config?: Partial<RenderingConfig>);
    /**
     * Update rendering configuration
     */
    updateConfig(newConfig: Partial<RenderingConfig>): void;
    /**
     * Determine which rendering method to use based on current conditions
     */
    private shouldUsePixelRendering;
    /**
     * Render a stroke using the appropriate method
     */
    renderStroke(p: p5, options: HybridDrawOptions, x: number, y: number, progress?: number): void;
    /**
     * Render using pixel-based method
     */
    private renderPixelStroke;
    /**
     * Render using traditional vector method
     */
    private renderVectorStroke;
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics(): {
        cacheStats: {
            size: number;
            hits: number;
            misses: number;
            hitRate: number;
        };
        averagePixelRenderTime: number;
        averageVectorRenderTime: number;
        pixelRenderPercentage: number;
        pixelRenderTime: number;
        vectorRenderTime: number;
        pixelRenderCount: number;
        vectorRenderCount: number;
        totalParticles: number;
        cacheHits: number;
        cacheMisses: number;
    };
    /**
     * Reset performance metrics
     */
    resetMetrics(): void;
    /**
     * Clear all caches
     */
    clearCaches(): void;
    /**
     * Get current configuration
     */
    getConfig(): RenderingConfig;
}
export declare function getHybridRenderer(): HybridRenderer;
export declare function resetHybridRenderer(): void;
