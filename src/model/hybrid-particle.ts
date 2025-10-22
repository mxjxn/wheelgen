import type p5 from 'p5';
import { DrawShapeFn } from './types';
import { globals, palette, rings, getStrokeColorIndex } from '../store/artwork';
import { logColorInfo } from '../core/color';
import { getHybridRenderer, HybridDrawOptions } from '../core/hybrid-renderer';

const DIVISIONS = 64;

// Static tracking for color logging - only log once per ring grammar
const loggedRingGrammars = new Set<string>();

// Static storage for collecting stroke data per ring
const ringStrokeData = new Map<number, Map<string, { color: p5.Color; colorIndex: number; grammar: string }>>();

// Function to clear logged grammars (call when artwork is regenerated)
export function clearLoggedGrammars() {
  loggedRingGrammars.clear();
  ringStrokeData.clear();
}

// Function to log all collected stroke data in organized format
export function logRingStrokeData(p: p5) {
  if (ringStrokeData.size === 0) return;
  
  console.log('\n=== RING STROKE DATA ===');
  for (const [ringIndex, strokeMap] of ringStrokeData) {
    console.log(`\nRing ${ringIndex}:`);
    for (const [strokeName, strokeData] of strokeMap) {
      console.log(`  ${strokeName}: palette[${strokeData.colorIndex}]`);
    }
  }
  
}

export class Particle {
  public radius: number;
  public angle: number;
  public drawShape: DrawShapeFn;
  public isRotated: boolean;
  public baseColor: p5.Color;
  public ringIndex: number;
  public strokeType?: string;

  private geometry: { w: number; h: number };
  private shapeOptions: Record<string, { min: number; max: number; value: number }>;

  private offsets: number[] = [];
  private saturations: { startAlpha: number; endAlpha: number }[] = [];
  private colors: p5.Color[] = [];

  constructor(
    radius: number,
    angle: number,
    drawFunc: DrawShapeFn,
    baseColor: p5.Color,
    shapeOptions: Record<string, { min: number; max: number; value: number }>,
    isRotated = false,
    ringIndex = 0,
    p: p5,
    strokeType?: string,
  ) {
    this.radius = radius;
    this.angle = angle;
    this.drawShape = drawFunc;
    this.isRotated = isRotated;
    this.baseColor = baseColor;
    this.ringIndex = ringIndex;
    this.shapeOptions = shapeOptions;
    this.strokeType = strokeType;

    const theta = (Math.PI * 2) / DIVISIONS;
    const diagonal = this.radius * Math.sqrt(2 * (1 - Math.cos(theta)));
    const w = diagonal / Math.sqrt(2);
    const h = w;
    this.geometry = { w, h };

    this.updateStrokeData(p);
  }

  updateStrokeData(p: p5) {
    const penWidth = Math.max(0.1, this.geometry.w + globals().globalStrokeWidth);
    const currentGlobals = globals();
    const currentPalette = palette();
    const numLinesInNib = Math.max(1, currentGlobals.strokeCount);

    this.offsets = [];
    this.saturations = [];
    this.colors = [];

    // Get stroke-specific color if assigned, otherwise use ring's base color
    let strokeBaseColor = this.baseColor;
    if (this.strokeType) {
      // Use the color assignment system to get the correct color index
      const colorIndex = getStrokeColorIndex(this.ringIndex, this.strokeType as 'd' | 'h' | 'l' | 'v' | '-');
      
      if (colorIndex >= 0 && colorIndex < currentPalette.length) {
        strokeBaseColor = currentPalette[colorIndex];
        
        // Debug: Log the actual color values
        p.colorMode(p.RGB, 255);
        const r = Math.round(p.red(strokeBaseColor));
        const g = Math.round(p.green(strokeBaseColor));
        const b = Math.round(p.blue(strokeBaseColor));
        p.colorMode(p.HSB, 360, 100, 100);
      } else {
      }
    } else {
    }

    // Collect stroke data once per ring grammar (only for the first particle of each stroke type)
    if (this.strokeType && !loggedRingGrammars.has(`${this.ringIndex}_${this.strokeType}`)) {
      loggedRingGrammars.add(`${this.ringIndex}_${this.strokeType}`);
      
      if (!ringStrokeData.has(this.ringIndex)) {
        ringStrokeData.set(this.ringIndex, new Map());
      }
      
      const ringData = ringStrokeData.get(this.ringIndex)!;
      const colorIndex = getStrokeColorIndex(this.ringIndex, this.strokeType as 'd' | 'h' | 'l' | 'v' | '-');
      
      ringData.set(this.strokeType, {
        color: strokeBaseColor,
        colorIndex: colorIndex,
        grammar: `${this.ringIndex}_${this.strokeType}`
      });
    }

    for (let i = 0; i < numLinesInNib; i++) {
      const offset = this.getRandomizedValue(p, { min: -penWidth / 2, max: penWidth / 2, value: 0 });
      this.offsets.push(offset);
      
      const strokeColor = strokeBaseColor;
      this.colors.push(strokeColor);
      
      const startAlpha = 255;
      const endAlpha = 64;
      this.saturations.push({ startAlpha, endAlpha });
    }
  }

  private getRandomizedValue(p: p5, param: { min: number; max: number; value: number }) {
    const currentGlobals = globals();
    const randomness = currentGlobals.randomness;
    if (randomness === 0) return param.value;
    const range = param.max - param.min;
    const randomOffset = (p.random() - 0.5) * range * randomness;
    return p.constrain(param.value + randomOffset, param.min, param.max);
  }

  private getOptions(p: p5, progress = 1.0) {
    return {
      w: this.geometry.w,
      h: this.geometry.h,
      offsets: this.offsets,
      saturations: this.saturations,
      colors: this.colors,
      baseColor: this.baseColor,
      strokeWidth: this.getRandomizedValue(p, this.shapeOptions.strokeWidth),
      curveIntensity: this.shapeOptions.curveIntensity ? this.getRandomizedValue(p, this.shapeOptions.curveIntensity) : 0,
      upwardLength: this.shapeOptions.upwardLength ? this.getRandomizedValue(p, this.shapeOptions.upwardLength) : 1.0,
      length: this.shapeOptions.length ? this.getRandomizedValue(p, this.shapeOptions.length) : 1.0,
      size: this.getRandomizedValue(p, this.shapeOptions.size),
      rotation: this.shapeOptions.rotation ? this.getRandomizedValue(p, this.shapeOptions.rotation) + (this.isRotated ? Math.PI : 0) : (this.isRotated ? Math.PI : 0),
      segments: 7,
      progress,
    };
  }

  /**
   * Display using hybrid rendering system
   */
  display(p: p5, progress = 1.0) {
    const x = this.radius * Math.cos(this.angle);
    const y = this.radius * Math.sin(this.angle);
    
    const hybridRenderer = getHybridRenderer();
    const options = this.getOptions(p, progress);
    
    // Convert to hybrid rendering options
    const hybridOptions: HybridDrawOptions = {
      w: options.w,
      h: options.h,
      offsets: options.offsets,
      saturations: options.saturations,
      colors: options.colors,
      baseColor: options.baseColor,
      strokeWidth: options.strokeWidth,
      strokeCount: options.offsets.length,
      colorBleed: globals().colorBleed,
      curveIntensity: options.curveIntensity,
      upwardLength: options.upwardLength,
      length: options.length,
      size: options.size,
      rotation: options.rotation,
      progress: options.progress,
      strokeType: this.strokeType as 'd' | 'h' | 'l' | 'v' | '-' || 'd'
    };

    // Use hybrid renderer
    hybridRenderer.renderStroke(p, hybridOptions, x, y, progress);
  }

  /**
   * Display using traditional rendering (for backward compatibility)
   */
  displayTraditional(p: p5, progress = 1.0) {
    const x = this.radius * Math.cos(this.angle);
    const y = this.radius * Math.sin(this.angle);
    p.push();
    p.translate(x, y);
    p.rotate(this.angle + p.HALF_PI + p.QUARTER_PI);
    this.drawShape(p, this.getOptions(p, progress));
    p.pop();
  }
}
