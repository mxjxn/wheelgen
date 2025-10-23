import { Ring } from './ring';
import { generatePalette } from '../core/color';
import { defaultGrammars } from '../core/constants';
export const state = {
    rings: [],
    palette: [],
    innerDot: {
        visible: false,
        radius: 0,
        color1Index: 0,
        color2Index: 1,
        gradientStop: 0.5,
        maxRadius: 0,
    },
    globals: {
        randomness: 0.0,
        strokeCount: 24,
        colorBleed: 0.3,
    },
    guidesVisible: true,
    hasChanges: false,
};
export function initializeArtwork(p) {
    state.rings = [];
    const numRings = 10;
    const maxRadius = Math.min(p.width, p.height) / 2 * 0.85;
    const minRadius = 50;
    p.noiseSeed(p.random(1000));
    p.colorMode(p.HSB, 360, 100, 100);
    state.palette = generatePalette(p);
    for (let i = 0; i < numRings; i++) {
        const r = p.map(i, 0, numRings - 1, minRadius, maxRadius);
        const c = state.palette[i % state.palette.length];
        const ring = new Ring(r, c, i);
        // Initialize 3 smallest rings invisible
        if (i < 3) {
            ring.visible = false;
            ring.setPattern(p, '');
        }
        else {
            const grammar = defaultGrammars[i % defaultGrammars.length];
            ring.setPattern(p, grammar);
            ring.visible = true;
        }
        state.rings.push(ring);
    }
    const innermostRing = state.rings[state.rings.length - 1];
    state.innerDot.maxRadius = innermostRing.radius;
    state.innerDot.radius = p.random(10, innermostRing.radius * 0.8);
    state.innerDot.color1Index = Math.floor(p.random(4));
    state.innerDot.color2Index = Math.floor(p.random(4));
    state.innerDot.gradientStop = p.random(0.3, 0.7);
    state.innerDot.visible = p.random() > 0.5;
}
export function setPalette(p) {
    state.palette = generatePalette(p);
    state.rings.forEach((ring, i) => ring.updateColor(state.palette[i % state.palette.length], p));
}
export function markChanges() {
    state.hasChanges = true;
}
export function clearChanges() {
    state.hasChanges = false;
}
