import { Component, createSignal } from 'solid-js';
import type p5 from 'p5';

interface PositioningTabProps {
  getP: () => p5 | null;
  requestRedraw: () => void;
}

export const PositioningTab: Component<PositioningTabProps> = (props) => {
  console.log('PositioningTab rendered');
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
    <div class="positioning-tab">
      <div class="zoom-controls">
        <div class="control-group">
          <label>Zoom Level: {Math.round(zoomLevel() * 100)}%</label>
          <div class="zoom-buttons">
            <button onClick={zoomOut} class="zoom-button">-</button>
            <button onClick={resetView} class="zoom-button">Reset</button>
            <button onClick={zoomIn} class="zoom-button">+</button>
          </div>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={zoomLevel()}
            onInput={(e) => handleZoomChange(parseFloat(e.target.value))}
            class="zoom-slider"
          />
        </div>

        <div class="control-group">
          <label>Pan X: {panX()}</label>
          <input
            type="range"
            min="-500"
            max="500"
            step="10"
            value={panX()}
            onInput={(e) => handlePanXChange(parseInt(e.target.value))}
            class="pan-slider"
          />
        </div>

        <div class="control-group">
          <label>Pan Y: {panY()}</label>
          <input
            type="range"
            min="-500"
            max="500"
            step="10"
            value={panY()}
            onInput={(e) => handlePanYChange(parseInt(e.target.value))}
            class="pan-slider"
          />
        </div>

        <div class="control-buttons">
          <button onClick={resetView} class="action-button">Reset View</button>
        </div>
      </div>
    </div>
  );
};