import type p5 from 'p5';
import { DrawShapeFn } from '../model/types';
import { getPixelRenderer, PixelStrokeOptions } from './pixel-renderer';
import { 
  drawPixelDiamond, 
  drawPixelHorizontalHook, 
  drawPixelLStroke, 
  drawPixelVerticalHook, 
  drawPixelSolidRing 
} from './alphabet/pixel-alphabet';

/**
 * Hybrid rendering system that intelligently switches between
 * pixel-based and traditional rendering based on performance needs
 * and visual quality requirements.
 */

export type RenderingMode = 'pixel' | 'vector' | 'hybrid' | 'auto';

export interface RenderingConfig {
  mode: RenderingMode;
  pixelThreshold: number; // Switch to pixel rendering when particle count exceeds this
  qualityLevel: 'fast' | 'balanced' | 'high'; // Quality vs performance tradeoff
  enableCaching: boolean;
  maxCacheSize: number;
}

export interface HybridDrawOptions {
  w: number;
  h: number;
  offsets: number[];
  saturations: { startAlpha: number; endAlpha: number }[];
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

export class HybridRenderer {
  private config: RenderingConfig;
  private performanceMetrics = {
    pixelRenderTime: 0,
    vectorRenderTime: 0,
    pixelRenderCount: 0,
    vectorRenderCount: 0,
    totalParticles: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  constructor(config: Partial<RenderingConfig> = {}) {
    this.config = {
      mode: 'auto',
      pixelThreshold: 100, // Switch to pixel rendering for 100+ particles
      qualityLevel: 'balanced',
      enableCaching: true,
      maxCacheSize: 100,
      ...config
    };
  }

  /**
   * Update rendering configuration
   */
  updateConfig(newConfig: Partial<RenderingConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Update pixel renderer cache size
    if (newConfig.maxCacheSize) {
      const pixelRenderer = getPixelRenderer();
      // Note: We'd need to add a method to update cache size in PixelStrokeRenderer
    }
  }

  /**
   * Determine which rendering method to use based on current conditions
   */
  private shouldUsePixelRendering(options: HybridDrawOptions): boolean {
    const { mode, pixelThreshold, qualityLevel } = this.config;
    
    switch (mode) {
      case 'pixel':
        return true;
      case 'vector':
        return false;
      case 'hybrid':
        // Use pixel rendering for complex strokes or high particle counts
        return this.performanceMetrics.totalParticles > pixelThreshold ||
               options.strokeCount > 5 ||
               options.colorBleed > 0.5;
      case 'auto':
        // Automatic decision based on performance metrics
        if (this.performanceMetrics.totalParticles > pixelThreshold) {
          return true;
        }
        
        // Use pixel rendering for high quality mode
        if (qualityLevel === 'high') {
          return true;
        }
        
        // Use vector rendering for fast mode
        if (qualityLevel === 'fast') {
          return false;
        }
        
        // Balanced mode: use pixel for complex strokes
        return options.strokeCount > 3 || options.colorBleed > 0.3;
      default:
        return false;
    }
  }

  /**
   * Render a stroke using the appropriate method
   */
  renderStroke(p: p5, options: HybridDrawOptions, x: number, y: number, progress = 1.0) {
    const startTime = performance.now();
    
    // Update performance metrics
    this.performanceMetrics.totalParticles++;
    
    const usePixelRendering = this.shouldUsePixelRendering(options);
    
    if (usePixelRendering) {
      this.renderPixelStroke(p, options, x, y, progress);
      this.performanceMetrics.pixelRenderCount++;
    } else {
      this.renderVectorStroke(p, options, x, y, progress);
      this.performanceMetrics.vectorRenderCount++;
    }
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (usePixelRendering) {
      this.performanceMetrics.pixelRenderTime += renderTime;
    } else {
      this.performanceMetrics.vectorRenderTime += renderTime;
    }
  }

  /**
   * Render using pixel-based method
   */
  private renderPixelStroke(p: p5, options: HybridDrawOptions, x: number, y: number, progress: number) {
    const pixelRenderer = getPixelRenderer();
    
    const pixelOptions: PixelStrokeOptions = {
      w: options.w,
      h: options.h,
      strokeWidth: options.strokeWidth || 0.25,
      strokeCount: options.strokeCount || 1,
      colorBleed: options.colorBleed || 0,
      baseColor: options.baseColor,
      strokeType: options.strokeType,
      curveIntensity: options.curveIntensity,
      upwardLength: options.upwardLength,
      length: options.length,
      size: options.size,
      rotation: options.rotation
    };

    p.push();
    p.translate(x, y);
    pixelRenderer.renderStroke(p, pixelOptions, 0, 0, progress);
    p.pop();
  }

  /**
   * Render using traditional vector method
   */
  private renderVectorStroke(p: p5, options: HybridDrawOptions, x: number, y: number, progress: number) {
    // Import the original drawing functions
    const { drawCalligraphyDiamond } = require('./alphabet/diamond');
    const { drawCalligraphyHorizontalHook } = require('./alphabet/h-hook');
    const { drawCalligraphyLStroke } = require('./alphabet/l-stroke');
    const { drawCalligraphyVerticalHook } = require('./alphabet/v-hook');
    const { drawSolidRing } = require('./alphabet/solid-ring');

    p.push();
    p.translate(x, y);
    p.rotate(options.rotation || 0);

    // Convert to the original function format
    const originalOptions = {
      w: options.w,
      h: options.h,
      offsets: options.offsets,
      saturations: options.saturations,
      colors: options.colors,
      baseColor: options.baseColor,
      strokeWidth: options.strokeWidth,
      segments: 7,
      curveIntensity: options.curveIntensity,
      upwardLength: options.upwardLength,
      length: options.length,
      size: options.size,
      rotation: 0, // Already applied above
      progress
    };

    // Call the appropriate original function
    switch (options.strokeType) {
      case 'd':
        drawCalligraphyDiamond(p, originalOptions);
        break;
      case 'h':
        drawCalligraphyHorizontalHook(p, originalOptions);
        break;
      case 'l':
        drawCalligraphyLStroke(p, originalOptions);
        break;
      case 'v':
        drawCalligraphyVerticalHook(p, originalOptions);
        break;
      case '-':
        drawSolidRing(p, {
          radius: options.w / 2,
          width: options.h,
          saturations: options.saturations,
          colors: options.colors,
          baseColor: options.baseColor,
          ringOpacity: 100,
          strokeWidth: options.strokeWidth,
          progress
        });
        break;
    }

    p.pop();
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics() {
    const pixelRenderer = getPixelRenderer();
    const cacheStats = pixelRenderer.getCacheStats();
    
    return {
      ...this.performanceMetrics,
      cacheStats,
      averagePixelRenderTime: this.performanceMetrics.pixelRenderCount > 0 
        ? this.performanceMetrics.pixelRenderTime / this.performanceMetrics.pixelRenderCount 
        : 0,
      averageVectorRenderTime: this.performanceMetrics.vectorRenderCount > 0 
        ? this.performanceMetrics.vectorRenderTime / this.performanceMetrics.vectorRenderCount 
        : 0,
      pixelRenderPercentage: this.performanceMetrics.totalParticles > 0 
        ? (this.performanceMetrics.pixelRenderCount / this.performanceMetrics.totalParticles) * 100 
        : 0
    };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.performanceMetrics = {
      pixelRenderTime: 0,
      vectorRenderTime: 0,
      pixelRenderCount: 0,
      vectorRenderCount: 0,
      totalParticles: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  /**
   * Clear all caches
   */
  clearCaches() {
    const pixelRenderer = getPixelRenderer();
    pixelRenderer.clearCache();
  }

  /**
   * Get current configuration
   */
  getConfig(): RenderingConfig {
    return { ...this.config };
  }
}

// Global hybrid renderer instance
let hybridRenderer: HybridRenderer | null = null;

export function getHybridRenderer(): HybridRenderer {
  if (!hybridRenderer) {
    hybridRenderer = new HybridRenderer();
  }
  return hybridRenderer;
}

export function resetHybridRenderer() {
  hybridRenderer = null;
}
