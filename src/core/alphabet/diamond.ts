import type p5 from 'p5';

export interface DiamondDrawOptions {
  w: number;
  h: number;
  offsets: number[];
  saturations: { startAlpha: number; endAlpha: number }[];
  colors?: p5.Color[];
  baseColor: p5.Color;
  strokeWidth?: number;
  segments?: number;
  length?: number;
  size?: number;
  rotation?: number;
  progress?: number;
}

export function drawCalligraphyDiamond(p: p5, options: DiamondDrawOptions) {
  const {
    w,
    h,
    offsets,
    saturations,
    colors,
    baseColor,
    strokeWidth = 0.25,
    segments = 7,
    length = 1.0,
    size = 1.0,
    rotation = 0,
    progress = 1.0,
  } = options;

  p.strokeWeight(strokeWidth);
  p.noFill();

  // Apply rotation transformation
  p.push();
  p.rotate(rotation);

  for (let i = 0; i < offsets.length; i++) {
    const yBase = p.map(i, 0, offsets.length, (-h / 2) * size, (h / 2) * size);
    const yPos = yBase + offsets[i];
    const { startAlpha, endAlpha } = saturations[i];
    const strokeColor = colors ? colors[i] : baseColor;

    for (let j = 0; j < segments; j++) {
      const t = j / segments;
      if (t > progress) break;
      const x1 = p.lerp((-w / 2) * length * size, (w / 2) * length * size, t);
      const x2 = p.lerp((-w / 2) * length * size, (w / 2) * length * size, (j + 1) / segments);
      const currentAlpha = p.lerp(startAlpha, endAlpha, t);
      p.stroke(p.red(strokeColor), p.green(strokeColor), p.blue(strokeColor), currentAlpha);
      p.line(x1, yPos, x2, yPos);
    }
  }

  p.pop();
}
