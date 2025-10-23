import type p5 from 'p5';

/**
 * Direct RGB palette system that eliminates HSB conversion issues
 */
export class DirectRgbPalette {
  private p: p5;
  private colors: p5.Color[] = [];

  constructor(p: p5) {
    this.p = p;
    this.generateDirectRgbPalette();
  }

  /**
   * Generate a palette using direct RGB values to avoid conversion issues
   */
  private generateDirectRgbPalette(): void {
    this.p.colorMode(this.p.RGB, 255);
    
    // Create a vibrant, harmonious palette using direct RGB values
    this.colors = [
      // Primary colors
      this.p.color(255, 0, 0),      // Pure Red
      this.p.color(0, 255, 0),      // Pure Green  
      this.p.color(0, 0, 255),      // Pure Blue
      
      // Secondary colors
      this.p.color(255, 255, 0),    // Pure Yellow
      this.p.color(255, 0, 255),    // Pure Magenta
      this.p.color(0, 255, 255),    // Pure Cyan
      
      // Tertiary colors
      this.p.color(255, 128, 0),    // Orange
      this.p.color(128, 0, 255),    // Purple
      this.p.color(0, 255, 128),    // Spring Green
      this.p.color(255, 0, 128),    // Rose
      
      // Additional vibrant colors
      this.p.color(128, 255, 0),    // Lime
      this.p.color(0, 128, 255),    // Sky Blue
    ];
    
    // Restore HSB mode for compatibility with existing code
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
   * Get RGB string for UI display (no conversion needed)
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
   * Generate a new random palette using direct RGB values
   */
  generateNewPalette(): void {
    this.p.colorMode(this.p.RGB, 255);
    
    // Generate random but harmonious RGB colors
    const baseHue = Math.random() * 360;
    this.colors = [];
    
    for (let i = 0; i < 4; i++) {
      // Create colors with good saturation and brightness
      const hue = (baseHue + i * 90) % 360;
      const saturation = 0.7 + Math.random() * 0.3; // 70-100% saturation
      const brightness = 0.8 + Math.random() * 0.2; // 80-100% brightness
      
      // Convert HSB to RGB manually to avoid p5 conversion issues
      const rgb = this.hsbToRgb(hue, saturation, brightness);
      this.colors.push(this.p.color(rgb.r, rgb.g, rgb.b));
    }
    
    // Restore HSB mode
    this.p.colorMode(this.p.HSB, 360, 100, 100);
  }

  /**
   * Convert HSB to RGB manually to avoid p5 conversion precision issues
   */
  private hsbToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  /**
   * Test color consistency
   */
  testConsistency(): void {
    console.log('=== DIRECT RGB PALETTE CONSISTENCY TEST ===');
    
    this.colors.forEach((color, index) => {
      console.log(`\n--- Color ${index} ---`);
      
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
    });
    
    // Restore HSB mode
    this.p.colorMode(this.p.HSB, 360, 100, 100);
    console.log('=== END DIRECT RGB TEST ===\n');
  }
}

/**
 * Create a direct RGB palette instance
 */
export function createDirectRgbPalette(p: p5): DirectRgbPalette {
  return new DirectRgbPalette(p);
}
