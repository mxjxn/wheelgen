import p5 from 'p5';
import { Ring } from '../model/ring';
import { drawInnerDot } from '../model/inner-dot';
import { 
  rings, 
  palette, 
  innerDot, 
  guidesVisible, 
  initializeArtwork as initializeArtworkStore 
} from '../store/artwork';

export function mountSketch(container: HTMLElement) {
  let pInstance: p5 | null = null;
  const sketch = (p: p5) => {
    pInstance = p;
    
    p.setup = () => {
      // Get the container dimensions instead of full window
      const containerRect = container.getBoundingClientRect();
      p.createCanvas(containerRect.width, containerRect.height);
      p.noLoop();
      p.background(0);
      // Initialize full artwork state using new store
      initializeArtworkStore(p);
    };

    p.draw = () => {
      p.background(0);
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
      for (const r of currentRings) r.display(p, 1.0);
      
      // Display inner dot - now reactive to store
      const currentInnerDot = innerDot();
      if (currentInnerDot.visible && currentInnerDot.radius > 0) {
        const currentPalette = palette();
        drawInnerDot(p, currentPalette, currentInnerDot, 1.0);
      }
      
      p.pop();
    };

    p.windowResized = () => {
      // Resize to container dimensions instead of full window
      const containerRect = container.getBoundingClientRect();
      p.resizeCanvas(containerRect.width, containerRect.height);
      // Don't reinitialize artwork on resize - just redraw existing state
      // The artwork should only be randomly generated on initial load and manual randomize
      p.redraw();
    };
  };

  // eslint-disable-next-line no-new
  new p5(sketch, container);

  return {
    getP: () => pInstance as p5,
    redraw: () => {
      if (pInstance) pInstance.redraw();
    },
  };
}
