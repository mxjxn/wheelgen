import type p5 from 'p5';

export interface SolidRingDrawOptions {
  radius: number;
  width: number;
  saturations: number[];
  colors?: p5.Color[];
  baseColor: p5.Color;
  ringOpacity?: number;
  progress?: number;
  strokeWidth?: number;
}

export function drawSolidRing(p: p5, options: SolidRingDrawOptions) {
  const { radius, width, saturations, colors, baseColor, ringOpacity = 100, progress = 1.0, strokeWidth = 0.1 } = options;
  p.noFill();
  const numStrokes = saturations.length;
  const strokesToDraw = Math.floor(numStrokes * progress);
  for (let i = 0; i < strokesToDraw; i++) {
    const r = p.map(i, 0, saturations.length - 1, radius - width / 2, radius + width / 2);
    const strokeColor = colors ? colors[i] : baseColor;
    p.stroke(p.red(strokeColor), p.green(strokeColor), p.blue(strokeColor), ringOpacity);
    p.strokeWeight(strokeWidth);
    p.ellipse(0, 0, r * 2, r * 2);
  }
}
