import type p5 from 'p5';
/**
 * Comprehensive color diagnostic tool to identify UI vs P5 rendering mismatches
 */
export declare class ColorDiagnostic {
    private p;
    private logs;
    constructor(p: p5);
    /**
     * Run comprehensive color consistency tests
     */
    runDiagnostics(): void;
    /**
     * Test individual palette color consistency
     */
    private testPaletteColor;
    /**
     * Test UI color conversion (simulating ColorManagementPanel behavior)
     */
    private testUIColorConversion;
    /**
     * Test round-trip conversion (HSB -> RGB -> HSB)
     */
    private testRoundTripConversion;
    /**
     * Test color lerping behavior
     */
    private testColorLerping;
    /**
     * Test conversion consistency between UI and P5 rendering
     */
    private testConversionConsistency;
    /**
     * Get color string representation
     */
    private getColorString;
    /**
     * Log message
     */
    private log;
    /**
     * Print all logs
     */
    private printLogs;
    /**
     * Get logs as string
     */
    getLogs(): string;
}
/**
 * Test save/load color consistency
 */
export declare function testSaveLoadColorConsistency(p: p5): void;
/**
 * Test the actual save/load system
 */
export declare function testActualSaveLoadSystem(p: p5): void;
/**
 * Test newly generated colors for perfect consistency
 */
export declare function testNewColorGeneration(p: p5): void;
/**
 * Quick diagnostic function for immediate testing
 */
export declare function runQuickColorDiagnostic(p: p5): void;
