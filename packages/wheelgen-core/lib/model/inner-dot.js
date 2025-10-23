export function drawInnerDot(p, palette, innerDot, progress = 1.0) {
    if (!innerDot.visible || innerDot.radius <= 0)
        return;
    p.noStroke();
    const color1 = palette[innerDot.color1Index % palette.length];
    const color2 = palette[innerDot.color2Index % palette.length];
    const numSteps = 50;
    const stepsToDraw = Math.floor(numSteps * progress);
    for (let i = stepsToDraw - 1; i >= 0; i--) {
        const t = i / (numSteps - 1);
        const currentRadius = p.map(i, 0, numSteps - 1, 0, innerDot.radius);
        // Create a smooth radial gradient
        // gradientStop controls where the transition from color1 to color2 happens
        let currentColor;
        let currentOpacity;
        if (innerDot.gradientStop === 0) {
            // If gradient stop is 0, use only color2
            currentColor = color2;
            currentOpacity = innerDot.color2Opacity;
        }
        else if (innerDot.gradientStop === 1) {
            // If gradient stop is 1, use only color1
            currentColor = color1;
            currentOpacity = innerDot.color1Opacity;
        }
        else {
            // Create gradient: color1 at center (t=0) to color2 at gradientStop
            // Then color2 from gradientStop to edge (t=1)
            if (t <= innerDot.gradientStop) {
                // Interpolate from color1 to color2
                const localT = t / innerDot.gradientStop;
                currentColor = p.lerpColor(color1, color2, localT);
                // Interpolate opacity as well
                currentOpacity = p.map(localT, 0, 1, innerDot.color1Opacity, innerDot.color2Opacity);
            }
            else {
                // Use color2 for the outer portion
                currentColor = color2;
                currentOpacity = innerDot.color2Opacity;
            }
        }
        p.colorMode(p.RGB, 255);
        const r = p.red(currentColor);
        const g = p.green(currentColor);
        const b = p.blue(currentColor);
        p.fill(r, g, b, currentOpacity);
        p.ellipse(0, 0, currentRadius * 2, currentRadius * 2);
    }
    p.colorMode(p.HSB, 360, 100, 100);
}
