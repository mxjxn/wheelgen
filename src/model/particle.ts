import type p5 from 'p5';
import { DrawShapeFn } from './types';
import { globals, palette, rings, getStrokeColorIndex } from '../store/artwork';
import { logColorInfo } from '../core/color';

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
  
  
  // Sort rings by index
  const sortedRings = Array.from(ringStrokeData.entries()).sort((a, b) => a[0] - b[0]);
  
  for (const [ringIndex, strokeMap] of sortedRings) {
    
    // Get grammar from first stroke (they should all be the same)
    const firstStroke = Array.from(strokeMap.values())[0];
    
    // Sort strokes by type for consistent output
    const strokeTypes = ['d', 'h', 'l', 'v', '-'];
    
    for (const strokeType of strokeTypes) {
      if (strokeMap.has(strokeType)) {
        const strokeData = strokeMap.get(strokeType)!;
        const strokeName = strokeType === '-' ? 'solid' : strokeType;
        logColorInfo(p, strokeData.color, `  ${strokeName}: palette[${strokeData.colorIndex}]`);
      }
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
    if (this.strokeType) {
      const currentRings = rings();
      const ring = currentRings[this.ringIndex];
      if (ring) {
        const grammarKey = `ring${this.ringIndex}_${ring.grammarString}_${this.strokeType}`;
        
        if (!loggedRingGrammars.has(grammarKey)) {
          loggedRingGrammars.add(grammarKey);
          
          // Initialize ring data if not exists
          if (!ringStrokeData.has(this.ringIndex)) {
            ringStrokeData.set(this.ringIndex, new Map());
          }
          
          const ringData = ringStrokeData.get(this.ringIndex)!;
          const colorIndex = getStrokeColorIndex(this.ringIndex, this.strokeType as 'd' | 'h' | 'l' | 'v' | '-');
          
          // Store stroke data
          ringData.set(this.strokeType, {
            color: strokeBaseColor,
            colorIndex: colorIndex,
            grammar: ring.grammarString
          });
          
        } else {
        }
      } else {
      }
    } else {
    }

    // Calculate adjacent color based on hue relationships
    const currentPaletteIndex = this.ringIndex % currentPalette.length;
    
    // Get the hue of the current stroke base color
    p.colorMode(p.HSB, 360, 100, 100);
    const currentHue = p.hue(strokeBaseColor);
    
    // Find the palette color with the closest hue (excluding the current one)
    let closestHueDiff = Infinity;
    let adjacentColor = currentPalette[0]; // fallback
    
    for (let i = 0; i < currentPalette.length; i++) {
      if (i === currentPaletteIndex) continue; // Skip current color
      
      const paletteHue = p.hue(currentPalette[i]);
      const hueDiff = Math.min(
        Math.abs(paletteHue - currentHue),
        360 - Math.abs(paletteHue - currentHue) // Handle wraparound
      );
      
      if (hueDiff < closestHueDiff) {
        closestHueDiff = hueDiff;
        adjacentColor = currentPalette[i];
      }
    }

    for (let i = 0; i < numLinesInNib; i++) {
      this.offsets.push(p.map(i, 0, numLinesInNib - 1, -penWidth / 2, penWidth / 2));

      // Fix bleed calculation: start with base color and bleed toward adjacent color
      // When colorBleed is 0, use only base color; when colorBleed is 1, use only adjacent color
      const bleedT = p.map(i, 0, numLinesInNib - 1, 0, currentGlobals.colorBleed);
      const strokeColor = p.lerpColor(strokeBaseColor, adjacentColor, bleedT) as p5.Color;
      this.colors.push(strokeColor);

      const startAlpha = 191;
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

  display(p: p5, progress = 1.0) {
    const x = this.radius * Math.cos(this.angle);
    const y = this.radius * Math.sin(this.angle);
    p.push();
    p.translate(x, y);
    p.rotate(this.angle + p.HALF_PI + p.QUARTER_PI);
    this.drawShape(p, this.getOptions(p, progress));
    p.pop();
  }
}
