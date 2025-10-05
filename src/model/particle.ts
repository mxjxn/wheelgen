import type p5 from 'p5';
import { DrawShapeFn } from './types';
import { globals, palette } from '../store/artwork';

const DIVISIONS = 64;

export class Particle {
  public radius: number;
  public angle: number;
  public drawShape: DrawShapeFn;
  public isRotated: boolean;
  public baseColor: p5.Color;
  public ringIndex: number;

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
  ) {
    this.radius = radius;
    this.angle = angle;
    this.drawShape = drawFunc;
    this.isRotated = isRotated;
    this.baseColor = baseColor;
    this.ringIndex = ringIndex;
    this.shapeOptions = shapeOptions;

    const theta = (Math.PI * 2) / DIVISIONS;
    const diagonal = this.radius * Math.sqrt(2 * (1 - Math.cos(theta)));
    const w = diagonal / Math.sqrt(2);
    const h = w;
    this.geometry = { w, h };

    this.updateStrokeData(p);
  }

  updateStrokeData(p: p5) {
    const penWidth = this.geometry.w;
    const currentGlobals = globals();
    const currentPalette = palette();
    const numLinesInNib = Math.max(1, currentGlobals.strokeCount);

    this.offsets = [];
    this.saturations = [];
    this.colors = [];

    const currentPaletteIndex = this.ringIndex % currentPalette.length;
    const adjacentPaletteIndex = (currentPaletteIndex + 1) % currentPalette.length;
    const adjacentColor = currentPalette[adjacentPaletteIndex];

    for (let i = 0; i < numLinesInNib; i++) {
      this.offsets.push(p.map(i, 0, numLinesInNib - 1, -penWidth / 2, penWidth / 2));

      const bleedT = p.map(i, 0, numLinesInNib - 1, currentGlobals.colorBleed, 0);
      const strokeColor = p.lerpColor(adjacentColor, this.baseColor, bleedT) as p5.Color;
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
