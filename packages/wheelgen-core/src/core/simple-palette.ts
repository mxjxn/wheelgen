import type p5 from 'p5';

/**
 * Simple palette system using direct RGB values to eliminate conversion issues
 */
export class SimplePalette {
  private p: p5;
  private colors: p5.Color[] = [];

  constructor(p: p5) {
    this.p = p;
    this.setupSimpleColors();
  }

  /**
   * Create simple, predictable colors using direct RGB values
   */
  private setupSimpleColors(): void {
    this.p.colorMode(this.p.RGB, 255);
    
    // Create simple, pure colors that are easy to verify
    this.colors = [
      this.p.color(255, 0, 0),      // Pure Red
      this.p.color(0, 255, 0),      // Pure Green  
      this.p.color(0, 0, 255),      // Pure Blue
      this.p.color(255, 255, 0),    // Pure Yellow
      this.p.color(255, 0, 255),    // Pure Magenta
      this.p.color(0, 255, 255),    // Pure Cyan
      this.p.color(255, 128, 0),    // Orange
      this.p.color(128, 0, 255),    // Purple
    ];
    
    // Restore HSB mode for compatibility
    this.p.colorMode(this.p.HSB, 360, 100, 100);
  }

  /**
   * Get all colors in the palette
   */
  getColors(): p5.Color[] {
    return [...this.colors];
  }

  /**
   * Get a specific color by index
   */
  getColor(index: number): p5.Color {
    return this.colors[index % this.colors.length];
  }

  /**
   * Get color name for display
   */
  getColorName(index: number): string {
    const names = ['Red', 'Green', 'Blue', 'Yellow', 'Magenta', 'Cyan', 'Orange', 'Purple'];
    return names[index % names.length];
  }

  /**
   * Get RGB string for UI display
   */
  getColorRgbString(index: number): string {
    const color = this.getColor(index);
    this.p.colorMode(this.p.RGB, 255);
    const r = Math.round(this.p.red(color));
    const g = Math.round(this.p.green(color));
    const b = Math.round(this.p.blue(color));
    this.p.colorMode(this.p.HSB, 360, 100, 100);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Test color consistency
   */
  testConsistency(): void {
    console.log('=== SIMPLE PALETTE CONSISTENCY TEST ===');
    
    this.colors.forEach((color, index) => {
      console.log(`\n--- ${this.getColorName(index)} ---`);
      
      // Get RGB values
      this.p.colorMode(this.p.RGB, 255);
      const r = this.p.red(color);
      const g = this.p.green(color);
      const b = this.p.blue(color);
      
      console.log(`RGB: (${r}, ${g}, ${b})`);
      console.log(`UI String: ${this.getColorRgbString(index)}`);
      
      // Test direct rendering
      this.p.stroke(color);
      this.p.strokeWeight(5);
      this.p.line(50 + index * 60, 50, 50 + index * 60, 100);
      
      // Add label
      this.p.fill(255, 255, 255);
      this.p.textSize(12);
      this.p.text(this.getColorName(index), 50 + index * 60 - 20, 120);
    });
    
    // Restore HSB mode
    this.p.colorMode(this.p.HSB, 360, 100, 100);
    console.log('=== END SIMPLE PALETTE TEST ===\n');
  }
}

/**
 * Create a simple palette instance
 */
export function createSimplePalette(p: p5): SimplePalette {
  return new SimplePalette(p);
}
