import type p5 from 'p5';

export interface InnerDotState {
  visible: boolean;
  radius: number;
  color1Index: number;
  color2Index: number;
  gradientStop: number; // 0..1
  maxRadius: number;
}

export function drawInnerDot(p: p5, palette: p5.Color[], innerDot: InnerDotState, progress = 1.0) {
  if (!innerDot.visible || innerDot.radius <= 0) return;

  p.noStroke();

  const color1 = palette[innerDot.color1Index % palette.length];
  const color2 = palette[innerDot.color2Index % palette.length];

  const numSteps = 50;
  const stepsToDraw = Math.floor(numSteps * progress);

  for (let i = stepsToDraw - 1; i >= 0; i--) {
    const t = i / (numSteps - 1);
    const currentRadius = p.map(i, 0, numSteps - 1, 0, innerDot.radius);

    let currentColor: p5.Color;
    if (t <= innerDot.gradientStop) {
      const localT = innerDot.gradientStop === 0 ? 1 : t / innerDot.gradientStop;
      currentColor = p.lerpColor(color1, color2, localT) as p5.Color;
    } else {
      currentColor = color2;
    }

    const opacity = 6; // ~5% of 255

    p.colorMode(p.RGB, 255);
    const r = p.red(currentColor);
    const g = p.green(currentColor);
    const b = p.blue(currentColor);
    p.fill(r, g, b, opacity);

    p.ellipse(0, 0, currentRadius * 2, currentRadius * 2);
  }

  p.colorMode(p.HSB, 360, 100, 100);
}
