import type p5 from 'p5';

export function generatePalette(p: p5): p5.Color[] {
  const palette: p5.Color[] = [];
  const prevMode = (p as any)._colorMode; // best-effort; p5 lacks public getter
  p.colorMode(p.HSB, 360, 100, 100);
  const baseHue = p.random(360);
  for (let i = 0; i < 4; i++) {
    const hue = (baseHue + i * 90) % 360;
    palette.push(p.color(hue, p.random(60, 90), p.random(80, 100)) as p5.Color);
  }
  // Restore to HSB with 360/100/100 which is what sketch prefers
  p.colorMode(p.HSB, 360, 100, 100);
  // Note: p5 doesn't expose previous mode safely; we keep HSB as default
  return palette;
}
