import type p5 from 'p5';

/**
 * Simple color test to verify direct RGB color selection works perfectly
 */
export class SimpleColorTest {
  private p: p5;
  private testColors: p5.Color[] = [];

  constructor(p: p5) {
    this.p = p;
    this.setupTestColors();
  }

  /**
   * Create simple, predictable test colors
   */
  private setupTestColors(): void {
    this.p.colorMode(this.p.RGB, 255);
    
    // Create simple, pure colors
    this.testColors = [
      this.p.color(255, 0, 0),    // Pure Red
      this.p.color(0, 255, 0),    // Pure Green  
      this.p.color(0, 0, 255),    // Pure Blue
      this.p.color(255, 255, 0),  // Pure Yellow
      this.p.color(255, 0, 255),  // Pure Magenta
      this.p.color(0, 255, 255),  // Pure Cyan
    ];
    
    // Restore HSB mode
    this.p.colorMode(this.p.HSB, 360, 100, 100);
  }

  /**
   * Test direct color rendering without any conversions
   */
  testDirectColorRendering(): void {
    console.log('=== DIRECT COLOR RENDERING TEST ===');
    
    this.testColors.forEach((color, index) => {
      console.log(`\n--- Testing Color ${index} ---`);
      
      // Get RGB values
      this.p.colorMode(this.p.RGB, 255);
      const r = this.p.red(color);
      const g = this.p.green(color);
      const b = this.p.blue(color);
      
      console.log(`RGB: (${r}, ${g}, ${b})`);
      console.log(`Expected: ${this.getExpectedColorName(index)}`);
      
      // Test direct rendering
      this.renderTestStroke(color, index);
    });
    
    // Restore HSB mode
    this.p.colorMode(this.p.HSB, 360, 100, 100);
    console.log('=== END DIRECT COLOR TEST ===\n');
  }

  /**
   * Render a test stroke with the given color
   */
  private renderTestStroke(color: p5.Color, index: number): void {
    // Store current drawing state
    this.p.push();
    
    // Set up for direct RGB rendering
    this.p.colorMode(this.p.RGB, 255);
    this.p.stroke(color);
    this.p.strokeWeight(3);
    this.p.noFill();
    
    // Draw a simple test line
    const x = 100 + (index * 50);
    const y = 100;
    this.p.line(x, y, x + 30, y);
    
    // Add a label
    this.p.fill(255, 255, 255);
    this.p.textSize(12);
    this.p.text(this.getExpectedColorName(index), x, y + 20);
    
    // Restore drawing state
    this.p.pop();
  }

  /**
   * Get expected color name for index
   */
  private getExpectedColorName(index: number): string {
    const names = ['Red', 'Green', 'Blue', 'Yellow', 'Magenta', 'Cyan'];
    return names[index] || `Color ${index}`;
  }

  /**
   * Test color consistency across different rendering methods
   */
  testColorConsistency(): void {
    console.log('=== COLOR CONSISTENCY TEST ===');
    
    this.testColors.forEach((color, index) => {
      console.log(`\n--- Consistency Test for ${this.getExpectedColorName(index)} ---`);
      
      // Method 1: Direct RGB
      this.p.colorMode(this.p.RGB, 255);
      const directR = this.p.red(color);
      const directG = this.p.green(color);
      const directB = this.p.blue(color);
      console.log(`Direct RGB: (${directR}, ${directG}, ${directB})`);
      
      // Method 2: HSB conversion
      this.p.colorMode(this.p.HSB, 360, 100, 100);
      const h = this.p.hue(color);
      const s = this.p.saturation(color);
      const b = this.p.brightness(color);
      console.log(`HSB: (${h.toFixed(1)}, ${s.toFixed(1)}, ${b.toFixed(1)})`);
      
      // Method 3: HSB back to RGB
      this.p.colorMode(this.p.RGB, 255);
      const convertedR = this.p.red(color);
      const convertedG = this.p.green(color);
      const convertedB = this.p.blue(color);
      console.log(`HSB→RGB: (${convertedR}, ${convertedG}, ${convertedB})`);
      
      // Check if they match
      const rDiff = Math.abs(directR - convertedR);
      const gDiff = Math.abs(directG - convertedG);
      const bDiff = Math.abs(directB - convertedB);
      
      if (rDiff < 1 && gDiff < 1 && bDiff < 1) {
        console.log('✅ Colors match perfectly');
      } else {
        console.log(`❌ Color mismatch: R=${rDiff}, G=${gDiff}, B=${bDiff}`);
      }
    });
    
    // Restore HSB mode
    this.p.colorMode(this.p.HSB, 360, 100, 100);
    console.log('=== END CONSISTENCY TEST ===\n');
  }

  /**
   * Get test colors for use in the app
   */
  getTestColors(): p5.Color[] {
    return [...this.testColors];
  }
}

/**
 * Quick test function
 */
export function runSimpleColorTest(p: p5): void {
  const test = new SimpleColorTest(p);
  test.testDirectColorRendering();
  test.testColorConsistency();
}
