import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  onMount,
  onCleanup,
  For,
} from "solid-js";
import { palette, setPalette, markChanges, updatePaletteAndRings } from "../store/artwork";
import type p5 from "p5";
import p5Lib from "p5";

// Color Management Panel Component
export const ColorManagementPanel: Component<{
  getP: () => p5;
  requestRedraw: () => void;
}> = (props) => {
  const [selectedColorIndex, setSelectedColorIndex] = createSignal(0);
  const [harmonyMode, setHarmonyMode] = createSignal<'complementary' | 'triadic' | 'tetradic' | 'custom'>('complementary');
  
  // Color wheel state
  const [currentColor, setCurrentColor] = createSignal({ h: 0, s: 100, b: 100 });
  const [colorWheelSketch, setColorWheelSketch] = createSignal<any>(null);
  
  // Multi-point color wheel state for harmony modes
  const [colorPoints, setColorPoints] = createSignal<Array<{ h: number; s: number; b: number; x: number; y: number }>>([]);
  const [draggedPointIndex, setDraggedPointIndex] = createSignal<number | null>(null);
  const [selectedPointIndex, setSelectedPointIndex] = createSignal<number>(0);
  
  // Deferred rendering state
  const [renderTimeout, setRenderTimeout] = createSignal<NodeJS.Timeout | null>(null);
  const [pendingRender, setPendingRender] = createSignal<boolean>(false);
  const [isDragging, setIsDragging] = createSignal<boolean>(false);
  
  // Background color state
  const [backgroundColorWheelSketch, setBackgroundColorWheelSketch] = createSignal<any>(null);
  const [currentBackgroundColor, setCurrentBackgroundColor] = createSignal({ h: 0, s: 0, b: 0 });
  
  // Get current palette
  const currentPalette = createMemo(() => palette());
  
  // Cached p5 instance for performance
  const p5Instance = createMemo(() => props.getP());
  
  // Cached palette colors for efficient thumbnail rendering
  const paletteColors = createMemo(() => {
    const pal = currentPalette();
    const p = p5Instance();
    if (!p) return pal.map(() => '#ffffff');
    
    return pal.map(color => {
      try {
        const r = Math.round(p.red(color));
        const g = Math.round(p.green(color));
        const b = Math.round(p.blue(color));
        return `rgb(${r}, ${g}, ${b})`;
      } catch (error) {
        console.warn('Error converting color:', error);
        return '#ffffff';
      }
    });
  });
  
  // Initialize harmony colors based on current mode
  const initializeHarmonyColors = (baseHue: number = Math.random() * 360) => {
    const points: Array<{ h: number; s: number; b: number; x: number; y: number }> = [];
    const wheelSize = 200;
    const maxRadius = wheelSize / 2 - 15;
    
    switch (harmonyMode()) {
      case 'complementary':
        points.push({
          h: baseHue,
          s: 80,
          b: 90,
          x: Math.cos(baseHue * Math.PI / 180) * maxRadius * 0.8,
          y: Math.sin(baseHue * Math.PI / 180) * maxRadius * 0.8
        });
        points.push({
          h: (baseHue + 180) % 360,
          s: 80,
          b: 90,
          x: Math.cos((baseHue + 180) * Math.PI / 180) * maxRadius * 0.8,
          y: Math.sin((baseHue + 180) * Math.PI / 180) * maxRadius * 0.8
        });
        break;
      case 'triadic':
        points.push({
          h: baseHue,
          s: 80,
          b: 90,
          x: Math.cos(baseHue * Math.PI / 180) * maxRadius * 0.8,
          y: Math.sin(baseHue * Math.PI / 180) * maxRadius * 0.8
        });
        points.push({
          h: (baseHue + 120) % 360,
          s: 80,
          b: 90,
          x: Math.cos((baseHue + 120) * Math.PI / 180) * maxRadius * 0.8,
          y: Math.sin((baseHue + 120) * Math.PI / 180) * maxRadius * 0.8
        });
        points.push({
          h: (baseHue + 240) % 360,
          s: 80,
          b: 90,
          x: Math.cos((baseHue + 240) * Math.PI / 180) * maxRadius * 0.8,
          y: Math.sin((baseHue + 240) * Math.PI / 180) * maxRadius * 0.8
        });
        break;
      case 'tetradic':
        points.push({
          h: baseHue,
          s: 80,
          b: 90,
          x: Math.cos(baseHue * Math.PI / 180) * maxRadius * 0.8,
          y: Math.sin(baseHue * Math.PI / 180) * maxRadius * 0.8
        });
        points.push({
          h: (baseHue + 90) % 360,
          s: 80,
          b: 90,
          x: Math.cos((baseHue + 90) * Math.PI / 180) * maxRadius * 0.8,
          y: Math.sin((baseHue + 90) * Math.PI / 180) * maxRadius * 0.8
        });
        points.push({
          h: (baseHue + 180) % 360,
          s: 80,
          b: 90,
          x: Math.cos((baseHue + 180) * Math.PI / 180) * maxRadius * 0.8,
          y: Math.sin((baseHue + 180) * Math.PI / 180) * maxRadius * 0.8
        });
        points.push({
          h: (baseHue + 270) % 360,
          s: 80,
          b: 90,
          x: Math.cos((baseHue + 270) * Math.PI / 180) * maxRadius * 0.8,
          y: Math.sin((baseHue + 270) * Math.PI / 180) * maxRadius * 0.8
        });
        break;
      case 'custom':
        for (let i = 0; i < 4; i++) {
          const hue = (baseHue + i * 90) % 360;
          points.push({
            h: hue,
            s: 70 + Math.random() * 20,
            b: 80 + Math.random() * 20,
            x: Math.cos(hue * Math.PI / 180) * maxRadius * 0.8,
            y: Math.sin(hue * Math.PI / 180) * maxRadius * 0.8
          });
        }
        break;
    }
    
    setColorPoints(points);
    return points;
  };
  
  // Update harmony colors parametrically when one point is dragged
  const updateHarmonyFromPoint = (changedIndex: number) => {
    const points = colorPoints();
    if (points.length === 0 || changedIndex >= points.length) return;
    
    const baseHue = points[changedIndex].h;
    const newPoints = [...points];
    
    switch (harmonyMode()) {
      case 'complementary':
        if (changedIndex === 0) {
          newPoints[1] = {
            ...newPoints[1],
            h: (baseHue + 180) % 360,
            x: Math.cos((baseHue + 180) * Math.PI / 180) * (200 / 2 - 15) * 0.8,
            y: Math.sin((baseHue + 180) * Math.PI / 180) * (200 / 2 - 15) * 0.8
          };
        } else {
          newPoints[0] = {
            ...newPoints[0],
            h: (baseHue + 180) % 360,
            x: Math.cos((baseHue + 180) * Math.PI / 180) * (200 / 2 - 15) * 0.8,
            y: Math.sin((baseHue + 180) * Math.PI / 180) * (200 / 2 - 15) * 0.8
          };
        }
        break;
      case 'triadic':
        if (changedIndex === 0) {
          newPoints[1] = {
            ...newPoints[1],
            h: (baseHue + 120) % 360,
            x: Math.cos((baseHue + 120) * Math.PI / 180) * (200 / 2 - 15) * 0.8,
            y: Math.sin((baseHue + 120) * Math.PI / 180) * (200 / 2 - 15) * 0.8
          };
          newPoints[2] = {
            ...newPoints[2],
            h: (baseHue + 240) % 360,
            x: Math.cos((baseHue + 240) * Math.PI / 180) * (200 / 2 - 15) * 0.8,
            y: Math.sin((baseHue + 240) * Math.PI / 180) * (200 / 2 - 15) * 0.8
          };
        } else if (changedIndex === 1) {
          newPoints[0] = {
            ...newPoints[0],
            h: (baseHue + 240) % 360,
            x: Math.cos((baseHue + 240) * Math.PI / 180) * (200 / 2 - 15) * 0.8,
            y: Math.sin((baseHue + 240) * Math.PI / 180) * (200 / 2 - 15) * 0.8
          };
          newPoints[2] = {
            ...newPoints[2],
            h: (baseHue + 120) % 360,
            x: Math.cos((baseHue + 120) * Math.PI / 180) * (200 / 2 - 15) * 0.8,
            y: Math.sin((baseHue + 120) * Math.PI / 180) * (200 / 2 - 15) * 0.8
          };
        } else {
          newPoints[0] = {
            ...newPoints[0],
            h: (baseHue + 120) % 360,
            x: Math.cos((baseHue + 120) * Math.PI / 180) * (200 / 2 - 15) * 0.8,
            y: Math.sin((baseHue + 120) * Math.PI / 180) * (200 / 2 - 15) * 0.8
          };
          newPoints[1] = {
            ...newPoints[1],
            h: (baseHue + 240) % 360,
            x: Math.cos((baseHue + 240) * Math.PI / 180) * (200 / 2 - 15) * 0.8,
            y: Math.sin((baseHue + 240) * Math.PI / 180) * (200 / 2 - 15) * 0.8
          };
        }
        break;
      case 'tetradic':
        const offsets = [0, 90, 180, 270];
        for (let i = 0; i < 4; i++) {
          if (i !== changedIndex) {
            const newHue = (baseHue + offsets[i] - offsets[changedIndex] + 360) % 360;
            newPoints[i] = {
              ...newPoints[i],
              h: newHue,
              x: Math.cos(newHue * Math.PI / 180) * (200 / 2 - 15) * 0.8,
              y: Math.sin(newHue * Math.PI / 180) * (200 / 2 - 15) * 0.8
            };
          }
        }
        break;
    }
    
    setColorPoints(newPoints);
    // Only update palette when not dragging - defer expensive operations
    if (!isDragging()) {
      updatePaletteFromPoints(newPoints);
    }
  };
  
  // Deferred rendering function for smooth UI interactions
  const scheduleRender = (immediate: boolean = false) => {
    if (renderTimeout()) {
      clearTimeout(renderTimeout()!);
    }
    
    if (immediate) {
      setPendingRender(false);
      props.requestRedraw();
    } else {
      setPendingRender(true);
      const timeout = setTimeout(() => {
        setPendingRender(false);
        props.requestRedraw();
      }, 100); // 100ms delay for smooth UI during dragging
      setRenderTimeout(timeout);
    }
  };

  // Update palette immediately for UI feedback, defer canvas rendering
  const updatePaletteForUI = (points: Array<{ h: number; s: number; b: number; x: number; y: number }>) => {
    const p = p5Instance();
    if (!p) return;
    
    const newPalette: p5.Color[] = [];
    p.colorMode(p.HSB, 360, 100, 100);
    
    for (const point of points) {
      newPalette.push(p.color(point.h, point.s, point.b));
    }
    
    // Fill remaining palette slots if needed
    while (newPalette.length < 4) {
      newPalette.push(p.color(Math.random() * 360, 70, 80));
    }
    
    // Use the unified function to update both palette and ring colors
    updatePaletteAndRings(newPalette, p);
    
    // Only schedule canvas render, don't do it immediately
    if (isDragging()) {
      scheduleRender(false); // Deferred during dragging
    } else {
      scheduleRender(true); // Immediate when not dragging
    }
  };

  // Update palette from color points - use new deferred system
  const updatePaletteFromPoints = (points: Array<{ h: number; s: number; b: number; x: number; y: number }>) => {
    updatePaletteForUI(points);
  };
  
  // Initialize color wheel when component mounts
  onMount(() => {
    console.log('ColorManagementPanel: onMount called');
    // Wait for both p5 instance and DOM to be ready
    const waitForReady = () => {
      const p = props.getP();
      const container = document.getElementById('color-wheel-container');
      console.log('ColorManagementPanel: Checking readiness...', {
        p5: !!p,
        p5Renderer: !!(p && p._renderer),
        container: !!container,
        containerParent: container?.parentElement
      });
      
      if (p && p._renderer && container) {
        console.log('ColorManagementPanel: Both p5 and DOM ready, initializing color wheels');
        initializeColorWheel(p);
        initializeBackgroundColorWheel(p);
      } else {
        console.log('ColorManagementPanel: Waiting for p5 or DOM...');
        setTimeout(waitForReady, 100);
      }
    };
    
    // Small delay to ensure DOM is rendered
    setTimeout(waitForReady, 50);
  });
  
  // Cleanup on unmount
  onCleanup(() => {
    if (colorWheelSketch()) {
      colorWheelSketch().remove();
    }
    if (backgroundColorWheelSketch()) {
      backgroundColorWheelSketch().remove();
    }
    if (renderTimeout()) {
      clearTimeout(renderTimeout()!);
    }
  });
  
  const initializeColorWheel = (p: p5) => {
    console.log('ColorManagementPanel: Initializing multi-point color wheel with p5 instance:', p);
    // Create multi-point color wheel sketch
    const sketch = new p5Lib((sketch: p5) => {
      let wheelSize = 200;
      let centerX, centerY;
      let isDragging = false;
      let needsRedraw = true;
      let wheelGraphics: any;
      
      sketch.setup = () => {
        console.log('ColorManagementPanel: Multi-point color wheel setup starting...');
        const canvas = sketch.createCanvas(wheelSize, wheelSize);
        const container = document.getElementById('color-wheel-container');
        console.log('ColorManagementPanel: Color wheel container found:', !!container);
        if (container) {
          canvas.parent('color-wheel-container');
          console.log('ColorManagementPanel: Color wheel canvas parented to container');
        } else {
          console.warn('ColorManagementPanel: Color wheel container not found, appending to body');
          canvas.parent(document.body);
        }
        centerX = wheelSize / 2;
        centerY = wheelSize / 2;
        sketch.colorMode(sketch.HSB, 360, 100, 100);
        
        wheelGraphics = sketch.createGraphics(wheelSize, wheelSize);
        wheelGraphics.colorMode(sketch.HSB, 360, 100, 100);
        generateWheelGraphics();
        
        // Initialize harmony colors
        initializeHarmonyColors();
        console.log('ColorManagementPanel: Multi-point color wheel setup complete');
        
        // Expose redraw function for external use
        sketch.forceRedraw = () => {
          needsRedraw = true;
        };
      };
      
      sketch.draw = () => {
        if (needsRedraw) {
          sketch.background(0);
          sketch.image(wheelGraphics, 0, 0);
          drawHarmonyLines();
          drawColorPoints();
          needsRedraw = false;
        }
      };
      
      function generateWheelGraphics() {
        wheelGraphics.background(0);
        
        let maxRadius = wheelSize / 2 - 15;
        
        for (let angle = 0; angle < 360; angle += 2) {
          for (let radius = 0; radius < maxRadius; radius += 3) {
            let x = centerX + sketch.cos(sketch.radians(angle)) * radius;
            let y = centerY + sketch.sin(sketch.radians(angle)) * radius;
            
            let hue = angle;
            let saturation = sketch.map(radius, 0, maxRadius, 0, 100);
            let brightness = 100;
            
            wheelGraphics.stroke(hue, saturation, brightness);
            wheelGraphics.point(x, y);
          }
        }
      }
      
      function drawHarmonyLines() {
        const points = colorPoints();
        if (points.length < 2) return;
        
        sketch.stroke(255, 255, 255, 100);
        sketch.strokeWeight(2);
        
        // Draw lines connecting all points in harmony
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            sketch.line(
              centerX + points[i].x,
              centerY + points[i].y,
              centerX + points[j].x,
              centerY + points[j].y
            );
          }
        }
      }
      
      function drawColorPoints() {
        const points = colorPoints();
        const selectedIndex = selectedPointIndex();
        
        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          const pointX = centerX + point.x;
          const pointY = centerY + point.y;
          const isSelected = i === selectedIndex;
          const isDragging = i === draggedPointIndex();
          
          // Draw colored circle
          sketch.fill(point.h, point.s, point.b);
          sketch.noStroke();
          sketch.circle(pointX, pointY, 14);
          
          // Draw selection outline (white for selected, gray for others)
          sketch.noFill();
          if (isSelected) {
            sketch.stroke(255, 255, 255, 255); // Bright white outline for selected
            sketch.strokeWeight(3);
          } else {
            sketch.stroke(255, 255, 255, 100); // Subtle white outline for unselected
            sketch.strokeWeight(1);
          }
          sketch.circle(pointX, pointY, 16);
          
          // Draw dragging indicator (pulsing effect)
          if (isDragging) {
            sketch.noFill();
            sketch.stroke(255, 255, 255, 150);
            sketch.strokeWeight(2);
            const pulseSize = 18 + Math.sin(sketch.millis() * 0.01) * 2;
            sketch.circle(pointX, pointY, pulseSize);
          }
        }
      }
      
      sketch.mousePressed = () => {
        if (sketch.mouseX >= 0 && sketch.mouseX < wheelSize && sketch.mouseY >= 0 && sketch.mouseY < wheelSize) {
          const clickedIndex = getClickedPointIndex();
          if (clickedIndex !== -1) {
            setSelectedPointIndex(clickedIndex);
            setDraggedPointIndex(clickedIndex);
            setIsDragging(true);
            isDragging = true;
            updateColorFromMouse(clickedIndex);
          }
        }
      };
      
      sketch.mouseDragged = () => {
        if (isDragging && draggedPointIndex() !== null) {
          updateColorFromMouse(draggedPointIndex()!);
          needsRedraw = true;
        }
      };
      
      sketch.mouseReleased = () => {
        isDragging = false;
        setIsDragging(false);
        setDraggedPointIndex(null);
        
        // Trigger final palette update and render after drag ends
        const points = colorPoints();
        updatePaletteFromPoints(points);
        scheduleRender(true);
      };
      
      function getClickedPointIndex(): number {
        const points = colorPoints();
        const clickRadius = 10;
        
        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          const pointX = centerX + point.x;
          const pointY = centerY + point.y;
          const distance = sketch.dist(sketch.mouseX, sketch.mouseY, pointX, pointY);
          
          if (distance <= clickRadius) {
            return i;
          }
        }
        return -1;
      }
      
      function updateColorFromMouse(pointIndex: number) {
        let dx = sketch.mouseX - centerX;
        let dy = sketch.mouseY - centerY;
        let distance = sketch.sqrt(dx * dx + dy * dy);
        let maxRadius = wheelSize / 2 - 15;
        
        if (distance <= maxRadius) {
          let angle = sketch.degrees(sketch.atan2(dy, dx));
          if (angle < 0) angle += 360;
          
          const points = colorPoints();
          const newPoints = [...points];
          newPoints[pointIndex] = {
            h: angle,
            s: sketch.map(distance, 0, maxRadius, 100, 0),
            b: points[pointIndex].b,
            x: dx,
            y: dy
          };
          
          setColorPoints(newPoints);
          updateHarmonyFromPoint(pointIndex);
          needsRedraw = true;
          
          // Only update palette when not dragging - defer expensive operations
          if (!isDragging) {
            updatePaletteFromPoints(newPoints);
          }
        }
      }
    });
    
    setColorWheelSketch(sketch);
  };
  
  // Initialize background color wheel
  const initializeBackgroundColorWheel = (p: p5) => {
    console.log('ColorManagementPanel: Initializing background color wheel');
    // Simple background color wheel implementation
    const sketch = new p5Lib((sketch: p5) => {
      let wheelSize = 150;
      let centerX, centerY;
      let isDragging = false;
      let needsRedraw = true;
      
      sketch.setup = () => {
        console.log('ColorManagementPanel: Background color wheel setup starting...');
        const canvas = sketch.createCanvas(wheelSize, wheelSize);
        const container = document.getElementById('background-color-wheel-container');
        console.log('ColorManagementPanel: Background color wheel container found:', !!container);
        if (container) {
          canvas.parent('background-color-wheel-container');
          console.log('ColorManagementPanel: Background color wheel canvas parented to container');
        } else {
          console.warn('ColorManagementPanel: Background color wheel container not found');
        }
        centerX = wheelSize / 2;
        centerY = wheelSize / 2;
        sketch.colorMode(sketch.HSB, 360, 100, 100);
      };
      
      sketch.draw = () => {
        if (needsRedraw) {
          sketch.background(0);
          drawBackgroundWheel();
          drawBackgroundIndicator();
          needsRedraw = false;
        }
      };
      
      function drawBackgroundWheel() {
        let maxRadius = wheelSize / 2 - 15;
        for (let angle = 0; angle < 360; angle += 3) {
          for (let radius = 0; radius < maxRadius; radius += 4) {
            let x = centerX + sketch.cos(sketch.radians(angle)) * radius;
            let y = centerY + sketch.sin(sketch.radians(angle)) * radius;
            
            let hue = angle;
            let saturation = sketch.map(radius, 0, maxRadius, 0, 100);
            let brightness = 100;
            
            sketch.stroke(hue, saturation, brightness);
            sketch.point(x, y);
          }
        }
      }
      
      function drawBackgroundIndicator() {
        let indicatorRadius = 6;
        let maxRadius = wheelSize / 2 - 15;
        let color = currentBackgroundColor();
        let indicatorX = centerX + sketch.cos(sketch.radians(color.h)) * sketch.map(color.s, 0, 100, maxRadius, 0);
        let indicatorY = centerY + sketch.sin(sketch.radians(color.h)) * sketch.map(color.s, 0, 100, maxRadius, 0);
        
        sketch.fill(255);
        sketch.noStroke();
        sketch.circle(indicatorX, indicatorY, indicatorRadius * 2);
        sketch.fill(color.h, color.s, color.b);
        sketch.circle(indicatorX, indicatorY, indicatorRadius * 1.5);
      }
      
      sketch.mousePressed = () => {
        if (sketch.mouseX >= 0 && sketch.mouseX < wheelSize && sketch.mouseY >= 0 && sketch.mouseY < wheelSize) {
          isDragging = true;
          updateBackgroundColorFromMouse();
        }
      };
      
      sketch.mouseDragged = () => {
        if (isDragging) {
          updateBackgroundColorFromMouse();
          needsRedraw = true;
        }
      };
      
      sketch.mouseReleased = () => {
        isDragging = false;
      };
      
      function updateBackgroundColorFromMouse() {
        let dx = sketch.mouseX - centerX;
        let dy = sketch.mouseY - centerY;
        let distance = sketch.sqrt(dx * dx + dy * dy);
        let maxRadius = wheelSize / 2 - 15;
        
        if (distance <= maxRadius) {
          let angle = sketch.degrees(sketch.atan2(dy, dx));
          if (angle < 0) angle += 360;
          
          let newColor = {
            h: angle,
            s: sketch.map(distance, 0, maxRadius, 100, 0),
            b: currentBackgroundColor().b
          };
          
          setCurrentBackgroundColor(newColor);
          updateBackgroundColorState(newColor);
          needsRedraw = true;
        }
      }
    });
    
    setBackgroundColorWheelSketch(sketch);
  };
  
  // Update background color state
  const updateBackgroundColorState = (color: { h: number; s: number; b: number }) => {
    const p = p5Instance();
    if (!p) return;
    
    p.colorMode(p.HSB, 360, 100, 100);
    const bgColor = p.color(color.h, color.s, color.b);
    // For now, just update the canvas background directly
    p.background(bgColor);
    scheduleRender(true); // Use deferred rendering system
  };
  
  // Update palette color
  const updatePaletteColor = (index: number, color: { h: number; s: number; b: number }) => {
    const p = p5Instance();
    if (!p) return;
    
    const currentPal = currentPalette();
    const newPalette = [...currentPal];
    
    // Convert HSB to p5.Color
    p.colorMode(p.HSB, 360, 100, 100);
    newPalette[index] = p.color(color.h, color.s, color.b);
    
    // Use the unified function to update both palette and ring colors
    updatePaletteAndRings(newPalette, p);
    scheduleRender(true); // Use deferred rendering system
  };
  
  // Generate new palette based on harmony mode
  const generateHarmonyPalette = () => {
    const p = p5Instance();
    if (!p) return;
    
    const baseHue = Math.random() * 360;
    const points = initializeHarmonyColors(baseHue);
    
    // Update palette immediately for instant feedback
    updatePaletteFromPoints(points);
    
    // Force redraw of color wheel
    if (colorWheelSketch()) {
      colorWheelSketch().forceRedraw();
    }
  };
  
  // Update harmony colors when harmony mode changes
  const handleHarmonyModeChange = (newMode: 'complementary' | 'triadic' | 'tetradic' | 'custom') => {
    setHarmonyMode(newMode);
    console.log('ColorManagementPanel: Harmony mode changed to:', newMode);
    // Reinitialize harmony colors with current base hue or random
    const points = colorPoints();
    const baseHue = points.length > 0 ? points[0].h : Math.random() * 360;
    const newPoints = initializeHarmonyColors(baseHue);
    
    // Update palette immediately for instant feedback
    updatePaletteFromPoints(newPoints);
    
    // Force redraw of color wheel
    if (colorWheelSketch()) {
      colorWheelSketch().forceRedraw();
    }
  };
  
  // Update current color when palette changes
  createEffect(() => {
    const pal = currentPalette();
    const selectedIndex = selectedColorIndex();
    if (pal[selectedIndex]) {
      const p = p5Instance();
      if (p) {
        p.colorMode(p.HSB, 360, 100, 100);
        const hsb = p.hue(pal[selectedIndex]);
        const sat = p.saturation(pal[selectedIndex]);
        const bright = p.brightness(pal[selectedIndex]);
        setCurrentColor({ h: hsb, s: sat, b: bright });
      }
    }
  });
  
  return (
    <div class="color-management-panel">
      <div class="color-panel-header">
        <h3>🎨 Color Management</h3>
      </div>
      
      <div class="color-panel-content">
          {/* Harmony Mode Selector */}
          <div class="harmony-controls">
            <label>Harmony Mode:</label>
            <select 
              value={harmonyMode()}
              onChange={(e) => handleHarmonyModeChange(e.currentTarget.value as any)}
            >
              <option value="complementary">Complementary</option>
              <option value="triadic">Triadic</option>
              <option value="tetradic">Tetradic</option>
              <option value="custom">Custom</option>
            </select>
            <button onClick={generateHarmonyPalette} class="generate-btn">
              Generate Palette
            </button>
          </div>
          
          {/* Color Wheel Section */}
          <div class="color-wheel-section">
            <div class="color-wheel-container">
              <h4>Color Wheel - Drag points to adjust palette</h4>
              <div id="color-wheel-container"></div>
              <div class="brightness-control">
                <label>Brightness: {Math.round(currentColor().b)}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentColor().b}
                  onChange={(e) => {
                    const newColor = { ...currentColor(), b: Number(e.currentTarget.value) };
                    setCurrentColor(newColor);
                    updatePaletteColor(selectedColorIndex(), newColor);
                  }}
                  class="brightness-slider"
                />
              </div>
            </div>
          </div>
          
          {/* Palette Swatches */}
          <div class="palette-section">
            <h4>Palette Colors</h4>
            <div class="palette-swatches">
              <For each={paletteColors()}>
                {(backgroundColor, index) => (
                  <button
                    class={`palette-swatch ${selectedColorIndex() === index() ? 'selected' : ''}`}
                    style={`background-color: ${backgroundColor}`}
                    onClick={() => setSelectedColorIndex(index())}
                  />
                )}
              </For>
            </div>
          </div>
          
          {/* Color Values */}
          <div class="color-values">
            <div>Selected Point: {selectedPointIndex() + 1} of {colorPoints().length}</div>
            <div>HSB: {Math.round(currentColor().h)}°, {Math.round(currentColor().s)}%, {Math.round(currentColor().b)}%</div>
            <div>Click and drag color points to adjust palette</div>
          </div>
          
          {/* Background Color Selector */}
          <div class="background-color-section">
            <h4>Background Color</h4>
            <div class="background-color-controls">
              <div id="background-color-wheel-container"></div>
              <div class="background-color-preview" 
                   style={`background-color: hsl(${currentBackgroundColor().h}, ${currentBackgroundColor().s}%, ${currentBackgroundColor().b}%)`}>
              </div>
              <div class="background-brightness-control">
                <label>Brightness: {Math.round(currentBackgroundColor().b)}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentBackgroundColor().b}
                  onChange={(e) => {
                    const newColor = { ...currentBackgroundColor(), b: Number(e.currentTarget.value) };
                    setCurrentBackgroundColor(newColor);
                    updateBackgroundColorState(newColor);
                  }}
                  class="brightness-slider"
                />
              </div>
            </div>
            <div class="background-color-values">
              <div>Background HSB: {Math.round(currentBackgroundColor().h)}°, {Math.round(currentBackgroundColor().s)}%, {Math.round(currentBackgroundColor().b)}%</div>
            </div>
          </div>
      </div>
    </div>
  );
};
