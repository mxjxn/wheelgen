import {
  Component,
  createMemo,
  createSignal,
  For,
} from "solid-js";
import { palette, setPalette, markChanges, updatePaletteAndRings, updateBackgroundColor } from "../store/artwork";
import { generatePalette, createHSBColor, colorToRgbString } from "../core/color";
import type p5 from "p5";

// Color Management Panel Component
export const ColorManagementPanel: Component<{
  getP: () => p5;
  requestRedraw: () => void;
}> = (props) => {
  const [selectedColorIndex, setSelectedColorIndex] = createSignal(0);
  
  // Get current palette
  const currentPalette = createMemo(() => palette());
  
  // Cached p5 instance for performance
  const p5Instance = createMemo(() => props.getP());
  
  // Cached palette colors for efficient thumbnail rendering
  const paletteColors = createMemo(() => {
    const pal = currentPalette();
    const p = p5Instance();
    if (!p) return pal.map(() => '#ffffff');
    
    return pal.map((color) => {
      try {
        const rgbString = colorToRgbString(p, color);
        return rgbString;
      } catch (error) {
        return '#ffffff';
      }
    });
  });
  
  // Generate palette based on harmony mode
  const generateHarmonyPalette = (mode: 'complementary' | 'triadic' | 'tetradic' | 'analogous') => {
    const p = p5Instance();
    if (!p) return;
    
    p.colorMode(p.HSB, 360, 100, 100);
    const baseHue = p.random(360);
    
    let hues: number[];
    switch (mode) {
      case 'complementary':
        hues = [baseHue, (baseHue + 180) % 360, (baseHue + 90) % 360, (baseHue + 270) % 360];
        break;
      case 'triadic':
        hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360, (baseHue + 60) % 360];
        break;
      case 'tetradic':
        hues = [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360];
        break;
      case 'analogous':
        hues = [baseHue, (baseHue + 30) % 360, (baseHue + 60) % 360, (baseHue + 90) % 360];
        break;
    }
    
    const newPalette = hues.map(hue => 
      createHSBColor(p, hue, p.random(60, 90), p.random(80, 100))
    );
    
    updatePaletteAndRings(newPalette, p);
    markChanges();
    props.requestRedraw();
  };
  
  // Generate random palette
  const generateRandomPalette = () => {
    const p = p5Instance();
    if (!p) return;
    
    const newPalette = generatePalette(p);
    updatePaletteAndRings(newPalette, p);
    markChanges();
    props.requestRedraw();
  };

  return (
    <div class="color-management-panel">
      <div class="panel-header">
        <h3 class="section-title">Color Palette</h3>
      </div>
      
      {/* Palette Generation Buttons */}
      <div class="palette-generation-section">
        <h4>Generate Palette</h4>
        <div class="palette-buttons">
          <button
            class="palette-button"
            onClick={() => generateHarmonyPalette('complementary')}
          >
            Complementary
          </button>
          <button
            class="palette-button"
            onClick={() => generateHarmonyPalette('triadic')}
          >
            Triadic
          </button>
          <button
            class="palette-button"
            onClick={() => generateHarmonyPalette('tetradic')}
          >
            Tetradic
          </button>
          <button
            class="palette-button"
            onClick={() => generateHarmonyPalette('analogous')}
          >
            Analogous
          </button>
          <button
            class="palette-button random"
            onClick={generateRandomPalette}
          >
            Random
          </button>
        </div>
      </div>
      
      {/* Palette Preview */}
      <div class="palette-section">
        <h4>Current Palette</h4>
        <div class="palette-swatches">
          <For each={paletteColors()}>
            {(backgroundColor, index) => {
              const colorLabel = String.fromCharCode(65 + index()); // A, B, C, D...
              return (
                <button
                  class={`palette-swatch ${selectedColorIndex() === index() ? 'selected' : ''}`}
                  style={`background-color: ${backgroundColor}`}
                  onClick={() => setSelectedColorIndex(index())}
                  title={`Color ${colorLabel}`}
                >
                  <span class="color-label">{colorLabel}</span>
                </button>
              );
            }}
          </For>
        </div>
      </div>
      
      {/* Background Color Selector */}
      <div class="background-color-section">
        <h4>Background Color</h4>
        <div class="background-controls">
          <button
            class="background-button"
            onClick={() => {
              const p = p5Instance();
              if (!p) return;
              p.colorMode(p.HSB, 360, 100, 100);
              const bgColor = p.color(p.random(360), p.random(20, 40), p.random(10, 30));
              updateBackgroundColor(p.hue(bgColor), p.saturation(bgColor), p.brightness(bgColor), p);
              props.requestRedraw();
            }}
          >
            Random Background
          </button>
        </div>
      </div>
    </div>
  );
};