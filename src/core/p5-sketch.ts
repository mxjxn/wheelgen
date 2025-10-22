import p5 from 'p5';
import { drawInnerDot } from '../model/inner-dot';
import { 
  rings, 
  palette, 
  innerDot, 
  guidesVisible, 
  backgroundColor,
  initializeArtwork as initializeArtworkStore 
} from '../store/artwork';
import { logRingStrokeData } from '../model/particle';

export function mountSketch(container: HTMLElement) {
  let pInstance: p5 | null = null;
  let resizeHandler: (() => void) | null = null;
  let isInitialized = false; // Track if artwork has been initialized
  let hasLoggedRingData = false; // Track if we've logged ring stroke data
  
  
  const sketch = (p: p5) => {
    pInstance = p;
    
    p.setup = () => {
      
      // Use full viewport dimensions for full-screen art
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      p.createCanvas(width, height);
      p.noLoop();
      p.background(0);
      
      // Enable right-click context menu for saving
      const canvas = p.canvas as HTMLCanvasElement;
      canvas.style.cursor = 'default';
      
      // Add context menu event listener for right-click save
      canvas.addEventListener('contextmenu', (e) => {
        // Allow default context menu (right-click save)
        // The browser's native "Save image as..." will work
        console.log('Right-click detected - use browser\'s "Save image as..." option');
      });
      
      // Only initialize artwork if not already done
      if (!isInitialized) {
        initializeArtworkStore(p);
        isInitialized = true;
        hasLoggedRingData = false; // Reset logging flag for new artwork
      } else {
      }
      
      // Force initial draw
      p.redraw();
      
      // Set up window resize handler for full-screen canvas
      resizeHandler = () => {
        if (pInstance) {
          const width = window.innerWidth;
          const height = window.innerHeight;
          pInstance.resizeCanvas(width, height);
          pInstance.redraw();
        }
      };
      
      window.addEventListener('resize', resizeHandler);
    };

    p.draw = () => {
      
      // Use background color from store, fallback to black
      const bgColor = backgroundColor();
      if (bgColor) {
        p.background(bgColor);
      } else {
        p.background(0);
      }
      
      p.push();
      p.translate(p.width / 2, p.height / 2);
      
      // Simple guides - now reactive to store
      if (guidesVisible()) {
        p.colorMode(p.RGB);
        const radius = Math.min(p.width, p.height) / 2 * 0.9;
        for (let i = 0; i < 64; i++) {
          const angle = p.map(i, 0, 64, 0, p.TWO_PI);
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          if (i % (64 / 16) === 0) { p.stroke(255, 0, 0, 60); p.strokeWeight(1.5); }
          else if (i % (64 / 32) === 0) { p.stroke(0, 255, 0, 40); p.strokeWeight(1); }
          else { p.stroke(0, 0, 255, 30); p.strokeWeight(0.5); }
          p.line(0, 0, x, y);
        }
        p.colorMode(p.HSB, 360, 100, 100);
      }
      
      // Display rings - now reactive to store
      const currentRings = rings();
      for (const r of currentRings) {
        r.display(p, 1.0);
      }
      
      // Log ring stroke data on first draw (after particles are created)
      if (!hasLoggedRingData && isInitialized) {
        hasLoggedRingData = true;
        logRingStrokeData(p);
      }
      
      // Display inner dot - now reactive to store
      const currentInnerDot = innerDot();
      if (currentInnerDot.visible && currentInnerDot.radius > 0) {
        const currentPalette = palette();
        drawInnerDot(p, currentPalette, currentInnerDot, 1.0);
      }
      
      p.pop();
    };

    p.windowResized = () => {
      // Don't resize on window resize - let ResizeObserver handle it
    };
  };

  // eslint-disable-next-line no-new
  new p5(sketch, container);

  return {
    getP: () => pInstance as p5,
    redraw: () => {
      if (pInstance) pInstance.redraw();
    },
    resetLogging: () => {
      hasLoggedRingData = false;
    },
    cleanup: () => {
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
    },
  };
}
