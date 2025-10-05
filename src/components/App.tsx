import { Component, onMount } from 'solid-js';
import { hasChanges, initializeArtwork, clearChanges } from '../store/artwork';
import { RingsControls } from './RingsControls';
import type p5 from 'p5';

interface AppProps {
  p5Instance: p5;
}

export const App: Component<AppProps> = (props) => {
  // Initialize artwork when component mounts
  onMount(() => {
    // Wait for p5 instance to be ready
    const waitForP5 = () => {
      const p = props.p5Instance;
      if (p && p._renderer) {
        initializeArtwork(p);
      } else {
        setTimeout(waitForP5, 100);
      }
    };
    
    waitForP5();
  });

  const handleRequestRedraw = () => {
    // Get the p5 instance and trigger a redraw
    const p = props.p5Instance;
    if (p) {
      p.redraw();
    }
    // Clear changes after redraw
    if (hasChanges()) {
      clearChanges();
    }
  };

  return (
    <div class="controls-container">
      {/* Ring Controls with Actions Header */}
      <RingsControls 
        getP={() => props.p5Instance}
        requestRedraw={handleRequestRedraw}
      />
    </div>
  );
};
