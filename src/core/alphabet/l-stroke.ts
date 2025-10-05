import type p5 from 'p5';

export interface LStrokeDrawOptions {
  w: number;
  h: number;
  offsets: number[];
  saturations: { startAlpha: number; endAlpha: number }[];
  colors?: p5.Color[];
  baseColor: p5.Color;
  strokeWidth?: number;
  segments?: number;
  upwardLength?: number;
  size?: number;
  rotation?: number;
  progress?: number;
}

export function drawCalligraphyLStroke(p: p5, options: LStrokeDrawOptions) {
  const {
    w,
    h,
    offsets,
    saturations,
    colors,
    baseColor,
    strokeWidth = 0.25,
    segments = 7,
    upwardLength = 1.0,
    size = 1.0,
    rotation = 0,
    progress = 1.0,
  } = options;

  p.strokeWeight(strokeWidth);
  p.noFill();

  // Apply rotation transformation
  p.push();
  p.rotate(rotation);

  const base_p1 = { x: (w / 2) * size, y: 0 };
  const base_p2 = { x: (-w / 2) * size, y: 0 };
  const stemLength = h * upwardLength * size;
  const base_p3 = { x: base_p2.x - stemLength * Math.cos(Math.PI / 4), y: base_p2.y - stemLength * Math.sin(Math.PI / 4) };

  const len1 = Math.hypot(base_p1.x - base_p2.x, base_p1.y - base_p2.y);
  const len2 = Math.hypot(base_p2.x - base_p3.x, base_p2.y - base_p3.y);
  const totalLength = len1 + len2;

  for (let i = 0; i < offsets.length; i++) {
    const offset = offsets[i];
    const { startAlpha, endAlpha } = saturations[i];
    const strokeColor = colors ? colors[i] : baseColor;

    const p1 = { x: base_p1.x, y: base_p1.y + offset };
    const p2 = { x: base_p2.x, y: base_p2.y + offset };

    for (let j = 0; j < segments; j++) {
      const t = j / segments;
      if (t > progress) break;
      const x1 = p.lerp(p1.x, p2.x, t);
      const y1 = p.lerp(p1.y, p2.y, t);
      const x2 = p.lerp(p1.x, p2.x, (j + 1) / segments);
      const y2 = p.lerp(p1.y, p2.y, (j + 1) / segments);
      const totalT = (t * len1) / totalLength;
      const currentAlpha = p.lerp(startAlpha, endAlpha, totalT);
      p.stroke(p.red(strokeColor), p.green(strokeColor), p.blue(strokeColor), currentAlpha);
      p.line(x1, y1, x2, y2);
    }

    const stem_p1 = { x: p2.x, y: p2.y };
    const stem_p2 = { x: base_p3.x, y: base_p3.y + offset };

    for (let j = 0; j < segments; j++) {
      const t = j / segments;
      if (t > progress) break;
      const x1 = p.lerp(stem_p1.x, stem_p2.x, t);
      const y1 = p.lerp(stem_p1.y, stem_p2.y, t);
      const x2 = p.lerp(stem_p1.x, stem_p2.x, (j + 1) / segments);
      const y2 = p.lerp(stem_p1.y, stem_p2.y, (j + 1) / segments);
      const totalT = (len1 + t * len2) / totalLength;
      const currentAlpha = p.lerp(startAlpha, endAlpha, totalT);
      p.stroke(p.red(strokeColor), p.green(strokeColor), p.blue(strokeColor), currentAlpha);
      p.line(x1, y1, x2, y2);
    }
  }

  p.pop();
}
