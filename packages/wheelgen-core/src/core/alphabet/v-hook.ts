import type p5 from 'p5';

export interface HookDrawOptions {
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

export function drawCalligraphyHook(p: p5, options: HookDrawOptions) {
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

  const p1_x = (-w / 2) * size, p1_y = (h / 2) * size;
  const c1_x = 0, c1_y = (h / 2) * size;
  const c2_x = (w / 2) * (1 + curveIntensity) * size, c2_y = 0;
  const p2_x = (w / 2) * (1 + curveIntensity) * size, p2_y = (-h / 2) * (1 + curveIntensity) * size;

  const path_p1 = { x: p1_y, y: -p1_x };
  const path_c1 = { x: c1_y, y: -c1_x };
  const path_c2 = { x: c2_y, y: -c2_x };
  const path_p2 = { x: p2_y, y: -p2_x };

  for (let i = 0; i < offsets.length; i++) {
    const offset = offsets[i];
    const { startAlpha, endAlpha } = saturations[i];
    const strokeColor = colors ? colors[i] : baseColor;
    const p1 = { x: path_p1.x + offset, y: path_p1.y };
    const c1 = { x: path_c1.x + offset, y: path_c1.y };
    const c2 = { x: path_c2.x + offset, y: path_c2.y };
    const p2 = { x: path_p2.x + offset, y: path_p2.y };

    for (let j = 0; j < segments; j++) {
      const t = j / segments;
      if (t > progress) break;
      const x1 = p.bezierPoint(p1.x, c1.x, c2.x, p2.x, t);
      const y1 = p.bezierPoint(p1.y, c1.y, c2.y, p2.y, t);
      const x2 = p.bezierPoint(p1.x, c1.x, c2.x, p2.x, (j + 1) / segments);
      const y2 = p.bezierPoint(p1.y, c1.y, c2.y, p2.y, (j + 1) / segments);
      const currentAlpha = p.lerp(startAlpha, endAlpha, t);
      
      // Properly read RGB values regardless of current color mode
      p.colorMode(p.RGB, 255);
      const r = Math.round(p.red(strokeColor));
      const g = Math.round(p.green(strokeColor));
      const b = Math.round(p.blue(strokeColor));
      p.colorMode(p.HSB, 360, 100, 100); // Restore HSB mode
      
      p.stroke(r, g, b, currentAlpha);
      p.line(x1, y1, x2, y2);
    }
  }

  p.pop();
}