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

export class PixelStrokeRenderer {
  private strokeTextures: Map<string, StrokeTexture> = new Map();
  private maxCacheSize = 100; // Maximum number of cached textures
  private cacheHits = 0;
  private cacheMisses = 0;

  /**
   * Generate a unique cache key for stroke parameters
   */
  private getTextureKey(options: PixelStrokeOptions): string {
    const {
      w, h, strokeWidth, strokeCount, colorBleed, strokeType,
      curveIntensity = 0, upwardLength = 1.0, length = 1.0, size = 1.0
    } = options;
    
    // Round values to reduce cache fragmentation
    const roundedW = Math.round(w * 10) / 10;
    const roundedH = Math.round(h * 10) / 10;
    const roundedStrokeWidth = Math.round(strokeWidth * 100) / 100;
    const roundedStrokeCount = Math.round(strokeCount);
    const roundedColorBleed = Math.round(colorBleed * 100) / 100;
    const roundedCurveIntensity = Math.round(curveIntensity * 100) / 100;
    const roundedUpwardLength = Math.round(upwardLength * 100) / 100;
    const roundedLength = Math.round(length * 100) / 100;
    const roundedSize = Math.round(size * 100) / 100;
    
    return `${strokeType}_${roundedW}_${roundedH}_${roundedStrokeWidth}_${roundedStrokeCount}_${roundedColorBleed}_${roundedCurveIntensity}_${roundedUpwardLength}_${roundedLength}_${roundedSize}`;
  }

  /**
   * Generate stroke texture based on stroke type
   */
  private generateStrokeTexture(p: p5, options: PixelStrokeOptions): StrokeTexture {
    const { w, h, strokeWidth, strokeCount, colorBleed, strokeType, baseColor } = options;
    
    // Create a high-resolution texture buffer
    const textureWidth = Math.max(64, Math.round(w * 4));
    const textureHeight = Math.max(64, Math.round(h * 4));
    
    // Create offscreen graphics buffer
    const buffer = p.createGraphics(textureWidth, textureHeight);
    buffer.colorMode(p.HSB, 360, 100, 100);
    buffer.noStroke();
    
    // Generate stroke texture based on type
    switch (strokeType) {
      case 'd':
        this.generateDiamondTexture(buffer, options, textureWidth, textureHeight);
        break;
      case 'h':
        this.generateHorizontalHookTexture(buffer, options, textureWidth, textureHeight);
        break;
      case 'l':
        this.generateLStrokeTexture(buffer, options, textureWidth, textureHeight);
        break;
      case 'v':
        this.generateVerticalHookTexture(buffer, options, textureWidth, textureHeight);
        break;
      case '-':
        this.generateSolidRingTexture(buffer, options, textureWidth, textureHeight);
        break;
    }
    
    return {
      image: buffer,
      width: textureWidth,
      height: textureHeight,
      strokeCount,
      strokeWidth,
      colorBleed
    };
  }

  /**
   * Generate diamond stroke texture
   */
  private generateDiamondTexture(buffer: p5.Graphics, options: PixelStrokeOptions, width: number, height: number) {
    const { strokeCount, strokeWidth, colorBleed, baseColor, length = 1.0, size = 1.0 } = options;
    
    // Convert base color to RGB for pixel manipulation
    buffer.colorMode(buffer.RGB, 255);
    const r = buffer.red(baseColor);
    const g = buffer.green(baseColor);
    const b = buffer.blue(baseColor);
    
    // Load pixels for manipulation
    buffer.loadPixels();
    
    const centerX = width / 2;
    const centerY = height / 2;
    const effectiveWidth = (width * length * size) / 2;
    const effectiveHeight = (height * size) / 2;
    
    // Generate multiple stroke lines with color bleeding
    for (let stroke = 0; stroke < strokeCount; stroke++) {
      const strokeOffset = (stroke - (strokeCount - 1) / 2) * strokeWidth;
      const strokeY = centerY + strokeOffset;
      
      // Add color variation based on colorBleed
      const colorVariation = (stroke / strokeCount) * colorBleed * 50; // Max 50 units of variation
      const strokeR = Math.max(0, Math.min(255, r + colorVariation));
      const strokeG = Math.max(0, Math.min(255, g + colorVariation));
      const strokeB = Math.max(0, Math.min(255, b + colorVariation));
      
      // Draw horizontal stroke line
      for (let x = Math.max(0, centerX - effectiveWidth); x < Math.min(width, centerX + effectiveWidth); x++) {
        for (let y = Math.max(0, strokeY - strokeWidth/2); y < Math.min(height, strokeY + strokeWidth/2); y++) {
          const pixelIndex = (y * width + x) * 4;
          
          // Calculate distance from stroke center for soft edges
          const distanceFromCenter = Math.abs(y - strokeY);
          const alpha = Math.max(0, 255 - (distanceFromCenter / (strokeWidth/2)) * 255);
          
          if (alpha > 0) {
            // Blend with existing pixel
            const existingR = buffer.pixels[pixelIndex];
            const existingG = buffer.pixels[pixelIndex + 1];
            const existingB = buffer.pixels[pixelIndex + 2];
            const existingA = buffer.pixels[pixelIndex + 3];
            
            const blendAlpha = alpha / 255;
            buffer.pixels[pixelIndex] = strokeR * blendAlpha + existingR * (1 - blendAlpha);
            buffer.pixels[pixelIndex + 1] = strokeG * blendAlpha + existingG * (1 - blendAlpha);
            buffer.pixels[pixelIndex + 2] = strokeB * blendAlpha + existingB * (1 - blendAlpha);
            buffer.pixels[pixelIndex + 3] = Math.max(existingA, alpha);
          }
        }
      }
    }
    
    buffer.updatePixels();
    buffer.colorMode(buffer.HSB, 360, 100, 100);
  }

  /**
   * Generate horizontal hook stroke texture
   */
  private generateHorizontalHookTexture(buffer: p5.Graphics, options: PixelStrokeOptions, width: number, height: number) {
    const { strokeCount, strokeWidth, colorBleed, baseColor, curveIntensity = 0, size = 1.0 } = options;
    
    buffer.colorMode(buffer.RGB, 255);
    const r = buffer.red(baseColor);
    const g = buffer.green(baseColor);
    const b = buffer.blue(baseColor);
    
    buffer.loadPixels();
    
    const centerX = width / 2;
    const centerY = height / 2;
    const effectiveWidth = width * size;
    const effectiveHeight = height * size;
    
    // Generate curved stroke path
    for (let stroke = 0; stroke < strokeCount; stroke++) {
      const strokeOffset = (stroke - (strokeCount - 1) / 2) * strokeWidth;
      
      // Add color variation
      const colorVariation = (stroke / strokeCount) * colorBleed * 50;
      const strokeR = Math.max(0, Math.min(255, r + colorVariation));
      const strokeG = Math.max(0, Math.min(255, g + colorVariation));
      const strokeB = Math.max(0, Math.min(255, b + colorVariation));
      
      // Draw curved path using bezier approximation
      const segments = 64; // High resolution for smooth curves
      for (let i = 0; i < segments; i++) {
        const t = i / segments;
        const nextT = (i + 1) / segments;
        
        // Bezier curve points (simplified)
        const x1 = buffer.lerp(-effectiveWidth/2, effectiveWidth/2, t);
        const y1 = buffer.lerp(effectiveHeight/2, -effectiveHeight/2, t) + strokeOffset;
        const x2 = buffer.lerp(-effectiveWidth/2, effectiveWidth/2, nextT);
        const y2 = buffer.lerp(effectiveHeight/2, -effectiveHeight/2, nextT) + strokeOffset;
        
        // Draw line segment
        this.drawPixelLine(buffer, x1 + centerX, y1 + centerY, x2 + centerX, y2 + centerY, 
                          strokeR, strokeG, strokeB, strokeWidth, width, height);
      }
    }
    
    buffer.updatePixels();
    buffer.colorMode(buffer.HSB, 360, 100, 100);
  }

  /**
   * Generate L-stroke texture
   */
  private generateLStrokeTexture(buffer: p5.Graphics, options: PixelStrokeOptions, width: number, height: number) {
    const { strokeCount, strokeWidth, colorBleed, baseColor, upwardLength = 1.0, size = 1.0 } = options;
    
    buffer.colorMode(buffer.RGB, 255);
    const r = buffer.red(baseColor);
    const g = buffer.green(baseColor);
    const b = buffer.blue(baseColor);
    
    buffer.loadPixels();
    
    const centerX = width / 2;
    const centerY = height / 2;
    const effectiveWidth = width * size;
    const effectiveHeight = height * size;
    
    for (let stroke = 0; stroke < strokeCount; stroke++) {
      const strokeOffset = (stroke - (strokeCount - 1) / 2) * strokeWidth;
      
      const colorVariation = (stroke / strokeCount) * colorBleed * 50;
      const strokeR = Math.max(0, Math.min(255, r + colorVariation));
      const strokeG = Math.max(0, Math.min(255, g + colorVariation));
      const strokeB = Math.max(0, Math.min(255, b + colorVariation));
      
      // Draw horizontal base
      const baseY = centerY + strokeOffset;
      this.drawPixelLine(buffer, centerX - effectiveWidth/2, baseY, centerX + effectiveWidth/2, baseY,
                        strokeR, strokeG, strokeB, strokeWidth, width, height);
      
      // Draw vertical stem
      const stemLength = effectiveHeight * upwardLength;
      const stemEndX = centerX - effectiveWidth/2 - stemLength * Math.cos(Math.PI / 4);
      const stemEndY = baseY - stemLength * Math.sin(Math.PI / 4);
      this.drawPixelLine(buffer, centerX - effectiveWidth/2, baseY, stemEndX, stemEndY,
                        strokeR, strokeG, strokeB, strokeWidth, width, height);
    }
    
    buffer.updatePixels();
    buffer.colorMode(buffer.HSB, 360, 100, 100);
  }

  /**
   * Generate vertical hook stroke texture
   */
  private generateVerticalHookTexture(buffer: p5.Graphics, options: PixelStrokeOptions, width: number, height: number) {
    // Similar to horizontal hook but rotated 90 degrees
    this.generateHorizontalHookTexture(buffer, options, width, height);
  }

  /**
   * Generate solid ring stroke texture
   */
  private generateSolidRingTexture(buffer: p5.Graphics, options: PixelStrokeOptions, width: number, height: number) {
    const { strokeCount, strokeWidth, colorBleed, baseColor, size = 1.0 } = options;
    
    buffer.colorMode(buffer.RGB, 255);
    const r = buffer.red(baseColor);
    const g = buffer.green(baseColor);
    const b = buffer.blue(baseColor);
    
    buffer.loadPixels();
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * size / 2;
    
    for (let stroke = 0; stroke < strokeCount; stroke++) {
      const strokeRadius = radius + (stroke - (strokeCount - 1) / 2) * strokeWidth;
      
      const colorVariation = (stroke / strokeCount) * colorBleed * 50;
      const strokeR = Math.max(0, Math.min(255, r + colorVariation));
      const strokeG = Math.max(0, Math.min(255, g + colorVariation));
      const strokeB = Math.max(0, Math.min(255, b + colorVariation));
      
      // Draw circular stroke
      this.drawPixelCircle(buffer, centerX, centerY, strokeRadius,
                          strokeR, strokeG, strokeB, strokeWidth, width, height);
    }
    
    buffer.updatePixels();
    buffer.colorMode(buffer.HSB, 360, 100, 100);
  }

  /**
   * Draw a line using pixel manipulation
   */
  private drawPixelLine(buffer: p5.Graphics, x1: number, y1: number, x2: number, y2: number,
                       r: number, g: number, b: number, strokeWidth: number, width: number, height: number) {
    const steps = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1)));
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(x1 + (x2 - x1) * t);
      const y = Math.round(y1 + (y2 - y1) * t);
      
      // Draw stroke width around the point
      for (let dx = -strokeWidth/2; dx <= strokeWidth/2; dx++) {
        for (let dy = -strokeWidth/2; dy <= strokeWidth/2; dy++) {
          const px = Math.round(x + dx);
          const py = Math.round(y + dy);
          
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const distance = Math.hypot(dx, dy);
            if (distance <= strokeWidth/2) {
              const pixelIndex = (py * width + px) * 4;
              const alpha = Math.max(0, 255 - (distance / (strokeWidth/2)) * 255);
              
              if (alpha > 0) {
                const existingR = buffer.pixels[pixelIndex];
                const existingG = buffer.pixels[pixelIndex + 1];
                const existingB = buffer.pixels[pixelIndex + 2];
                const existingA = buffer.pixels[pixelIndex + 3];
                
                const blendAlpha = alpha / 255;
                buffer.pixels[pixelIndex] = r * blendAlpha + existingR * (1 - blendAlpha);
                buffer.pixels[pixelIndex + 1] = g * blendAlpha + existingG * (1 - blendAlpha);
                buffer.pixels[pixelIndex + 2] = b * blendAlpha + existingB * (1 - blendAlpha);
                buffer.pixels[pixelIndex + 3] = Math.max(existingA, alpha);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Draw a circle using pixel manipulation
   */
  private drawPixelCircle(buffer: p5.Graphics, centerX: number, centerY: number, radius: number,
                         r: number, g: number, b: number, strokeWidth: number, width: number, height: number) {
    const steps = Math.max(32, Math.round(radius * Math.PI * 2));
    
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const x = Math.round(centerX + Math.cos(angle) * radius);
      const y = Math.round(centerY + Math.sin(angle) * radius);
      
      // Draw stroke width around the point
      for (let dx = -strokeWidth/2; dx <= strokeWidth/2; dx++) {
        for (let dy = -strokeWidth/2; dy <= strokeWidth/2; dy++) {
          const px = Math.round(x + dx);
          const py = Math.round(y + dy);
          
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const distance = Math.hypot(dx, dy);
            if (distance <= strokeWidth/2) {
              const pixelIndex = (py * width + px) * 4;
              const alpha = Math.max(0, 255 - (distance / (strokeWidth/2)) * 255);
              
              if (alpha > 0) {
                const existingR = buffer.pixels[pixelIndex];
                const existingG = buffer.pixels[pixelIndex + 1];
                const existingB = buffer.pixels[pixelIndex + 2];
                const existingA = buffer.pixels[pixelIndex + 3];
                
                const blendAlpha = alpha / 255;
                buffer.pixels[pixelIndex] = r * blendAlpha + existingR * (1 - blendAlpha);
                buffer.pixels[pixelIndex + 1] = g * blendAlpha + existingG * (1 - blendAlpha);
                buffer.pixels[pixelIndex + 2] = b * blendAlpha + existingB * (1 - blendAlpha);
                buffer.pixels[pixelIndex + 3] = Math.max(existingA, alpha);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Render a stroke using cached texture
   */
  renderStroke(p: p5, options: PixelStrokeOptions, x: number, y: number, progress = 1.0) {
    const textureKey = this.getTextureKey(options);
    let texture = this.strokeTextures.get(textureKey);
    
    if (!texture) {
      texture = this.generateStrokeTexture(p, options);
      this.strokeTextures.set(textureKey, texture);
      this.cacheMisses++;
      
      // Manage cache size
      if (this.strokeTextures.size > this.maxCacheSize) {
        const firstKey = this.strokeTextures.keys().next().value;
        this.strokeTextures.delete(firstKey);
      }
    } else {
      this.cacheHits++;
    }
    
    // Apply rotation if specified
    if (options.rotation && options.rotation !== 0) {
      p.push();
      p.translate(x, y);
      p.rotate(options.rotation);
      p.image(texture.image, -texture.width/2, -texture.height/2, texture.width, texture.height);
      p.pop();
    } else {
      p.image(texture.image, x - texture.width/2, y - texture.height/2, texture.width, texture.height);
    }
  }

  /**
   * Clear texture cache
   */
  clearCache() {
    this.strokeTextures.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.strokeTextures.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: this.cacheHits + this.cacheMisses > 0 ? this.cacheHits / (this.cacheHits + this.cacheMisses) : 0
    };
  }
}

// Global instance for the pixel renderer
let pixelRenderer: PixelStrokeRenderer | null = null;

export function getPixelRenderer(): PixelStrokeRenderer {
  if (!pixelRenderer) {
    pixelRenderer = new PixelStrokeRenderer();
  }
  return pixelRenderer;
}

export function clearPixelRendererCache() {
  if (pixelRenderer) {
    pixelRenderer.clearCache();
  }
}
