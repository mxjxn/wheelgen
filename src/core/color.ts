import type p5 from 'p5';

export function generatePalette(p: p5): p5.Color[] {
  // Use direct RGB generation to avoid HSB conversion issues
  return generateDirectRgbPalette(p);
}

/**
 * Generate palette using direct RGB values to avoid conversion precision loss
 */
export function generateDirectRgbPalette(p: p5): p5.Color[] {
  const palette: p5.Color[] = [];
  
  // Store current color mode
  const currentMode = (p as any)._colorMode;
  const currentMaxes = (p as any)._colorMaxes;
  
  try {
    // Generate random but harmonious RGB colors
    const baseHue = Math.random() * 360;
    
    for (let i = 0; i < 4; i++) {
      // Create colors with good saturation and brightness
      const hue = (baseHue + i * 90) % 360;
      const saturation = 0.7 + Math.random() * 0.3; // 70-100% saturation
      const brightness = 0.8 + Math.random() * 0.2; // 80-100% brightness
      
      // Convert HSB to RGB manually to avoid p5 conversion issues
      const rgb = hsbToRgbManual(hue, saturation, brightness);
      
      // Create color in RGB mode
      p.colorMode(p.RGB, 255);
      palette.push(p.color(rgb.r, rgb.g, rgb.b));
    }
    
    // Restore original color mode
    if (currentMode === p.HSB) {
      if (currentMaxes && currentMaxes.length >= 3) {
        p.colorMode(p.HSB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
      } else {
        p.colorMode(p.HSB, 360, 100, 100);
      }
    } else {
      if (currentMaxes && currentMaxes.length >= 3) {
        p.colorMode(p.RGB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
      } else {
        p.colorMode(p.RGB, 255, 255, 255);
      }
    }
    
    return palette;
  } catch (error) {
    // Fallback to original method if something goes wrong
    return generateLegacyPalette(p);
  }
}

/**
 * Convert HSB to RGB manually to avoid p5 conversion precision issues
 */
function hsbToRgbManual(h: number, s: number, v: number): { r: number; g: number; b: number } {
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
 * Legacy palette generation (fallback)
 */
function generateLegacyPalette(p: p5): p5.Color[] {
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

// Helper function to create properly normalized HSB colors
export function createHSBColor(p: p5, h: number, s: number, b: number): p5.Color {
  // When saturation is very low (<= 5), treat as grayscale to avoid color artifacts
  if (s <= 5) {
    // At very low saturation, brightness determines the grayscale value
    // Convert brightness to RGB grayscale
    const grayValue = (b / 100) * 255;
    p.colorMode(p.RGB, 255);
    const color = p.color(grayValue, grayValue, grayValue);
    p.colorMode(p.HSB, 360, 100, 100);
    return color;
  }
  
  // Normal HSB color
  p.colorMode(p.HSB, 360, 100, 100);
  const color = p.color(h, s, b);
  p.colorMode(p.HSB, 360, 100, 100);
  
  return color;
}

// Helper function to safely convert a p5.Color to RGB string without affecting global color mode
export function colorToRgbString(p: p5, color: p5.Color): string {
  // Store current color mode
  const currentMode = (p as any)._colorMode;
  const currentMaxes = (p as any)._colorMaxes;
  
  try {
    // Set RGB mode for reading
    p.colorMode(p.RGB, 255);
    const r = Math.round(p.red(color));
    const g = Math.round(p.green(color));
    const b = Math.round(p.blue(color));
    
    // Restore original color mode - handle undefined maxes gracefully
    if (currentMode === p.HSB) {
      if (currentMaxes && currentMaxes.length >= 3) {
        p.colorMode(p.HSB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
      } else {
        // Default HSB mode if maxes are undefined
        p.colorMode(p.HSB, 360, 100, 100);
      }
    } else {
      if (currentMaxes && currentMaxes.length >= 3) {
        p.colorMode(p.RGB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
      } else {
        // Default RGB mode if maxes are undefined
        p.colorMode(p.RGB, 255, 255, 255);
      }
    }
    
    const result = `rgb(${r}, ${g}, ${b})`;
    return result;
  } catch (error) {
    return '#ffffff';
  }
}

// OPTIMIZED: Batch convert multiple colors with single mode switch
export function batchConvertColorsToRgb(p: p5, colors: p5.Color[]): string[] {
  if (colors.length === 0) return [];
  
  // Store current color mode
  const currentMode = (p as any)._colorMode;
  const currentMaxes = (p as any)._colorMaxes;
  
  try {
    // Single mode switch for all colors
    p.colorMode(p.RGB, 255);
    
    const results = colors.map((color) => {
      try {
        const r = Math.round(p.red(color));
        const g = Math.round(p.green(color));
        const b = Math.round(p.blue(color));
        return `rgb(${r}, ${g}, ${b})`;
      } catch (error) {
        return '#ffffff';
      }
    });
    
    // Restore original color mode once
    if (currentMode === p.HSB) {
      if (currentMaxes && currentMaxes.length >= 3) {
        p.colorMode(p.HSB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
      } else {
        p.colorMode(p.HSB, 360, 100, 100);
      }
    } else {
      if (currentMaxes && currentMaxes.length >= 3) {
        p.colorMode(p.RGB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
      } else {
        p.colorMode(p.RGB, 255, 255, 255);
      }
    }
    
    return results;
  } catch (error) {
    // Restore mode even on error
    if (currentMode === p.HSB) {
      p.colorMode(p.HSB, 360, 100, 100);
    } else {
      p.colorMode(p.RGB, 255, 255, 255);
    }
    return colors.map(() => '#ffffff');
  }
}

// Helper function to convert HSB to RGB with proper saturation handling
export function hsbToRgb(p: p5, h: number, s: number, b: number): string {
  if (s <= 5) {
    // At very low saturation, return grayscale to avoid color artifacts
    const grayValue = Math.round((b / 100) * 255);
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
  }
  
  // Normal HSB to RGB conversion
  p.colorMode(p.HSB, 360, 100, 100);
  const color = p.color(h, s, b);
  p.colorMode(p.RGB, 255);
  const r = Math.round(p.red(color));
  const g = Math.round(p.green(color));
  const bVal = Math.round(p.blue(color));
  p.colorMode(p.HSB, 360, 100, 100);
  return `rgb(${r}, ${g}, ${bVal})`;
}

// Color tracing utilities
export function logColorInfo(p: p5, color: p5.Color, label: string) {
  // Store current color mode
  const currentMode = (p as any)._colorMode;
  const currentMaxes = (p as any)._colorMaxes;
  
  try {
    // Get HSL values (HSB in p5)
    p.colorMode(p.HSB, 360, 100, 100);
    const h = Math.round(p.hue(color));
    const s = Math.round(p.saturation(color));
    const b = Math.round(p.brightness(color));
    
    // Get RGB values
    p.colorMode(p.RGB, 255);
    const r = Math.round(p.red(color));
    const g = Math.round(p.green(color));
    const blue = Math.round(p.blue(color));
    
    
    // Restore original color mode
    if (currentMode === p.HSB) {
      if (currentMaxes && currentMaxes.length >= 3) {
        p.colorMode(p.HSB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
      } else {
        p.colorMode(p.HSB, 360, 100, 100);
      }
    } else {
      if (currentMaxes && currentMaxes.length >= 3) {
        p.colorMode(p.RGB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
      } else {
        p.colorMode(p.RGB, 255, 255, 255);
      }
    }
  } catch (error) {
  }
}

export function logPaletteColors(p: p5, palette: p5.Color[]) {
  palette.forEach((color, index) => {
    logColorInfo(p, color, `Palette Color ${index}`);
  });
}
