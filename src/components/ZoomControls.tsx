import { Component, createSignal, onMount, onCleanup } from 'solid-js';
import type p5 from 'p5';

interface ZoomControlsProps {
  getP: () => p5 | null;
  className?: string;
}

export const ZoomControls: Component<ZoomControlsProps> = (props) => {
  const [zoomLevel, setZoomLevel] = createSignal(1.0);
  const [isVisible, setIsVisible] = createSignal(false);
  const [panX, setPanX] = createSignal(0);
  const [panY, setPanY] = createSignal(0);

  // Zoom limits
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 5.0;
  const ZOOM_STEP = 0.1;

  // Pan limits (will be calculated based on zoom)
  const [maxPanX, setMaxPanX] = createSignal(0);
  const [maxPanY, setMaxPanY] = createSignal(0);

  const updatePanLimits = () => {
    const p = props.getP();
    if (!p || !p.canvas) return;

    const canvas = p.canvas as HTMLCanvasElement;
    const currentZoom = zoomLevel();
    
    // Calculate maximum pan based on zoom level
    const maxX = Math.max(0, (canvas.width * currentZoom - canvas.width) / 2);
    const maxY = Math.max(0, (canvas.height * currentZoom - canvas.height) / 2);
    
    setMaxPanX(maxX);
    setMaxPanY(maxY);
    
    // Constrain current pan values
    setPanX(Math.max(-maxX, Math.min(maxX, panX())));
    setPanY(Math.max(-maxY, Math.min(maxY, panY())));
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(MAX_ZOOM, zoomLevel() + ZOOM_STEP);
    setZoomLevel(newZoom);
    updatePanLimits();
    applyTransform();
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(MIN_ZOOM, zoomLevel() - ZOOM_STEP);
    setZoomLevel(newZoom);
    updatePanLimits();
    applyTransform();
  };

  const handleReset = () => {
    setZoomLevel(1.0);
    setPanX(0);
    setPanY(0);
    updatePanLimits();
    applyTransform();
  };

  const handlePan = (deltaX: number, deltaY: number) => {
    const newPanX = Math.max(-maxPanX(), Math.min(maxPanX(), panX() + deltaX));
    const newPanY = Math.max(-maxPanY(), Math.min(maxPanY(), panY() + deltaY));
    
    setPanX(newPanX);
    setPanY(newPanY);
    applyTransform();
  };

  const applyTransform = () => {
    const p = props.getP();
    if (!p) return;

    // Store zoom and pan values globally so p5 sketch can access them
    (window as any).zoomLevel = zoomLevel();
    (window as any).panX = panX();
    (window as any).panY = panY();
    
    // Trigger redraw
    p.redraw();
  };

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel() + delta));
    
    setZoomLevel(newZoom);
    updatePanLimits();
    applyTransform();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isVisible()) return;

    switch (event.key) {
      case '+':
      case '=':
        event.preventDefault();
        handleZoomIn();
        break;
      case '-':
        event.preventDefault();
        handleZoomOut();
        break;
      case '0':
        event.preventDefault();
        handleReset();
        break;
      case 'ArrowUp':
        event.preventDefault();
        handlePan(0, -10);
        break;
      case 'ArrowDown':
        event.preventDefault();
        handlePan(0, 10);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        handlePan(-10, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        handlePan(10, 0);
        break;
    }
  };

  onMount(() => {
    // Add event listeners
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    
    // Initialize pan limits
    updatePanLimits();
  });

  onCleanup(() => {
    document.removeEventListener('wheel', handleWheel);
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div class={`zoom-controls-container ${props.className || ''}`}>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible())}
        class={`zoom-toggle-button ${isVisible() ? 'active' : ''}`}
        title="Toggle zoom controls"
      >
        🔍
      </button>

      {/* Zoom controls panel */}
      {isVisible() && (
        <div class="zoom-controls-panel">
          <div class="controls-header">
            <h4>Zoom & Pan</h4>
            <button
              onClick={() => setIsVisible(false)}
              class="close-controls"
              title="Close zoom controls"
            >
              ×
            </button>
          </div>

          <div class="controls-content">
            {/* Zoom level display */}
            <div class="zoom-info">
              <span>Zoom: {Math.round(zoomLevel() * 100)}%</span>
            </div>

            {/* Zoom controls */}
            <div class="zoom-buttons">
              <button onClick={handleZoomOut} class="zoom-button" title="Zoom Out (-)">
                −
              </button>
              <button onClick={handleReset} class="zoom-button reset" title="Reset (0)">
                ⌂
              </button>
              <button onClick={handleZoomIn} class="zoom-button" title="Zoom In (+)">
                +
              </button>
            </div>

            {/* Pan controls */}
            <div class="pan-controls">
              <div class="pan-row">
                <button 
                  onClick={() => handlePan(0, -10)} 
                  class="pan-button"
                  title="Pan Up (↑)"
                >
                  ↑
                </button>
              </div>
              <div class="pan-row">
                <button 
                  onClick={() => handlePan(-10, 0)} 
                  class="pan-button"
                  title="Pan Left (←)"
                >
                  ←
                </button>
                <button 
                  onClick={() => handlePan(10, 0)} 
                  class="pan-button"
                  title="Pan Right (→)"
                >
                  →
                </button>
              </div>
              <div class="pan-row">
                <button 
                  onClick={() => handlePan(0, 10)} 
                  class="pan-button"
                  title="Pan Down (↓)"
                >
                  ↓
                </button>
              </div>
            </div>

            {/* Pan position display */}
            <div class="pan-info">
              <div class="info-row">
                <span>Pan X:</span>
                <span>{panX().toFixed(0)}</span>
              </div>
              <div class="info-row">
                <span>Pan Y:</span>
                <span>{panY().toFixed(0)}</span>
              </div>
            </div>

            {/* Keyboard shortcuts info */}
            <div class="shortcuts-info">
              <h5>Keyboard Shortcuts:</h5>
              <div class="shortcut-row">+ / - : Zoom in/out</div>
              <div class="shortcut-row">0 : Reset zoom</div>
              <div class="shortcut-row">Arrow keys : Pan</div>
              <div class="shortcut-row">Mouse wheel : Zoom</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
