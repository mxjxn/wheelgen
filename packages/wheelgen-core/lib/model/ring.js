import { DIVISIONS, MIN_DIVISIONS } from '../core/constants';
import { alphabet, parseGrammar } from '../core/grammar';
import { Particle } from './particle';
import { drawSolidRing } from '../core/alphabet/solid-ring';
import { globals } from '../store/artwork';
export class Ring {
    constructor(radius, baseColor, ringIndex) {
        this.visible = true;
        this.grammarString = '';
        this.isSolid = true;
        this._pattern = [];
        this.shapeOptions = {};
        this.particles = [];
        this.strokeColors = {}; // stroke type -> palette color index
        this.radius = radius;
        this.baseColor = baseColor;
        this.ringIndex = ringIndex;
        this.updateColor(baseColor);
    }
    display(p, progress = 1.0) {
        if (!this.visible)
            return;
        if (this.isSolid) {
            if (!this.solidRingData)
                return;
            const { radius, width, saturations, baseColor, ringOpacity } = this.solidRingData;
            const baseStrokeWidth = this.shapeOptions.solid?.strokeWidth?.value ?? 0.1;
            const strokeWidth = Math.max(0.1, baseStrokeWidth + globals().globalStrokeWidth);
            drawSolidRing(p, {
                radius,
                width,
                saturations,
                baseColor,
                ringOpacity,
                progress,
                strokeWidth
            });
        }
        else {
            for (const particle of this.particles)
                particle.display(p, progress);
        }
    }
    updateColor(newColor, p) {
        this.baseColor = newColor;
        const theta = (Math.PI * 2) / DIVISIONS;
        const diagonal = this.radius * Math.sqrt(2 * (1 - Math.cos(theta)));
        const ringWidth = diagonal / Math.sqrt(2);
        const saturations = [];
        const numSubStrokes = Math.max(1, Math.floor(ringWidth * 2));
        for (let i = 0; i < numSubStrokes; i++)
            saturations.push(100);
        this.solidRingData = {
            radius: this.radius,
            width: ringWidth,
            saturations,
            baseColor: this.baseColor,
            ringOpacity: 100,
        };
        // Update existing particles base color and recompute stroke data if possible
        for (const particle of this.particles) {
            particle.baseColor = newColor;
            if (p)
                particle.updateStrokeData(p);
        }
    }
    get isSolidRing() {
        return this.isSolid;
    }
    getShapeOptionsFor(symbol) {
        const options = this.shapeOptions[symbol];
        return options;
    }
    getAvailableSymbols() {
        return Object.keys(this.shapeOptions);
    }
    get pattern() {
        return this._pattern;
    }
    updateParticles(p) {
        for (const particle of this.particles) {
            particle.updateStrokeData(p);
        }
    }
    applyChanges(p) {
        if (this.isSolid) {
            this.updateColor(this.baseColor, p);
        }
        else {
            this.updateParticles(p);
        }
    }
    setPattern(p, grammarString) {
        const trimmed = grammarString.trim();
        this.grammarString = trimmed;
        this.isSolid = trimmed === '-';
        if (trimmed === '') {
            this._pattern = [];
            this.shapeOptions = {};
            this.particles = [];
            return;
        }
        if (this.isSolid) {
            this._pattern = [];
            this.shapeOptions = {
                solid: {
                    strokeWidth: { min: 0.1, max: 2.0, value: 0.1 }
                }
            };
            this.updateColor(this.baseColor);
            this.particles = [];
            return;
        }
        // Use full parser with repeats and rotation
        this._pattern = parseGrammar(trimmed);
        // Preserve existing shape options for symbols that remain in the new pattern
        const existingShapeOptions = { ...this.shapeOptions };
        this.shapeOptions = {};
        const uniqueSymbols = Array.from(new Set(this._pattern.map((it) => it.char))).filter((c) => c !== 'x');
        for (const symbol of uniqueSymbols) {
            // If this symbol existed before, preserve its options
            if (existingShapeOptions[symbol]) {
                this.shapeOptions[symbol] = existingShapeOptions[symbol];
            }
            else {
                // Only create defaults for new symbols
                this.shapeOptions[symbol] = this.getDefaultShapeOptions(symbol);
            }
        }
        this.regenerateParticles(p);
    }
    getDefaultShapeOptions(symbol) {
        const options = {
            strokeWidth: { min: 0.1, max: 2.0, value: 0.3 },
            rotation: { min: 0, max: Math.PI, value: 0 },
            size: { min: 0.5, max: 2.0, value: 1.0 },
        };
        if (symbol === 'd')
            options.length = { min: 1, max: 3.0, value: 2.0 };
        if (symbol === 'h' || symbol === 'v')
            options.curveIntensity = { min: -0.5, max: 1.5, value: 1 };
        if (symbol === 'l')
            options.upwardLength = { min: 1.5, max: 3.0, value: 2.0 };
        return options;
    }
    regenerateParticles(p) {
        this.particles = [];
        const divisions = this.radius < 100 ? MIN_DIVISIONS : DIVISIONS;
        let sequence = [];
        if (this._pattern && this._pattern.length > 0) {
            while (sequence.length < divisions)
                sequence.push(...this._pattern);
        }
        sequence = sequence.slice(0, divisions);
        for (let i = 0; i < divisions; i++) {
            const symbolData = sequence[i];
            if (!symbolData || symbolData.char === 'x')
                continue;
            const drawFunc = alphabet[symbolData.char];
            if (!drawFunc)
                continue;
            const angle = (i / divisions) * Math.PI * 2;
            this.particles.push(new Particle(this.radius, angle, drawFunc, this.baseColor, this.shapeOptions[symbolData.char], symbolData.rotated, this.ringIndex, p, symbolData.char));
        }
    }
    // Get color for a specific stroke type
    getStrokeColor(strokeType, palette, p) {
        const colorIndex = this.strokeColors[strokeType];
        if (colorIndex !== undefined && colorIndex >= 0 && colorIndex < palette.length) {
            return palette[colorIndex];
        }
        // Default to ring's base color if no specific color assigned
        return this.baseColor;
    }
    // Update particles when stroke colors change
    updateParticlesForStrokeType(strokeType, p) {
        this.particles.forEach(particle => {
            if (particle.strokeType === strokeType) {
                particle.updateStrokeData(p);
            }
        });
    }
}
