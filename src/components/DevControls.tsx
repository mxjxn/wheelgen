import { Component } from 'solid-js';
import '../styles/components/dev-controls.css';
import { runQuickColorDiagnostic } from '../core/color-diagnostic';
import { runSimpleColorTest } from '../core/simple-color-test';
import { generateDirectRgbPalette } from '../core/color';
import { SimpleColorTest } from './SimpleColorTest';

// Props interface
interface DevControlsProps {
  getP: () => any; // p5 instance
  requestRedraw: () => void;
}

export const DevControls: Component<DevControlsProps> = (props) => {
  return (
    <div class="dev-controls">
      {/* Simple Color Test */}
      <SimpleColorTest 
        getP={() => props.getP()}
        requestRedraw={props.requestRedraw}
      />

      {/* Color Diagnostic Button */}
      <button
        onClick={() => {
          const p = props.getP();
          if (p) {
            runQuickColorDiagnostic(p);
          }
        }}
        class="action-button diagnostic-button"
        title="Run color diagnostic to identify UI vs P5 rendering mismatches"
      >
        🔍 Color Diagnostic
      </button>

      {/* Simple Color Test Button */}
      <button
        onClick={() => {
          const p = props.getP();
          if (p) {
            runSimpleColorTest(p);
          }
        }}
        class="action-button simple-test-button"
        title="Test simple direct color rendering without conversions"
      >
        🎨 Simple Color Test
      </button>

      {/* Test Direct RGB Palette Button */}
      <button
        onClick={() => {
          const p = props.getP();
          if (p) {
            console.log('=== TESTING DIRECT RGB PALETTE ===');
            const newPalette = generateDirectRgbPalette(p);
            console.log('Generated new palette with', newPalette.length, 'colors');
            
            // Test each color
            newPalette.forEach((color, index) => {
              p.colorMode(p.RGB, 255);
              const r = p.red(color);
              const g = p.green(color);
              const b = p.blue(color);
              console.log(`Color ${index}: rgb(${r}, ${g}, ${b})`);
            });
            
            p.colorMode(p.HSB, 360, 100, 100);
            console.log('=== END DIRECT RGB TEST ===');
          }
        }}
        class="action-button test-palette-button"
        title="Test the new direct RGB palette generation"
      >
        🧪 Test Direct RGB Palette
      </button>
    </div>
  );
};
