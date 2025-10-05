import type p5 from 'p5';

export interface HorizontalHookDrawOptions {
  w: number;
  h: number;
  offsets: number[];
  saturations: { startAlpha: number; endAlpha: number }[];
  colors?: p5.Color[];
  baseColor: p5.Color;
  curveIntensity?: number;
  strokeWidth?: number;
  segments?: number;
  size?: number;
  rotation?: number;
  progress?: number;
}

export function drawCalligraphyHorizontalHook(p: p5, options: HorizontalHookDrawOptions) {
  const {
    w,
    h,
    offsets,
    saturations,
    colors,
    baseColor,
    curveIntensity = 0,
    strokeWidth = 0.25,
    segments = 7,
    size = 1.0,
    rotation = 0,
    progress = 1.0,
  } = options;

  p.strokeWeight(strokeWidth);
  p.noFill();

  // Apply rotation transformation
  p.push();
  p.rotate(rotation);

  const path_p1 = { x: (-w / 2) * size, y: (h / 2) * size };
  const path_c1 = { x: (-w / 4) * size, y: (h / 2) * size };
  const path_p2 = { x: (w / 2) * size, y: (-h / 2) * size };
  const path_c2 = { x: (w / 4) * size, y: (-h / 4) * size + (h / 2) * curveIntensity * size };

  for (let i = 0; i < offsets.length; i++) {
    const offset = offsets[i];
    const { startAlpha, endAlpha } = saturations[i];
    const strokeColor = colors ? colors[i] : baseColor;
    const p1 = { x: path_p1.x, y: path_p1.y + offset };
    const c1 = { x: path_c1.x, y: path_c1.y + offset };
    const c2 = { x: path_c2.x, y: path_c2.y + offset };
    const p2 = { x: path_p2.x, y: path_p2.y + offset };

    for (let j = 0; j < segments; j++) {
      const t = j / segments;
      if (t > progress) break;
      const x1 = p.bezierPoint(p1.x, c1.x, c2.x, p2.x, t);
      const y1 = p.bezierPoint(p1.y, c1.y, c2.y, p2.y, t);
      const x2 = p.bezierPoint(p1.x, c1.x, c2.x, p2.x, (j + 1) / segments);
      const y2 = p.bezierPoint(p1.y, c1.y, c2.y, p2.y, (j + 1) / segments);
      const currentAlpha = p.lerp(startAlpha, endAlpha, t);
      p.stroke(p.red(strokeColor), p.green(strokeColor), p.blue(strokeColor), currentAlpha);
      p.line(x1, y1, x2, y2);
    }
  }

  p.pop();
}
