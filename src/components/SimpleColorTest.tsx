import { Component, createSignal, For } from 'solid-js';
import { createSimplePalette } from '../core/simple-palette';
import type p5 from 'p5';

interface SimpleColorTestProps {
  getP: () => p5;
  requestRedraw: () => void;
}

export const SimpleColorTest: Component<SimpleColorTestProps> = (props) => {
  const [selectedColorIndex, setSelectedColorIndex] = createSignal(0);
  const [isVisible, setIsVisible] = createSignal(false);
  
  // Create simple palette
  const simplePalette = createSimplePalette(props.getP());
  const colors = simplePalette.getColors();
  
  // Test color rendering
  const testColorRendering = () => {
    const p = props.getP();
    if (!p) return;
    
    // Clear canvas
    p.background(20, 20, 20);
    
    // Draw test strokes with selected color
    const selectedColor = colors[selectedColorIndex()];
    p.colorMode(p.RGB, 255);
    p.stroke(selectedColor);
    p.strokeWeight(8);
    p.noFill();
    
    // Draw multiple test strokes
    for (let i = 0; i < 5; i++) {
      const y = 100 + i * 40;
      p.line(50, y, 300, y);
    }
    
    // Add label
    p.fill(255, 255, 255);
    p.textSize(16);
    p.text(`Selected: ${simplePalette.getColorName(selectedColorIndex())}`, 50, 50);
    p.text(`RGB: ${simplePalette.getColorRgbString(selectedColorIndex())}`, 50, 70);
    
    // Restore HSB mode
    p.colorMode(p.HSB, 360, 100, 100);
  };
  
  return (
    <div class="simple-color-test">
      <button
        onClick={() => setIsVisible(!isVisible())}
        class="toggle-button"
      >
        {isVisible() ? 'Hide' : 'Show'} Simple Color Test
      </button>
      
      {isVisible() && (
        <div class="simple-color-test-panel">
          <h4>Simple Color Test</h4>
          <p>Select a color and see it rendered directly without conversions:</p>
          
          <div class="color-swatches">
            <For each={colors}>
              {(color, index) => (
                <button
                  class={`color-swatch ${selectedColorIndex() === index() ? 'selected' : ''}`}
                  style={`background-color: ${simplePalette.getColorRgbString(index())}`}
                  onClick={() => {
                    setSelectedColorIndex(index());
                    testColorRendering();
                  }}
                  title={`${simplePalette.getColorName(index())} - ${simplePalette.getColorRgbString(index())}`}
                >
                  <span class="color-label">{simplePalette.getColorName(index())}</span>
                </button>
              )}
            </For>
          </div>
          
          <div class="test-controls">
            <button
              onClick={testColorRendering}
              class="test-button"
            >
              Render Test Strokes
            </button>
            
            <button
              onClick={() => {
                simplePalette.testConsistency();
                props.requestRedraw();
              }}
              class="test-button"
            >
              Run Consistency Test
            </button>
          </div>
          
          <div class="current-selection">
            <h5>Current Selection:</h5>
            <p><strong>Color:</strong> {simplePalette.getColorName(selectedColorIndex())}</p>
            <p><strong>RGB:</strong> {simplePalette.getColorRgbString(selectedColorIndex())}</p>
          </div>
        </div>
      )}
    </div>
  );
};
