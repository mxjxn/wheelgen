export function drawSolidRing(p, options) {
    const { radius, width, saturations, colors, baseColor, ringOpacity = 100, progress = 1.0, strokeWidth = 0.1 } = options;
    p.noFill();
    const numStrokes = saturations.length;
    const strokesToDraw = Math.floor(numStrokes * progress);
    for (let i = 0; i < strokesToDraw; i++) {
        const r = p.map(i, 0, saturations.length - 1, radius - width / 2, radius + width / 2);
        const strokeColor = colors ? colors[i] : baseColor;
        // Properly read RGB values regardless of current color mode
        p.colorMode(p.RGB, 255);
        const red = Math.round(p.red(strokeColor));
        const green = Math.round(p.green(strokeColor));
        const blue = Math.round(p.blue(strokeColor));
        p.colorMode(p.HSB, 360, 100, 100); // Restore HSB mode
        p.stroke(red, green, blue, ringOpacity);
        p.strokeWeight(strokeWidth);
        p.ellipse(0, 0, r * 2, r * 2);
    }
}
