import { Component, createSignal } from 'solid-js';
import type p5 from 'p5';
import '../styles/components/performance-positioning-controls.css';

interface PositioningTabProps {
  getP: () => p5 | null;
  requestRedraw: () => void;
}

export const PositioningTab: Component<PositioningTabProps> = (props) => {
  const [zoomLevel, setZoomLevel] = createSignal(1.0);
  const [panX, setPanX] = createSignal(0);
  const [panY, setPanY] = createSignal(0);

  const applyTransform = () => {
    const p = props.getP();
    if (!p) return;

    (window as any).zoomLevel = zoomLevel();
    (window as any).panX = panX();
    (window as any).panY = panY();
    
    p.redraw();
  };

  const resetView = () => {
    setZoomLevel(1.0);
    setPanX(0);
    setPanY(0);
    applyTransform();
  };

  const zoomIn = () => {
    setZoomLevel(Math.min(zoomLevel() * 1.2, 5.0));
    applyTransform();
  };

  const zoomOut = () => {
    setZoomLevel(Math.max(zoomLevel() / 1.2, 0.1));
    applyTransform();
  };

  const handleZoomChange = (value: number) => {
    setZoomLevel(value);
    applyTransform();
  };

  const handlePanXChange = (value: number) => {
    setPanX(value);
    applyTransform();
  };

  const handlePanYChange = (value: number) => {
    setPanY(value);
    applyTransform();
  };

  return (
    <div class="positioning-controls">
      <div class="positioning-header">
        <h3 class="section-title">View Controls</h3>
        <p class="section-description">Zoom and pan to explore your artwork</p>
      </div>
      
      <div class="control-group">
        <label class="control-label">Zoom Level: {Math.round(zoomLevel() * 100)}%</label>
        <div class="zoom-buttons">
          <button onClick={zoomOut} class="control-button">-</button>
          <button onClick={resetView} class="control-button">Reset</button>
          <button onClick={zoomIn} class="control-button">+</button>
        </div>
        <input
          type="range"
          min="0.1"
          max="5.0"
          step="0.1"
          value={zoomLevel()}
          onInput={(e) => handleZoomChange(parseFloat(e.target.value))}
          class="control-range"
        />
      </div>

      <div class="control-group">
        <label class="control-label">Pan X: {panX()}</label>
        <input
          type="range"
          min="-500"
          max="500"
          step="10"
          value={panX()}
          onInput={(e) => handlePanXChange(parseInt(e.target.value))}
          class="control-range"
        />
      </div>

      <div class="control-group">
        <label class="control-label">Pan Y: {panY()}</label>
        <input
          type="range"
          min="-500"
          max="500"
          step="10"
          value={panY()}
          onInput={(e) => handlePanYChange(parseInt(e.target.value))}
          class="control-range"
        />
      </div>

      <div class="control-buttons">
        <button onClick={resetView} class="action-button">Reset View</button>
      </div>
    </div>
  );
};