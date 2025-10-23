import { palette, globals } from '../store/artwork';
/**
 * Comprehensive color diagnostic tool to identify UI vs P5 rendering mismatches
 */
export class ColorDiagnostic {
    constructor(p) {
        this.logs = [];
        this.p = p;
    }
    /**
     * Run comprehensive color consistency tests
     */
    runDiagnostics() {
        this.logs = [];
        this.log('=== COLOR DIAGNOSTIC START ===');
        const currentPalette = palette();
        const currentGlobals = globals();
        this.log(`Palette has ${currentPalette.length} colors`);
        this.log(`Color bleed: ${currentGlobals.colorBleed}`);
        this.log(`Stroke count: ${currentGlobals.strokeCount}`);
        // Test each palette color
        currentPalette.forEach((color, index) => {
            this.testPaletteColor(color, index);
        });
        // Test color lerping
        this.testColorLerping(currentPalette);
        // Test UI vs P5 conversion consistency
        this.testConversionConsistency(currentPalette);
        this.log('=== COLOR DIAGNOSTIC END ===');
        this.printLogs();
    }
    /**
     * Test individual palette color consistency
     */
    testPaletteColor(color, index) {
        this.log(`\n--- Testing Palette Color ${index} ---`);
        // Get HSB values
        this.p.colorMode(this.p.HSB, 360, 100, 100);
        const h = this.p.hue(color);
        const s = this.p.saturation(color);
        const b = this.p.brightness(color);
        this.log(`HSB: H=${h.toFixed(2)}, S=${s.toFixed(2)}, B=${b.toFixed(2)}`);
        // Get RGB values
        this.p.colorMode(this.p.RGB, 255);
        const r = this.p.red(color);
        const g = this.p.green(color);
        const b_val = this.p.blue(color);
        this.log(`RGB: R=${r.toFixed(2)}, G=${g.toFixed(2)}, B=${b_val.toFixed(2)}`);
        // Test UI conversion
        const uiRgbString = this.testUIColorConversion(color);
        this.log(`UI RGB String: ${uiRgbString}`);
        // Test round-trip conversion
        this.testRoundTripConversion(color);
        // Restore HSB mode
        this.p.colorMode(this.p.HSB, 360, 100, 100);
    }
    /**
     * Test UI color conversion (simulating ColorManagementPanel behavior)
     */
    testUIColorConversion(color) {
        // Store current color mode
        const currentMode = this.p._colorMode;
        const currentMaxes = this.p._colorMaxes;
        try {
            // Set RGB mode for reading (same as colorToRgbString)
            this.p.colorMode(this.p.RGB, 255);
            const r = Math.round(this.p.red(color));
            const g = Math.round(this.p.green(color));
            const b = Math.round(this.p.blue(color));
            // Restore original color mode
            if (currentMode === this.p.HSB) {
                if (currentMaxes && currentMaxes.length >= 3) {
                    this.p.colorMode(this.p.HSB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
                }
                else {
                    this.p.colorMode(this.p.HSB, 360, 100, 100);
                }
            }
            else {
                if (currentMaxes && currentMaxes.length >= 3) {
                    this.p.colorMode(this.p.RGB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
                }
                else {
                    this.p.colorMode(this.p.RGB, 255, 255, 255);
                }
            }
            return `rgb(${r}, ${g}, ${b})`;
        }
        catch (error) {
            return '#ffffff';
        }
    }
    /**
     * Test round-trip conversion (HSB -> RGB -> HSB)
     */
    testRoundTripConversion(originalColor) {
        this.p.colorMode(this.p.HSB, 360, 100, 100);
        const originalH = this.p.hue(originalColor);
        const originalS = this.p.saturation(originalColor);
        const originalB = this.p.brightness(originalColor);
        // Convert to RGB
        this.p.colorMode(this.p.RGB, 255);
        const r = this.p.red(originalColor);
        const g = this.p.green(originalColor);
        const b = this.p.blue(originalColor);
        // Create new color from RGB
        const rgbColor = this.p.color(r, g, b);
        // Convert back to HSB
        this.p.colorMode(this.p.HSB, 360, 100, 100);
        const newH = this.p.hue(rgbColor);
        const newS = this.p.saturation(rgbColor);
        const newB = this.p.brightness(rgbColor);
        const hDiff = Math.abs(originalH - newH);
        const sDiff = Math.abs(originalS - newS);
        const bDiff = Math.abs(originalB - newB);
        this.log(`Round-trip differences: H=${hDiff.toFixed(2)}, S=${sDiff.toFixed(2)}, B=${bDiff.toFixed(2)}`);
        if (hDiff > 0.1 || sDiff > 0.1 || bDiff > 0.1) {
            this.log(`⚠️  SIGNIFICANT ROUND-TRIP DIFFERENCE DETECTED!`);
        }
        // Restore HSB mode
        this.p.colorMode(this.p.HSB, 360, 100, 100);
    }
    /**
     * Test color lerping behavior
     */
    testColorLerping(palette) {
        this.log(`\n--- Testing Color Lerping ---`);
        if (palette.length < 2) {
            this.log('Not enough colors for lerping test');
            return;
        }
        const currentGlobals = globals();
        const strokeBaseColor = palette[0];
        const adjacentColor = palette[1];
        this.log(`Base color: ${this.getColorString(strokeBaseColor)}`);
        this.log(`Adjacent color: ${this.getColorString(adjacentColor)}`);
        // Test lerping at different bleed values
        const bleedValues = [0, 0.25, 0.5, 0.75, 1.0];
        bleedValues.forEach(bleedT => {
            this.p.colorMode(this.p.HSB, 360, 100, 100);
            const lerpedColor = this.p.lerpColor(strokeBaseColor, adjacentColor, bleedT);
            // Get RGB values of lerped color
            this.p.colorMode(this.p.RGB, 255);
            const r = Math.round(this.p.red(lerpedColor));
            const g = Math.round(this.p.green(lerpedColor));
            const b = Math.round(this.p.blue(lerpedColor));
            this.log(`Bleed ${bleedT}: rgb(${r}, ${g}, ${b})`);
            // Restore HSB mode
            this.p.colorMode(this.p.HSB, 360, 100, 100);
        });
    }
    /**
     * Test conversion consistency between UI and P5 rendering
     */
    testConversionConsistency(palette) {
        this.log(`\n--- Testing Conversion Consistency ---`);
        palette.forEach((color, index) => {
            // UI conversion
            const uiRgb = this.testUIColorConversion(color);
            // P5 rendering simulation (same as alphabet functions)
            this.p.colorMode(this.p.RGB, 255);
            const r = Math.round(this.p.red(color));
            const g = Math.round(this.p.green(color));
            const b = Math.round(this.p.blue(color));
            const p5Rgb = `rgb(${r}, ${g}, ${b})`;
            this.log(`Color ${index}:`);
            this.log(`  UI: ${uiRgb}`);
            this.log(`  P5: ${p5Rgb}`);
            this.log(`  Match: ${uiRgb === p5Rgb ? '✅' : '❌'}`);
            // Restore HSB mode
            this.p.colorMode(this.p.HSB, 360, 100, 100);
        });
    }
    /**
     * Get color string representation
     */
    getColorString(color) {
        this.p.colorMode(this.p.RGB, 255);
        const r = Math.round(this.p.red(color));
        const g = Math.round(this.p.green(color));
        const b = Math.round(this.p.blue(color));
        this.p.colorMode(this.p.HSB, 360, 100, 100);
        return `rgb(${r}, ${g}, ${b})`;
    }
    /**
     * Log message
     */
    log(message) {
        this.logs.push(message);
        console.log(message);
    }
    /**
     * Print all logs
     */
    printLogs() {
        console.log('\n=== DIAGNOSTIC LOGS ===');
        this.logs.forEach(log => console.log(log));
        console.log('=== END DIAGNOSTIC LOGS ===\n');
    }
    /**
     * Get logs as string
     */
    getLogs() {
        return this.logs.join('\n');
    }
}
/**
 * Test save/load color consistency
 */
export function testSaveLoadColorConsistency(p) {
    console.log('=== SAVE/LOAD COLOR CONSISTENCY TEST ===');
    const currentPalette = palette();
    if (currentPalette.length === 0) {
        console.log('No palette colors to test');
        return;
    }
    // Test each palette color
    currentPalette.forEach((originalColor, index) => {
        console.log(`\n--- Testing Color ${index} Save/Load ---`);
        // Get original RGB values
        p.colorMode(p.RGB, 255);
        const originalR = p.red(originalColor);
        const originalG = p.green(originalColor);
        const originalB = p.blue(originalColor);
        const originalA = p.alpha(originalColor);
        console.log(`Original RGB: R=${originalR.toFixed(2)}, G=${originalG.toFixed(2)}, B=${originalB.toFixed(2)}, A=${originalA.toFixed(2)}`);
        // Simulate save/load process
        const serialized = { r: originalR, g: originalG, b: originalB, a: originalA };
        const loadedColor = p.color(serialized.r, serialized.g, serialized.b, serialized.a);
        // Get loaded RGB values
        const loadedR = p.red(loadedColor);
        const loadedG = p.green(loadedColor);
        const loadedB = p.blue(loadedColor);
        const loadedA = p.alpha(loadedColor);
        console.log(`Loaded RGB: R=${loadedR.toFixed(2)}, G=${loadedG.toFixed(2)}, B=${loadedB.toFixed(2)}, A=${loadedA.toFixed(2)}`);
        // Check differences
        const rDiff = Math.abs(originalR - loadedR);
        const gDiff = Math.abs(originalG - loadedG);
        const bDiff = Math.abs(originalB - loadedB);
        const aDiff = Math.abs(originalA - loadedA);
        console.log(`Differences: R=${rDiff.toFixed(2)}, G=${gDiff.toFixed(2)}, B=${bDiff.toFixed(2)}, A=${aDiff.toFixed(2)}`);
        if (rDiff < 0.01 && gDiff < 0.01 && bDiff < 0.01 && aDiff < 0.01) {
            console.log('✅ PERFECT MATCH - No precision loss!');
        }
        else {
            console.log('❌ PRECISION LOSS DETECTED');
        }
    });
    // Restore HSB mode
    p.colorMode(p.HSB, 360, 100, 100);
    console.log('=== END SAVE/LOAD TEST ===\n');
}
/**
 * Test the actual save/load system
 */
export function testActualSaveLoadSystem(p) {
    console.log('=== ACTUAL SAVE/LOAD SYSTEM TEST ===');
    // Import the save slot service
    import('../store/saveSlots').then(({ saveSlotService }) => {
        const currentPalette = palette();
        if (currentPalette.length === 0) {
            console.log('No palette colors to test');
            return;
        }
        // Test saving and loading a slot
        const testState = {
            rings: [],
            palette: currentPalette,
            innerDot: { visible: true, radius: 10, color1Index: 0, color2Index: 1, gradientStop: 0.5, maxRadius: 20 },
            globals: { randomness: 0.5, strokeCount: 12, colorBleed: 0.3, globalStrokeWidth: 0 },
            backgroundColor: { h: 0, s: 0, b: 0 },
            colorLock: false
        };
        console.log('Saving test state...');
        saveSlotService.saveToSlot(1, 'Color Test', testState, p);
        console.log('Loading test state...');
        const loadedState = saveSlotService.loadFromSlot(1, p);
        if (loadedState && loadedState.palette) {
            console.log('Comparing original vs loaded palette colors:');
            currentPalette.forEach((originalColor, index) => {
                const loadedColor = loadedState.palette[index];
                if (loadedColor) {
                    // Get RGB values for comparison
                    p.colorMode(p.RGB, 255);
                    const origR = p.red(originalColor);
                    const origG = p.green(originalColor);
                    const origB = p.blue(originalColor);
                    const origA = p.alpha(originalColor);
                    const loadR = p.red(loadedColor);
                    const loadG = p.green(loadedColor);
                    const loadB = p.blue(loadedColor);
                    const loadA = p.alpha(loadedColor);
                    const rDiff = Math.abs(origR - loadR);
                    const gDiff = Math.abs(origG - loadG);
                    const bDiff = Math.abs(origB - loadB);
                    const aDiff = Math.abs(origA - loadA);
                    console.log(`Color ${index}:`);
                    console.log(`  Original: rgb(${origR.toFixed(2)}, ${origG.toFixed(2)}, ${origB.toFixed(2)}, ${origA.toFixed(2)})`);
                    console.log(`  Loaded:   rgb(${loadR.toFixed(2)}, ${loadG.toFixed(2)}, ${loadB.toFixed(2)}, ${loadA.toFixed(2)})`);
                    console.log(`  Diff:     rgb(${rDiff.toFixed(2)}, ${gDiff.toFixed(2)}, ${bDiff.toFixed(2)}, ${aDiff.toFixed(2)})`);
                    if (rDiff < 0.01 && gDiff < 0.01 && bDiff < 0.01 && aDiff < 0.01) {
                        console.log('  ✅ PERFECT MATCH!');
                    }
                    else {
                        console.log('  ❌ PRECISION LOSS DETECTED');
                    }
                }
            });
        }
        else {
            console.log('Failed to load test state');
        }
        // Restore HSB mode
        p.colorMode(p.HSB, 360, 100, 100);
        console.log('=== END ACTUAL SAVE/LOAD TEST ===\n');
    }).catch(error => {
        console.error('Error testing save/load system:', error);
    });
}
/**
 * Test newly generated colors for perfect consistency
 */
export function testNewColorGeneration(p) {
    console.log('=== NEW COLOR GENERATION TEST ===');
    // Generate a fresh palette
    import('../core/color').then(({ generatePalette }) => {
        const newPalette = generatePalette(p);
        console.log('Generated new palette with', newPalette.length, 'colors');
        // Test each new color for round-trip consistency
        newPalette.forEach((color, index) => {
            console.log(`\n--- Testing New Color ${index} ---`);
            // Get original RGB values
            p.colorMode(p.RGB, 255);
            const origR = p.red(color);
            const origG = p.green(color);
            const origB = p.blue(color);
            const origA = p.alpha(color);
            console.log(`Original RGB: R=${origR.toFixed(2)}, G=${origG.toFixed(2)}, B=${origB.toFixed(2)}, A=${origA.toFixed(2)}`);
            // Simulate save/load with new system
            const serialized = { r: origR, g: origG, b: origB, a: origA };
            const loadedColor = p.color(serialized.r, serialized.g, serialized.b, serialized.a);
            // Get loaded RGB values
            const loadR = p.red(loadedColor);
            const loadG = p.green(loadedColor);
            const loadB = p.blue(loadedColor);
            const loadA = p.alpha(loadedColor);
            console.log(`Loaded RGB:   R=${loadR.toFixed(2)}, G=${loadG.toFixed(2)}, B=${loadB.toFixed(2)}, A=${loadA.toFixed(2)}`);
            // Check differences
            const rDiff = Math.abs(origR - loadR);
            const gDiff = Math.abs(origG - loadG);
            const bDiff = Math.abs(origB - loadB);
            const aDiff = Math.abs(origA - loadA);
            console.log(`Differences:  R=${rDiff.toFixed(2)}, G=${gDiff.toFixed(2)}, B=${bDiff.toFixed(2)}, A=${aDiff.toFixed(2)}`);
            if (rDiff < 0.01 && gDiff < 0.01 && bDiff < 0.01 && aDiff < 0.01) {
                console.log('✅ PERFECT MATCH - New color system works!');
            }
            else {
                console.log('❌ PRECISION LOSS DETECTED in new system');
            }
        });
        // Restore HSB mode
        p.colorMode(p.HSB, 360, 100, 100);
        console.log('=== END NEW COLOR TEST ===\n');
    }).catch(error => {
        console.error('Error testing new color generation:', error);
    });
}
/**
 * Quick diagnostic function for immediate testing
 */
export function runQuickColorDiagnostic(p) {
    const diagnostic = new ColorDiagnostic(p);
    diagnostic.runDiagnostics();
    // Test save/load consistency
    testSaveLoadColorConsistency(p);
    // Test actual save/load system
    testActualSaveLoadSystem(p);
    // Test new color generation
    testNewColorGeneration(p);
}
